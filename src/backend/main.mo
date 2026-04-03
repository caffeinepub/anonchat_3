import Map "mo:core/Map";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Order "mo:core/Order";



actor {
  type UserId = Text;
  type SessionId = Text;
  type Gender = { #male; #female };

  type User = {
    id : UserId;
    ownGender : Gender;
    preference : Gender;
    lastSeen : Time.Time;
    inQueue : Bool;
    queuedAt : Time.Time;
  };

  type Message = {
    sender : UserId;
    content : Text;
    timestamp : Time.Time;
  };

  type Session = {
    id : SessionId;
    user1Id : UserId;
    user2Id : UserId;
    messages : [Message];
    active : Bool;
  };

  type QueueResult = {
    #waiting;
    #matched : SessionId;
  };

  type Stats = {
    onlineUsers : Nat;
    waitingUsers : Nat;
  };

  let users = Map.empty<UserId, User>();
  let sessions = Map.empty<SessionId, Session>();

  module User {
    func compare(lhs : User, rhs : User) : Order.Order {
      lhs.id.compare(rhs.id);
    };
  };

  module Session {
    func compare(lhs : Session, rhs : Session) : Order.Order {
      lhs.id.compare(rhs.id);
    };
  };

  public shared ({ caller }) func heartbeat(userId : UserId, ownGender : Gender) : async () {
    let now = Time.now();
    let user : User = {
      id = userId;
      ownGender;
      preference = switch (ownGender) {
        case (#male) { #female };
        case (#female) { #male };
      };
      lastSeen = now;
      inQueue = false;
      queuedAt = 0;
    };
    users.add(userId, user);
  };

  public query ({ caller }) func getStats() : async Stats {
    let now = Time.now();
    let onlineUsers = users.values().toArray().filter(func(u) { now - u.lastSeen < 15 * 1_000_000_000 }).size();
    let waitingUsers = users.values().toArray().filter(func(u) { u.inQueue }).size();
    {
      onlineUsers;
      waitingUsers;
    };
  };

  public shared ({ caller }) func joinQueue(userId : UserId, ownGender : Gender, preference : Gender) : async QueueResult {
    switch (users.get(userId)) {
      case (null) { Runtime.trap("User does not exist") };
      case (?user) {
        if (user.inQueue) { Runtime.trap("User already in queue") };

        let updatedUser = {
          id = user.id;
          ownGender;
          preference;
          lastSeen = user.lastSeen;
          inQueue = true;
          queuedAt = Time.now();
        };

        users.add(userId, updatedUser);

        switch (findMatch(userId, ownGender, preference)) {
          case (null) { #waiting };
          case (?matchedId) {
            let sessionId = createSession(userId, matchedId);
            #matched(sessionId);
          };
        };
      };
    };
  };

  public query ({ caller }) func checkMatch(userId : UserId) : async ?SessionId {
    null;
  };

  public shared ({ caller }) func leaveQueue(userId : UserId) : async () {
    switch (users.get(userId)) {
      case (null) { Runtime.trap("User does not exist") };
      case (?user) {
        if (user.inQueue) {
          let updatedUser = {
            id = user.id;
            ownGender = user.ownGender;
            preference = user.preference;
            lastSeen = user.lastSeen;
            inQueue = false;
            queuedAt = 0;
          };
          users.add(userId, updatedUser);
        };
      };
    };
  };

  public shared ({ caller }) func sendMessage(sessionId : SessionId, userId : UserId, text : Text) : async Bool {
    switch (sessions.get(sessionId)) {
      case (null) { false };
      case (?session) {
        if (not session.active) { false } else {
          let message = {
            sender = userId;
            content = text;
            timestamp = Time.now();
          };

          let updatedSession = {
            id = session.id;
            user1Id = session.user1Id;
            user2Id = session.user2Id;
            messages = session.messages.concat([message]);
            active = true;
          };

          sessions.add(sessionId, updatedSession);
          true;
        };
      };
    };
  };

  public query ({ caller }) func getMessages(sessionId : SessionId, since : Time.Time) : async [Message] {
    switch (sessions.get(sessionId)) {
      case (null) { Runtime.trap("Session does not exist") };
      case (?session) {
        session.messages.filter(func(m) { m.timestamp > since });
      };
    };
  };

  public shared ({ caller }) func disconnect(sessionId : SessionId, userId : UserId) : async () {
    switch (sessions.get(sessionId)) {
      case (null) { Runtime.trap("Session does not exist") };
      case (?session) {
        if (not session.active) { Runtime.trap("Session already inactive") };

        let updatedSession = {
          id = session.id;
          user1Id = session.user1Id;
          user2Id = session.user2Id;
          messages = session.messages;
          active = false;
        };

        sessions.add(sessionId, updatedSession);
        removeFromQueue(session.user1Id);
        removeFromQueue(session.user2Id);
      };
    };
  };

  public shared ({ caller }) func cleanupStale() : async () {
    let now = Time.now();
    let filteredUsers = users.entries().toArray().filter(
      func(entry) {
        let user = entry.1;
        let isActive = now - user.lastSeen < 15 * 1_000_000_000;
        let isQueueValid = if (user.inQueue) {
          now - user.queuedAt < 60 * 1_000_000_000;
        } else { true };
        isActive and isQueueValid;
      }
    );

    let newUsers = Map.empty<UserId, User>();
    for ((id, user) in filteredUsers.values()) {
      newUsers.add(id, user);
    };
    users.clear();
    for ((id, user) in newUsers.entries()) {
      users.add(id, user);
    };
  };

  func findMatch(userId : UserId, ownGender : Gender, preference : Gender) : ?UserId {
    users.entries().toArray().find(
      func(entry) {
        let (id, otherUser) = entry;
        userId != otherUser.id and
        otherUser.inQueue and
        ownGender == otherUser.preference and
        otherUser.ownGender == preference
      }
    ).map(func((id, _)) { id });
  };

  func createSession(user1Id : UserId, user2Id : UserId) : SessionId {
    let sessionId = user1Id.concat(user2Id).concat(Time.now().toText());

    let session = {
      id = sessionId;
      user1Id;
      user2Id;
      messages = [];
      active = true;
    };

    sessions.add(sessionId, session);
    removeFromQueue(user1Id);
    removeFromQueue(user2Id);
    sessionId;
  };

  func removeFromQueue(userId : UserId) {
    switch (users.get(userId)) {
      case (null) {};
      case (?user) {
        let updatedUser = {
          id = user.id;
          ownGender = user.ownGender;
          preference = user.preference;
          lastSeen = user.lastSeen;
          inQueue = false;
          queuedAt = 0;
        };
        users.add(userId, updatedUser);
      };
    };
  };
};
