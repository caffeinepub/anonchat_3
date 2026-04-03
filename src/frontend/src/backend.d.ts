import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type UserId = string;
export type Time = bigint;
export interface Stats {
    onlineUsers: bigint;
    waitingUsers: bigint;
}
export interface Message {
    content: string;
    sender: UserId;
    timestamp: Time;
}
export type SessionId = string;
export type QueueResult = {
    __kind__: "matched";
    matched: SessionId;
} | {
    __kind__: "waiting";
    waiting: null;
};
export enum Gender {
    female = "female",
    male = "male"
}
export interface backendInterface {
    checkMatch(userId: UserId): Promise<SessionId | null>;
    cleanupStale(): Promise<void>;
    disconnect(sessionId: SessionId, userId: UserId): Promise<void>;
    getMessages(sessionId: SessionId, since: Time): Promise<Array<Message>>;
    getStats(): Promise<Stats>;
    heartbeat(userId: UserId, ownGender: Gender): Promise<void>;
    joinQueue(userId: UserId, ownGender: Gender, preference: Gender): Promise<QueueResult>;
    leaveQueue(userId: UserId): Promise<void>;
    sendMessage(sessionId: SessionId, userId: UserId, text: string): Promise<boolean>;
}
