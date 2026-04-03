import { AnimatePresence, motion } from "motion/react";
import { type KeyboardEvent, useEffect, useRef, useState } from "react";
import type { AppState } from "./App";
import type { Message } from "./backend";

interface ChatPageProps {
  userId: string;
  messages: Message[];
  appState: AppState;
  onDisconnect: () => void;
  onSendMessage: (text: string) => Promise<boolean>;
  onFindNewStranger: () => void;
}

function AnonChatLogo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative w-7 h-7">
        <svg
          width="28"
          height="28"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          role="presentation"
        >
          <rect
            x="2"
            y="4"
            width="18"
            height="14"
            rx="5"
            fill="#21D4E6"
            opacity="0.9"
          />
          <rect
            x="12"
            y="11"
            width="18"
            height="14"
            rx="5"
            fill="#B44CFF"
            opacity="0.9"
          />
          <path d="M4 18 L4 22 L8 18" fill="#21D4E6" opacity="0.9" />
          <path d="M28 25 L28 29 L24 25" fill="#B44CFF" opacity="0.9" />
        </svg>
      </div>
      <span
        className="text-lg font-bold tracking-tight"
        style={{ color: "var(--color-text-primary)" }}
      >
        Anon<span style={{ color: "var(--color-accent-cyan)" }}>Chat</span>
      </span>
    </div>
  );
}

function formatTime(timestamp: bigint): string {
  // timestamp is in nanoseconds
  const ms = Number(timestamp / 1_000_000n);
  const d = new Date(ms);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function ChatPage({
  userId,
  messages,
  appState,
  onDisconnect,
  onSendMessage,
  onFindNewStranger,
}: ChatPageProps) {
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isDisconnected = appState === "disconnected";

  // Auto-scroll to bottom on new messages
  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll triggered by messages array reference change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when connected
  useEffect(() => {
    if (!isDisconnected) {
      inputRef.current?.focus();
    }
  }, [isDisconnected]);

  const handleSend = async () => {
    if (!inputText.trim() || isSending || isDisconnected) return;
    const text = inputText;
    setInputText("");
    setIsSending(true);
    try {
      await onSendMessage(text);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  return (
    <div
      className="h-screen flex flex-col"
      style={{ background: "var(--color-bg)" }}
    >
      {/* Header */}
      <header
        className="flex items-center justify-between px-4 lg:px-6 py-4 flex-shrink-0"
        style={{
          background: "var(--color-surface)",
          borderBottom: "1px solid var(--color-border-subtle)",
        }}
      >
        <AnonChatLogo />

        {/* Status indicator */}
        {!isDisconnected ? (
          <div
            className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-full"
            style={{
              background: "rgba(34, 197, 94, 0.1)",
              border: "1px solid rgba(34, 197, 94, 0.25)",
            }}
            data-ocid="chat.connection_status.section"
          >
            <span
              className="w-2 h-2 rounded-full pulse-dot"
              style={{ background: "#22c55e" }}
            />
            <span style={{ color: "#86efac" }} className="hidden sm:inline">
              Connected to a stranger
            </span>
            <span style={{ color: "#86efac" }} className="sm:hidden">
              Connected
            </span>
          </div>
        ) : (
          <div
            className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-full"
            style={{
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.25)",
            }}
            data-ocid="chat.disconnect_status.section"
          >
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span style={{ color: "#fca5a5" }}>Disconnected</span>
          </div>
        )}

        {/* Disconnect button */}
        {!isDisconnected && (
          <button
            type="button"
            data-ocid="chat.disconnect.delete_button"
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all"
            style={{
              background: "rgba(239, 68, 68, 0.12)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              color: "#fca5a5",
            }}
            onClick={onDisconnect}
          >
            <span>&#x26D4;</span>
            <span className="hidden sm:inline">Disconnect</span>
          </button>
        )}
      </header>

      {/* Messages Area */}
      <main
        className="flex-1 overflow-y-auto relative"
        style={{ background: "var(--color-bg)" }}
      >
        {/* Subtle background grid */}
        <div
          className="absolute inset-0 bg-grid opacity-40 pointer-events-none"
          aria-hidden="true"
        />

        <div className="relative z-10 max-w-3xl mx-auto px-4 py-6 flex flex-col gap-3 min-h-full">
          {/* Session start marker */}
          <div className="flex items-center gap-3 my-2">
            <div
              className="flex-1 h-px"
              style={{ background: "var(--color-border-subtle)" }}
            />
            <span
              className="text-xs px-3"
              style={{ color: "var(--color-text-muted)" }}
            >
              Chat started &bull; Anonymous
            </span>
            <div
              className="flex-1 h-px"
              style={{ background: "var(--color-border-subtle)" }}
            />
          </div>

          {/* Empty state */}
          {messages.length === 0 && !isDisconnected && (
            <motion.div
              className="flex flex-col items-center justify-center py-12 gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              data-ocid="chat.messages.empty_state"
            >
              <span className="text-4xl" aria-hidden="true">
                &#x1F44B;
              </span>
              <p
                className="text-sm text-center max-w-xs"
                style={{ color: "var(--color-text-muted)" }}
              >
                You&apos;re connected! Say hi to your anonymous chat partner.
              </p>
            </motion.div>
          )}

          {/* Messages */}
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => {
              const isOwn = msg.sender === userId;
              return (
                <motion.div
                  key={`${msg.timestamp.toString()}-${i}`}
                  data-ocid={`chat.messages.item.${i + 1}`}
                  className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                  initial={{ opacity: 0, y: 10, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <div
                    className={`max-w-xs lg:max-w-md flex flex-col gap-1 ${
                      isOwn ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`px-4 py-2.5 text-sm leading-relaxed ${
                        isOwn ? "msg-outgoing" : "msg-incoming"
                      }`}
                    >
                      {msg.content}
                    </div>
                    <span
                      className="text-xs px-1"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area or Disconnected Banner */}
      <AnimatePresence mode="wait">
        {isDisconnected ? (
          <motion.div
            key="disconnected"
            data-ocid="chat.disconnected.section"
            className="flex-shrink-0 flex flex-col items-center gap-4 px-4 py-6"
            style={{
              background: "var(--color-surface)",
              borderTop: "1px solid var(--color-border-subtle)",
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <div className="text-center">
              <p
                className="font-semibold mb-1"
                style={{ color: "var(--color-text-primary)" }}
              >
                You have been disconnected
              </p>
              <p
                className="text-sm"
                style={{ color: "var(--color-text-muted)" }}
              >
                The chat session has ended.
              </p>
            </div>
            <button
              type="button"
              data-ocid="chat.find_new_stranger.primary_button"
              className="btn-find-stranger text-sm"
              onClick={onFindNewStranger}
            >
              &#x1F500; Find New Stranger
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="input"
            className="flex-shrink-0 px-4 lg:px-6 py-4"
            style={{
              background: "var(--color-surface)",
              borderTop: "1px solid var(--color-border-subtle)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="max-w-3xl mx-auto flex items-center gap-3">
              <input
                ref={inputRef}
                data-ocid="chat.message.input"
                type="text"
                className="chat-input"
                placeholder="Type a message..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                maxLength={500}
                disabled={isDisconnected}
                aria-label="Message input"
              />
              <button
                type="button"
                data-ocid="chat.send.submit_button"
                className="send-btn"
                onClick={() => void handleSend()}
                disabled={!inputText.trim() || isSending || isDisconnected}
                aria-label="Send message"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  role="presentation"
                >
                  <path d="M22 2L11 13" />
                  <path d="M22 2L15 22 11 13 2 9l20-7z" />
                </svg>
              </button>
            </div>
            <p
              className="max-w-3xl mx-auto mt-2 text-xs text-right"
              style={{ color: "var(--color-text-muted)" }}
            >
              {inputText.length}/500 &middot; Press Enter to send
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
