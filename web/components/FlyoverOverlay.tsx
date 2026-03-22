"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { FlyoverStop } from "@/lib/flyover";

interface FlyoverOverlayProps {
  active: boolean;
  currentStop: FlyoverStop | null;
  progress: number; // 0 to 1
  onStop: () => void;
}

export default function FlyoverOverlay({
  active,
  currentStop,
  progress,
  onStop,
}: FlyoverOverlayProps) {
  if (!active) return null;

  return (
    <div className="absolute inset-0 z-30 pointer-events-none">
      {/* Top bar: year + progress */}
      <div className="absolute top-0 left-0 right-0 pointer-events-auto">
        {/* Progress bar */}
        <div className="h-1 bg-white/10">
          <motion.div
            className="h-full bg-[var(--amber)]"
            initial={{ width: "0%" }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-3">
            <span className="text-[10px] uppercase tracking-widest text-[var(--amber)]">
              The Story of AI
            </span>
          </div>
          <button
            onClick={onStop}
            className="text-xs px-3 py-1 rounded-full border border-white/20 text-white/70 hover:text-white hover:border-white/40 transition-colors"
          >
            Exit Flyover
          </button>
        </div>
      </div>

      {/* Center: big year + city */}
      <AnimatePresence mode="wait">
        {currentStop && (
          <motion.div
            key={currentStop.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6 }}
            className="absolute bottom-24 left-0 right-0 flex flex-col items-center text-center px-4"
          >
            {/* Year */}
            <motion.span
              className="font-serif text-6xl md:text-8xl font-bold text-[var(--amber)]"
              style={{ textShadow: "0 0 40px rgba(245, 158, 11, 0.3)" }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {currentStop.year}
            </motion.span>

            {/* City */}
            <motion.span
              className="text-lg md:text-xl text-white/90 mt-2 font-medium"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              {currentStop.city}
            </motion.span>

            {/* Event label */}
            <motion.span
              className="text-sm md:text-base text-white/60 mt-1 max-w-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.4 }}
            >
              {currentStop.label}
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Vignette overlay for cinematic feel */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 50%, rgba(10,10,15,0.6) 100%)",
        }}
      />
    </div>
  );
}
