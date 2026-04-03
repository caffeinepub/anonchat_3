import { motion } from "motion/react";
import { useState } from "react";

export type MatchPreference = "male" | "female" | "anyone";

interface GenderModalProps {
  onSelect: (
    gender: "male" | "female",
    matchPreference: MatchPreference,
  ) => void;
}

export default function GenderModal({ onSelect }: GenderModalProps) {
  const [selectedGender, setSelectedGender] = useState<
    "male" | "female" | null
  >(null);
  const [selectedPref, setSelectedPref] = useState<MatchPreference | null>(
    null,
  );

  const canConfirm = selectedGender !== null && selectedPref !== null;

  const handleConfirm = () => {
    if (!canConfirm) return;
    onSelect(selectedGender, selectedPref);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        background: "rgba(0, 0, 0, 0.75)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
      }}
      data-ocid="gender_modal.modal"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 8 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="relative mx-4 w-full max-w-sm rounded-2xl overflow-hidden"
        style={{
          background: "var(--color-surface)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow:
            "0 0 0 1px rgba(33,212,230,0.08), 0 24px 64px rgba(0,0,0,0.7), 0 0 60px rgba(180,76,255,0.1)",
        }}
      >
        {/* Top accent bar */}
        <div
          className="h-1 w-full"
          style={{
            background:
              "linear-gradient(90deg, var(--color-accent-cyan), var(--color-accent-purple))",
          }}
        />

        <div className="px-8 pt-8 pb-9 flex flex-col items-center gap-7">
          {/* Icon + heading */}
          <div className="flex flex-col items-center gap-2 text-center">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-1"
              style={{
                background: "rgba(33, 212, 230, 0.1)",
                border: "1px solid rgba(33, 212, 230, 0.2)",
              }}
            >
              👤
            </div>
            <h2
              className="text-xl font-bold tracking-tight"
              style={{ color: "var(--color-text-primary)" }}
            >
              Before you start
            </h2>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "var(--color-text-muted)" }}
            >
              Set your gender and who you want to chat with.
            </p>
          </div>

          {/* Your Gender section */}
          <div className="flex flex-col gap-3 w-full">
            <p
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: "var(--color-text-muted)" }}
            >
              Your Gender
            </p>
            <div className="grid grid-cols-2 gap-3 w-full">
              <motion.button
                type="button"
                data-ocid="gender_modal.male.button"
                onClick={() => setSelectedGender("male")}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="group flex flex-col items-center gap-3 py-5 px-4 rounded-xl cursor-pointer transition-all duration-200"
                style={{
                  background:
                    selectedGender === "male"
                      ? "rgba(33, 212, 230, 0.14)"
                      : "rgba(33, 212, 230, 0.05)",
                  border:
                    selectedGender === "male"
                      ? "1.5px solid rgba(33, 212, 230, 0.6)"
                      : "1px solid rgba(33, 212, 230, 0.18)",
                  boxShadow:
                    selectedGender === "male"
                      ? "0 0 20px rgba(33, 212, 230, 0.2)"
                      : "none",
                }}
              >
                <span className="text-4xl">👨</span>
                <span
                  className="text-base font-semibold"
                  style={{ color: "var(--color-accent-cyan)" }}
                >
                  Male
                </span>
              </motion.button>

              <motion.button
                type="button"
                data-ocid="gender_modal.female.button"
                onClick={() => setSelectedGender("female")}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="group flex flex-col items-center gap-3 py-5 px-4 rounded-xl cursor-pointer transition-all duration-200"
                style={{
                  background:
                    selectedGender === "female"
                      ? "rgba(180, 76, 255, 0.14)"
                      : "rgba(180, 76, 255, 0.05)",
                  border:
                    selectedGender === "female"
                      ? "1.5px solid rgba(180, 76, 255, 0.6)"
                      : "1px solid rgba(180, 76, 255, 0.18)",
                  boxShadow:
                    selectedGender === "female"
                      ? "0 0 20px rgba(180, 76, 255, 0.2)"
                      : "none",
                }}
              >
                <span className="text-4xl">👩</span>
                <span
                  className="text-base font-semibold"
                  style={{ color: "var(--color-accent-purple)" }}
                >
                  Female
                </span>
              </motion.button>
            </div>
          </div>

          {/* Match With section */}
          <div className="flex flex-col gap-3 w-full">
            <p
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: "var(--color-text-muted)" }}
            >
              Match With
            </p>
            <div className="grid grid-cols-3 gap-2 w-full">
              {(["male", "female", "anyone"] as const).map((pref) => {
                const label =
                  pref === "male"
                    ? "Male"
                    : pref === "female"
                      ? "Female"
                      : "Anyone";
                const emoji =
                  pref === "male" ? "👨" : pref === "female" ? "👩" : "🎲";
                const isSelected = selectedPref === pref;
                return (
                  <motion.button
                    key={pref}
                    type="button"
                    data-ocid={`gender_modal.pref_${pref}.button`}
                    onClick={() => setSelectedPref(pref)}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="flex flex-col items-center gap-2 py-4 px-2 rounded-xl cursor-pointer transition-all duration-200"
                    style={{
                      background: isSelected
                        ? "rgba(33, 212, 230, 0.1)"
                        : "rgba(255, 255, 255, 0.04)",
                      border: isSelected
                        ? "1.5px solid rgba(33, 212, 230, 0.5)"
                        : "1px solid rgba(255, 255, 255, 0.1)",
                      boxShadow: isSelected
                        ? "0 0 16px rgba(33, 212, 230, 0.15)"
                        : "none",
                    }}
                  >
                    <span className="text-2xl">{emoji}</span>
                    <span
                      className="text-xs font-semibold"
                      style={{
                        color: isSelected
                          ? "var(--color-accent-cyan)"
                          : "var(--color-text-secondary)",
                      }}
                    >
                      {label}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Confirm button */}
          <motion.button
            type="button"
            data-ocid="gender_modal.confirm.button"
            onClick={handleConfirm}
            disabled={!canConfirm}
            whileHover={canConfirm ? { scale: 1.02 } : {}}
            whileTap={canConfirm ? { scale: 0.98 } : {}}
            transition={{ duration: 0.15 }}
            className="w-full py-3 rounded-xl font-bold text-sm tracking-wide transition-all duration-200"
            style={{
              background: canConfirm
                ? "linear-gradient(135deg, var(--color-accent-cyan), var(--color-accent-purple))"
                : "rgba(255, 255, 255, 0.06)",
              color: canConfirm ? "#0a0e1a" : "var(--color-text-muted)",
              cursor: canConfirm ? "pointer" : "not-allowed",
              opacity: canConfirm ? 1 : 0.5,
            }}
          >
            Find Stranger
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
