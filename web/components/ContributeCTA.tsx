'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useMapState } from './MapProvider';

export default function ContributeCTA() {
  const { entityViewCount } = useMapState();
  const [dismissed, setDismissed] = useState(false);

  const show = entityViewCount >= 3 && !dismissed;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-lg"
        >
          <div className="bg-[var(--bg-surface)] border border-[var(--amber)]/30 rounded-xl px-5 py-4 shadow-2xl flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[var(--text-primary)] mb-1">
                Know AI history? <span className="text-[var(--amber)] font-medium">RETROSPEC is open source.</span>
              </p>
              <a
                href="https://github.com/RETROSPEC/RETROSPEC/blob/main/CONTRIBUTING.md"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[var(--amber)] hover:underline"
              >
                Add an entry &rarr;
              </a>
            </div>
            <button
              onClick={() => setDismissed(true)}
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-1 shrink-0"
              aria-label="Dismiss"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4l8 8M12 4L4 12" />
              </svg>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
