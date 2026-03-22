"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EpochId, EPOCH_SHORT } from "@/lib/types";
import { useMapState } from "./MapProvider";

const ALL_EPOCHS: EpochId[] = [
  "00_philosophical_roots",
  "01_dawn",
  "02_golden_age",
  "03_first_winter",
  "04_expert_systems_boom",
  "05_second_winter",
  "06_quiet_revolution",
  "07_deep_learning_era",
  "08_transformer_age",
  "09_generative_explosion",
  "10_agentic_era",
];

const EPOCH_YEARS: Record<EpochId, string> = {
  "00_philosophical_roots": "1300",
  "01_dawn": "1943",
  "02_golden_age": "1956",
  "03_first_winter": "1974",
  "04_expert_systems_boom": "1980",
  "05_second_winter": "1987",
  "06_quiet_revolution": "1993",
  "07_deep_learning_era": "2012",
  "08_transformer_age": "2017",
  "09_generative_explosion": "2022",
  "10_agentic_era": "2024",
};

export default function EpochTimeline() {
  const { activeEpoch, setActiveEpoch } = useMapState();
  const [flashYear, setFlashYear] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleSelect = (epoch: EpochId | null) => {
    setActiveEpoch(epoch);
    if (epoch) {
      setFlashYear(EPOCH_YEARS[epoch]);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setFlashYear(null), 1400);
    } else {
      setFlashYear(null);
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <>
      {/* Year flash overlay */}
      <AnimatePresence>
        {flashYear && (
          <motion.div
            key={flashYear}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 0.18, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="absolute top-8 left-0 right-0 z-20 pointer-events-none flex items-center justify-center"
          >
            <span className="text-[8rem] md:text-[12rem] font-bold text-[#f59e0b] select-none leading-none tracking-tight">
              {flashYear}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timeline bar */}
      <div className="absolute bottom-0 left-0 right-0 z-30 bg-[#0a0a0f]/90 backdrop-blur-sm border-t border-white/5">
        <div
          ref={scrollRef}
          className="flex items-stretch overflow-x-auto scrollbar-hide"
        >
          {/* "All" button */}
          <button
            onClick={() => handleSelect(null)}
            className={`flex-shrink-0 px-3 md:px-4 py-2.5 text-xs font-medium transition-colors duration-200 border-r border-white/5 ${
              activeEpoch === null
                ? "bg-[#f59e0b] text-[#0a0a0f]"
                : "text-[#e2e8f0]/60 hover:text-[#e2e8f0] hover:bg-white/5"
            }`}
          >
            All
          </button>

          {ALL_EPOCHS.map((epoch) => (
            <motion.button
              key={epoch}
              onClick={() => handleSelect(epoch)}
              className={`relative flex-shrink-0 px-2 md:px-3 py-2.5 text-[10px] md:text-xs font-medium transition-colors duration-200 border-r border-white/5 ${
                activeEpoch === epoch
                  ? "text-[#0a0a0f]"
                  : "text-[#e2e8f0]/50 hover:text-[#e2e8f0] hover:bg-white/5"
              }`}
            >
              {activeEpoch === epoch && (
                <motion.div
                  layoutId="epoch-highlight"
                  className="absolute inset-0 bg-[#f59e0b] rounded-none"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10">{EPOCH_SHORT[epoch]}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </>
  );
}
