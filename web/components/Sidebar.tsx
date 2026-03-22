'use client';

import { useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useMapState } from './MapProvider';
import SearchBar from './SearchBar';
import {
  AnyEntity,
  Epoch,
  EpochId,
  EPOCH_LABELS,
} from '@/lib/types';

interface SidebarProps {
  epochs: Epoch[];
  entities: AnyEntity[];
  graphEdgeCount?: number;
}

type CategoryFilter = 'event' | 'person' | 'organization' | 'model';

export default function Sidebar({ epochs, entities, graphEdgeCount = 0 }: SidebarProps) {
  const { sidebarOpen, setSidebarOpen, activeEpoch, setActiveEpoch } = useMapState();

  const toggleEpoch = useCallback(
    (epochId: EpochId) => {
      setActiveEpoch(activeEpoch === epochId ? null : epochId);
    },
    [activeEpoch, setActiveEpoch]
  );

  // Count entities per type
  const counts: Record<CategoryFilter, number> = {
    event: entities.filter((e) => e.type === 'event').length,
    person: entities.filter((e) => e.type === 'person').length,
    organization: entities.filter((e) => e.type === 'organization').length,
    model: entities.filter((e) => e.type === 'model').length,
  };

  // Count events per epoch
  const epochEventCounts: Record<string, number> = {};
  entities.forEach((e) => {
    if (e.type === 'event' && 'epoch' in e) {
      const epoch = (e as any).epoch;
      epochEventCounts[epoch] = (epochEventCounts[epoch] ?? 0) + 1;
    }
  });

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="px-4 pt-4 pb-3">
        <SearchBar entities={entities} />
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 space-y-6 pb-4">
        {/* Epochs */}
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">
            Epochs
          </h3>
          <div className="space-y-0.5">
            {epochs.map((epoch) => {
              const isActive = activeEpoch === epoch.id;
              const eventCount = epochEventCounts[epoch.id] ?? 0;
              return (
                <button
                  key={epoch.id}
                  onClick={() => toggleEpoch(epoch.id as EpochId)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors flex items-center justify-between ${
                    isActive
                      ? 'bg-[var(--amber)]/10 border border-[var(--amber)]/20'
                      : 'hover:bg-white/5'
                  }`}
                >
                  <div className="min-w-0">
                    <p
                      className={`text-sm truncate ${
                        isActive ? 'text-[var(--amber)]' : 'text-[var(--text-primary)]'
                      }`}
                    >
                      {EPOCH_LABELS[epoch.id as EpochId] ?? epoch.name}
                    </p>
                    <p className="text-[10px] text-[var(--text-muted)]">
                      {epoch.date_start} &mdash; {epoch.date_end ?? 'present'}
                    </p>
                  </div>
                  {eventCount > 0 && (
                    <span
                      className={`text-[10px] rounded-full px-1.5 py-0.5 shrink-0 ml-2 ${
                        isActive
                          ? 'bg-[var(--amber)]/20 text-[var(--amber)]'
                          : 'bg-white/5 text-[var(--text-muted)]'
                      }`}
                    >
                      {eventCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* Categories */}
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">
            Categories
          </h3>
          <div className="space-y-1">
            {(
              [
                { key: 'event' as const, label: 'Events', color: 'bg-blue-400' },
                { key: 'person' as const, label: 'People', color: 'bg-green-400' },
                { key: 'organization' as const, label: 'Organizations', color: 'bg-purple-400' },
                { key: 'model' as const, label: 'Models', color: 'bg-amber-400' },
              ] as const
            ).map(({ key, label, color }) => (
              <div
                key={key}
                className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${color}`} />
                  <span className="text-sm text-[var(--text-primary)]">{label}</span>
                </div>
                <span className="text-xs text-[var(--text-muted)]" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {counts[key]}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Stats */}
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">
            Stats
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between px-3">
              <span className="text-[var(--text-muted)]">Total entries</span>
              <span className="text-[var(--text-primary)]" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {entities.length}
              </span>
            </div>
            <div className="flex items-center justify-between px-3">
              <span className="text-[var(--text-muted)]">Graph edges</span>
              <span className="text-[var(--text-primary)]" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {graphEdgeCount}
              </span>
            </div>
            <div className="px-3 pt-2">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-[var(--amber)]/30 text-[var(--amber)] hover:bg-[var(--amber)]/10 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                Open Source
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-[300px] h-full bg-[var(--bg-surface)] border-r border-white/10 shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile hamburger */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-[var(--bg-surface)] border border-white/10 rounded-lg"
        aria-label="Toggle sidebar"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
          {sidebarOpen ? (
            <path d="M5 5l10 10M15 5L5 15" />
          ) : (
            <>
              <path d="M3 5h14M3 10h14M3 15h14" />
            </>
          )}
        </svg>
      </button>

      {/* Mobile drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 bg-black z-40"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="md:hidden fixed top-0 left-0 w-[300px] h-full bg-[var(--bg-surface)] border-r border-white/10 z-40"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
