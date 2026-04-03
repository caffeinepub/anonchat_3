import { AnimatePresence, motion } from "motion/react";
import type { AppState, MyGender, Stats } from "./App";

interface HomePageProps {
  myGender: MyGender | null;
  appState: AppState;
  stats: Stats;
  waitingTooLong: boolean;
  onFindStranger: () => void;
  onCancelSearch: () => void;
  onResetGender: () => void;
  isActorReady: boolean;
}

function AnonChatLogo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative w-8 h-8">
        <svg
          width="32"
          height="32"
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
        className="text-xl font-bold tracking-tight"
        style={{ color: "var(--color-text-primary)" }}
      >
        Anon<span style={{ color: "var(--color-accent-cyan)" }}>Chat</span>
      </span>
    </div>
  );
}

function SearchingDots() {
  return (
    <span className="inline-flex gap-1 ml-1">
      <span
        className="w-1.5 h-1.5 rounded-full dot-1"
        style={{ background: "var(--color-accent-cyan)" }}
      />
      <span
        className="w-1.5 h-1.5 rounded-full dot-2"
        style={{ background: "var(--color-accent-cyan)" }}
      />
      <span
        className="w-1.5 h-1.5 rounded-full dot-3"
        style={{ background: "var(--color-accent-cyan)" }}
      />
    </span>
  );
}

function HowItWorksStep({
  number,
  icon,
  title,
  description,
}: {
  number: string;
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <motion.div
      className="surface-card p-6 flex flex-col gap-4"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center gap-3">
        <span
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
          style={{
            background: "rgba(33, 212, 230, 0.12)",
            border: "1px solid rgba(33, 212, 230, 0.3)",
            color: "var(--color-accent-cyan)",
          }}
        >
          {number}
        </span>
        <span className="text-2xl">{icon}</span>
      </div>
      <div>
        <h3
          className="font-semibold text-base mb-1.5"
          style={{ color: "var(--color-text-primary)" }}
        >
          {title}
        </h3>
        <p
          className="text-sm leading-relaxed"
          style={{ color: "var(--color-text-muted)" }}
        >
          {description}
        </p>
      </div>
    </motion.div>
  );
}

export default function HomePage({
  myGender,
  appState,
  stats,
  waitingTooLong,
  onFindStranger,
  onCancelSearch,
  onResetGender,
  isActorReady,
}: HomePageProps) {
  const isSearching = appState === "searching";
  const isIdle = appState === "idle";
  const canSearch = isActorReady;

  const genderLabel =
    myGender === "male"
      ? "👨 Male"
      : myGender === "female"
        ? "👩 Female"
        : null;

  return (
    <div
      className="min-h-screen flex flex-col bg-grid relative overflow-x-hidden"
      style={{ background: "var(--color-bg)" }}
    >
      {/* Ambient glow orbs */}
      <div
        className="glow-orb-cyan"
        style={{ top: "-100px", left: "-100px", opacity: 0.7 }}
      />
      <div
        className="glow-orb-purple"
        style={{ top: "200px", right: "-150px", opacity: 0.6 }}
      />

      {/* Navbar */}
      <header
        className="relative z-10 border-b"
        style={{ borderColor: "var(--color-border-subtle)" }}
      >
        <nav className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <AnonChatLogo />
          <div className="flex items-center gap-3">
            {/* Change gender chip — only visible when gender is set and idle */}
            <AnimatePresence>
              {myGender !== null && isIdle && (
                <motion.button
                  type="button"
                  data-ocid="home.reset_gender.button"
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ duration: 0.2 }}
                  onClick={onResetGender}
                  className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full transition-all"
                  style={{
                    background: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    color: "var(--color-text-muted)",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor =
                      "rgba(180, 76, 255, 0.35)";
                    e.currentTarget.style.color = "var(--color-accent-purple)";
                    e.currentTarget.style.background =
                      "rgba(180, 76, 255, 0.07)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor =
                      "rgba(255, 255, 255, 0.1)";
                    e.currentTarget.style.color = "var(--color-text-muted)";
                    e.currentTarget.style.background =
                      "rgba(255, 255, 255, 0.04)";
                  }}
                  title="Change your gender"
                >
                  <span>{genderLabel}</span>
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <path
                      d="M8.5 1.5L10.5 3.5L4 10H2V8L8.5 1.5Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </motion.button>
              )}
            </AnimatePresence>

            <div
              className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-full"
              style={{
                background: "rgba(33, 212, 230, 0.07)",
                border: "1px solid rgba(33, 212, 230, 0.2)",
              }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: "#22c55e", boxShadow: "0 0 4px #22c55e" }}
              />
              <span style={{ color: "var(--color-text-secondary)" }}>
                Anonymous
              </span>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex-1">
        <section className="max-w-6xl mx-auto px-6 pt-16 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Column — Controls */}
            <motion.div
              className="flex flex-col gap-8"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              {/* Headline */}
              <div className="flex flex-col gap-4">
                <div
                  className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full self-start"
                  style={{
                    background: "rgba(180, 76, 255, 0.1)",
                    border: "1px solid rgba(180, 76, 255, 0.25)",
                    color: "#B44CFF",
                  }}
                >
                  <span>&#x26A1;</span>
                  <span>100% Anonymous &middot; No Sign-up</span>
                </div>
                <h1
                  className="text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight tracking-tight font-display"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  Chat{" "}
                  <span
                    className="text-glow-cyan"
                    style={{ color: "var(--color-accent-cyan)" }}
                  >
                    Anonymously.
                  </span>
                </h1>
                <p
                  className="text-base lg:text-lg leading-relaxed max-w-md"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  Connect with random strangers instantly. No sign-up, no
                  tracking, no history. Just real conversations.
                </p>
              </div>

              {/* CTA Button */}
              <div className="flex flex-col gap-4">
                {isIdle && (
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      data-ocid="home.find_stranger.primary_button"
                      className="btn-find-stranger text-base font-bold self-start"
                      onClick={onFindStranger}
                      disabled={!canSearch}
                      aria-disabled={!canSearch}
                    >
                      {!isActorReady
                        ? "Connecting..."
                        : "\u{1F500} Find Stranger"}
                    </button>
                  </div>
                )}

                {isSearching && (
                  <div className="flex flex-col gap-3">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={waitingTooLong ? "waiting" : "searching"}
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.3 }}
                        className="flex items-center gap-2 text-sm"
                        style={{
                          color: waitingTooLong
                            ? "var(--color-text-muted)"
                            : "var(--color-accent-cyan)",
                        }}
                        data-ocid="home.search_status.section"
                      >
                        {waitingTooLong ? (
                          <span>
                            &#x23F3; No users online right now, please wait...
                          </span>
                        ) : (
                          <>
                            <span>Searching for a stranger</span>
                            <SearchingDots />
                          </>
                        )}
                      </motion.div>
                    </AnimatePresence>
                    <button
                      type="button"
                      data-ocid="home.cancel_search.secondary_button"
                      className="self-start px-5 py-2.5 rounded-full text-sm font-medium transition-all"
                      style={{
                        background: "rgba(255, 255, 255, 0.06)",
                        border: "1px solid rgba(255, 255, 255, 0.15)",
                        color: "var(--color-text-secondary)",
                      }}
                      onClick={onCancelSearch}
                    >
                      &times; Cancel Search
                    </button>
                  </div>
                )}
              </div>

              {/* Stats Row */}
              <motion.div
                className="flex items-center gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                data-ocid="home.stats.section"
              >
                <div className="flex flex-col gap-0.5">
                  <span
                    className="text-2xl font-bold"
                    style={{ color: "var(--color-accent-cyan)" }}
                  >
                    {stats.onlineUsers.toString()}
                  </span>
                  <span
                    className="text-xs"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    Users Online
                  </span>
                </div>
                <div className="stats-divider" />
                <div className="flex flex-col gap-0.5">
                  <span
                    className="text-2xl font-bold"
                    style={{ color: "var(--color-accent-purple)" }}
                  >
                    {stats.waitingUsers.toString()}
                  </span>
                  <span
                    className="text-xs"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    Users Waiting
                  </span>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Column — Chat Preview */}
            <motion.div
              className="hidden lg:flex justify-center items-center"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            >
              <div
                className="relative rounded-3xl overflow-hidden"
                style={{
                  border: "1px solid rgba(33, 212, 230, 0.15)",
                  boxShadow:
                    "0 0 0 1px rgba(33,212,230,0.08), 0 20px 60px rgba(0,0,0,0.6), 0 0 80px rgba(180,76,255,0.12)",
                  maxWidth: "420px",
                  width: "100%",
                }}
              >
                {/* Window chrome */}
                <div
                  className="flex items-center gap-2 px-4 py-3"
                  style={{
                    background: "#0d1321",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <span className="w-3 h-3 rounded-full bg-red-500/60" />
                  <span className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <span className="w-3 h-3 rounded-full bg-green-500/60" />
                  <span
                    className="ml-2 text-xs"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    AnonChat &mdash; Stranger
                  </span>
                </div>
                {/* Chat preview image */}
                <img
                  src="/assets/generated/chat-preview-mockup.dim_480x520.png"
                  alt="Chat preview showing sample anonymous conversation"
                  className="w-full block"
                  style={{ maxHeight: "380px", objectFit: "cover" }}
                />
              </div>
            </motion.div>
          </div>
        </section>

        {/* How it Works */}
        <section
          className="relative z-10 border-t"
          style={{ borderColor: "var(--color-border-subtle)" }}
          data-ocid="home.how_it_works.section"
        >
          <div className="max-w-6xl mx-auto px-6 py-16">
            <motion.div
              className="text-center mb-10"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2
                className="text-2xl lg:text-3xl font-bold mb-3 font-display"
                style={{ color: "var(--color-text-primary)" }}
              >
                How It{" "}
                <span style={{ color: "var(--color-accent-cyan)" }}>Works</span>
              </h2>
              <p
                className="text-sm"
                style={{ color: "var(--color-text-muted)" }}
              >
                Three simple steps to start chatting anonymously
              </p>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <HowItWorksStep
                number="1"
                icon="\u{1F3AD}"
                title="Stay Anonymous"
                description="No account needed. We generate a unique ID for you automatically — no names, no emails."
              />
              <HowItWorksStep
                number="2"
                icon="\u{1F500}"
                title="Get Matched"
                description="Click 'Find Stranger' — select your gender once and our system matches you with someone of the opposite gender instantly."
              />
              <HowItWorksStep
                number="3"
                icon="\u{1F4AC}"
                title="Chat Freely"
                description="Enjoy a private one-on-one conversation. Disconnect anytime with no trace left behind."
              />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer
        className="relative z-10 border-t py-6"
        style={{ borderColor: "var(--color-border-subtle)" }}
      >
        <div
          className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs"
          style={{ color: "var(--color-text-muted)" }}
        >
          <div className="flex items-center gap-2">
            <AnonChatLogo />
          </div>
          <span>
            &copy; {new Date().getFullYear()}. Built with &#10084;&#65039; using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
              style={{ color: "var(--color-accent-cyan)" }}
            >
              caffeine.ai
            </a>
          </span>
        </div>
      </footer>
    </div>
  );
}
