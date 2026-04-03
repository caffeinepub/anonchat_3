import { AnimatePresence } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import ChatPage from "./ChatPage";
import GenderModal, { type MatchPreference } from "./GenderModal";
import HomePage from "./HomePage";
import { Gender, type Message } from "./backend";
import { useActor } from "./hooks/useActor";

const STORAGE_KEY = "anonchat_uid";
const GENDER_KEY = "anonchat_gender";

function getOrCreateUserId(): string {
  let uid = localStorage.getItem(STORAGE_KEY);
  if (!uid) {
    uid = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY, uid);
  }
  return uid;
}

function loadStoredGender(): "male" | "female" | null {
  const stored = localStorage.getItem(GENDER_KEY);
  if (stored === "male" || stored === "female") return stored;
  return null;
}

export type AppState = "idle" | "searching" | "matched" | "disconnected";
export type MyGender = "male" | "female";

export interface Stats {
  onlineUsers: bigint;
  waitingUsers: bigint;
}

export default function App() {
  const { actor, isFetching } = useActor();

  const [userId] = useState<string>(getOrCreateUserId);
  const [myGender, setMyGenderState] = useState<MyGender | null>(
    loadStoredGender,
  );
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [appState, setAppState] = useState<AppState>("idle");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [stats, setStats] = useState<Stats>({
    onlineUsers: 0n,
    waitingUsers: 0n,
  });
  const [waitingTooLong, setWaitingTooLong] = useState(false);

  const lastTimestampRef = useRef<bigint>(0n);
  const waitingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setMyGender = useCallback((g: MyGender) => {
    localStorage.setItem(GENDER_KEY, g);
    setMyGenderState(g);
  }, []);

  // Map MyGender -> Gender enum
  const toGenderEnum = useCallback((g: MyGender): Gender => {
    return g === "male" ? Gender.male : Gender.female;
  }, []);

  // Opposite gender for preference
  const oppositeGender = useCallback((g: MyGender): Gender => {
    return g === "male" ? Gender.female : Gender.male;
  }, []);

  // Map MatchPreference to backend Gender enum.
  // "anyone" falls back to opposite gender (backend doesn't support wildcard).
  const prefToGenderEnum = useCallback(
    (pref: MatchPreference, ownGender: MyGender): Gender => {
      if (pref === "male") return Gender.male;
      if (pref === "female") return Gender.female;
      // "anyone": use opposite gender as preference (default behaviour)
      return oppositeGender(ownGender);
    },
    [oppositeGender],
  );

  // Core join queue logic
  const joinQueue = useCallback(
    async (gender: MyGender, matchPref: MatchPreference) => {
      if (!actor || isFetching) return;
      try {
        const result = await actor.joinQueue(
          userId,
          toGenderEnum(gender),
          prefToGenderEnum(matchPref, gender),
        );
        if (result.__kind__ === "matched") {
          setSessionId(result.matched);
          setAppState("matched");
        } else {
          setAppState("searching");
        }
      } catch (err) {
        console.error("joinQueue error:", err);
      }
    },
    [actor, isFetching, userId, toGenderEnum, prefToGenderEnum],
  );

  // Initial heartbeat on mount — only if gender is set
  useEffect(() => {
    if (!actor || isFetching || !myGender) return;
    void actor.heartbeat(userId, toGenderEnum(myGender)).catch(() => {});
  }, [actor, isFetching, userId, myGender, toGenderEnum]);

  // Heartbeat interval — every 5s, only if gender is set
  useEffect(() => {
    if (!actor || isFetching || !myGender) return;
    const id = setInterval(() => {
      void actor.heartbeat(userId, toGenderEnum(myGender)).catch(() => {});
    }, 5000);
    return () => clearInterval(id);
  }, [actor, isFetching, userId, myGender, toGenderEnum]);

  // Stats refresh — every 5s
  useEffect(() => {
    if (!actor || isFetching) return;
    const refresh = async () => {
      try {
        const s = await actor.getStats();
        setStats(s);
      } catch {}
    };
    void refresh();
    const id = setInterval(refresh, 5000);
    return () => clearInterval(id);
  }, [actor, isFetching]);

  // Cleanup trigger — every 10s
  useEffect(() => {
    if (!actor || isFetching) return;
    const id = setInterval(() => {
      void actor.cleanupStale().catch(() => {});
    }, 10000);
    return () => clearInterval(id);
  }, [actor, isFetching]);

  // Match polling — every 2s, only when searching
  useEffect(() => {
    if (!actor || isFetching || appState !== "searching") return;
    const id = setInterval(async () => {
      try {
        const result = await actor.checkMatch(userId);
        if (result) {
          setSessionId(result);
          setAppState("matched");
          setWaitingTooLong(false);
          if (waitingTimerRef.current) {
            clearTimeout(waitingTimerRef.current);
            waitingTimerRef.current = null;
          }
        }
      } catch {}
    }, 2000);
    return () => clearInterval(id);
  }, [actor, isFetching, appState, userId]);

  // Waiting too long detection — show message after 5s of searching
  useEffect(() => {
    if (appState === "searching") {
      waitingTimerRef.current = setTimeout(() => {
        setWaitingTooLong(true);
      }, 5000);
    } else {
      setWaitingTooLong(false);
      if (waitingTimerRef.current) {
        clearTimeout(waitingTimerRef.current);
        waitingTimerRef.current = null;
      }
    }
    return () => {
      if (waitingTimerRef.current) {
        clearTimeout(waitingTimerRef.current);
      }
    };
  }, [appState]);

  // Message polling — every 2s, only when matched
  useEffect(() => {
    if (!actor || isFetching || appState !== "matched" || !sessionId) return;
    const id = setInterval(async () => {
      try {
        const newMsgs = await actor.getMessages(
          sessionId,
          lastTimestampRef.current,
        );
        if (newMsgs.length > 0) {
          setMessages((prev) => [...prev, ...newMsgs]);
          lastTimestampRef.current = newMsgs[newMsgs.length - 1].timestamp;
        }
      } catch {}
    }, 2000);
    return () => clearInterval(id);
  }, [actor, isFetching, appState, sessionId]);

  // Reset message state when leaving matched state
  useEffect(() => {
    if (appState !== "matched") {
      setMessages([]);
      lastTimestampRef.current = 0n;
    }
  }, [appState]);

  const handleFindStranger = useCallback(async () => {
    if (!actor || isFetching) return;
    // Always show the modal so the user can pick their match preference
    setShowGenderModal(true);
  }, [actor, isFetching]);

  const handleGenderSelectedInModal = useCallback(
    async (g: MyGender, matchPref: MatchPreference) => {
      // Save gender (persist in local storage)
      setMyGender(g);
      // Close modal
      setShowGenderModal(false);
      // Start matching with selected preference (NOT persisted)
      await joinQueue(g, matchPref);
    },
    [setMyGender, joinQueue],
  );

  const handleResetGender = useCallback(() => {
    // Only allow reset when idle
    if (appState !== "idle") return;
    localStorage.removeItem(GENDER_KEY);
    setMyGenderState(null);
  }, [appState]);

  const handleCancelSearch = useCallback(async () => {
    if (!actor) return;
    try {
      await actor.leaveQueue(userId);
    } catch {}
    setAppState("idle");
  }, [actor, userId]);

  const handleDisconnect = useCallback(async () => {
    if (!actor || !sessionId) return;
    try {
      await actor.disconnect(sessionId, userId);
    } catch {}
    setSessionId(null);
    setAppState("disconnected");
  }, [actor, sessionId, userId]);

  const handleSendMessage = useCallback(
    async (text: string): Promise<boolean> => {
      if (!actor || !sessionId || !text.trim()) return false;
      try {
        return await actor.sendMessage(sessionId, userId, text.trim());
      } catch {
        return false;
      }
    },
    [actor, sessionId, userId],
  );

  const handleFindNewStranger = useCallback(() => {
    setAppState("idle");
    setSessionId(null);
  }, []);

  if (appState === "matched" || appState === "disconnected") {
    return (
      <ChatPage
        userId={userId}
        messages={messages}
        appState={appState}
        onDisconnect={handleDisconnect}
        onSendMessage={handleSendMessage}
        onFindNewStranger={handleFindNewStranger}
      />
    );
  }

  return (
    <>
      <HomePage
        myGender={myGender}
        appState={appState}
        stats={stats}
        waitingTooLong={waitingTooLong}
        onFindStranger={handleFindStranger}
        onCancelSearch={handleCancelSearch}
        onResetGender={handleResetGender}
        isActorReady={!!actor && !isFetching}
      />
      <AnimatePresence>
        {showGenderModal && (
          <GenderModal onSelect={handleGenderSelectedInModal} />
        )}
      </AnimatePresence>
    </>
  );
}
