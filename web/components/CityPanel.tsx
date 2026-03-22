'use client';

import { useEffect, useRef, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useMapState } from './MapProvider';
import {
  AnyEntity,
  EPOCH_SHORT,
  EpochId,
  getEntityName,
} from '@/lib/types';

interface CityPanelProps {
  entities: AnyEntity[];
}

export default function CityPanel({ entities }: CityPanelProps) {
  const { selectedLocation, setSelectedLocation, setSelectedEntity, incrementEntityViewCount } =
    useMapState();
  const panelRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setSelectedLocation(null), [setSelectedLocation]);

  // Close on click outside
  useEffect(() => {
    if (!selectedLocation) return;
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        close();
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [selectedLocation, close]);

  // Resolve location entities
  const locationEntities = selectedLocation
    ? entities.filter(
        (e) =>
          selectedLocation.entities.includes(e.id) ||
          selectedLocation.events.includes(e.id)
      )
    : [];

  const events = locationEntities.filter((e) => e.type === 'event');
  const people = locationEntities.filter((e) => e.type === 'person');
  const orgs = locationEntities.filter((e) => e.type === 'organization');
  const models = locationEntities.filter((e) => e.type === 'model');

  // Sort events by date
  const sortedEvents = [...events].sort((a, b) => {
    const da = 'date' in a ? a.date : '';
    const db = 'date' in b ? b.date : '';
    return da.localeCompare(db);
  });

  function handleEntityClick(entity: AnyEntity) {
    setSelectedEntity(entity);
    incrementEntityViewCount();
  }

  const epochBadges = selectedLocation
    ? [...new Set(selectedLocation.epoch_range)].sort()
    : [];

  return (
    <AnimatePresence>
      {selectedLocation && (
        <motion.div
          ref={panelRef}
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="fixed top-0 right-0 h-full w-full md:w-[420px] bg-[var(--bg-surface)] border-l border-white/10 z-50 flex flex-col shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                {selectedLocation.name}
              </h2>
              <span className="text-xs bg-[var(--amber)] text-[var(--bg-primary)] rounded-full px-2 py-0.5 font-medium">
                {locationEntities.length}
              </span>
            </div>
            <button
              onClick={close}
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-1"
              aria-label="Close panel"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 5l10 10M15 5L5 15" />
              </svg>
            </button>
          </div>

          {/* Epoch badges */}
          {epochBadges.length > 0 && (
            <div className="flex flex-wrap gap-1.5 px-5 py-3 border-b border-white/5">
              {epochBadges.map((epoch) => (
                <span
                  key={epoch}
                  className="text-[10px] px-2 py-0.5 rounded bg-[var(--amber)]/10 text-[var(--amber)] border border-[var(--amber)]/20"
                >
                  {EPOCH_SHORT[epoch as EpochId] ?? epoch}
                </span>
              ))}
            </div>
          )}

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
            {/* Events */}
            {sortedEvents.length > 0 && (
              <EntryGroup title="Events" count={sortedEvents.length}>
                {sortedEvents.map((entity) => (
                  <button
                    key={entity.id}
                    onClick={() => handleEntityClick(entity)}
                    className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[var(--text-muted)]">
                        {'date' in entity ? (entity as any).date : ''}
                      </span>
                      <SignificanceDots value={(entity as any).significance ?? 0} />
                    </div>
                    <p className="text-sm text-[var(--text-primary)] mt-0.5 group-hover:text-[var(--amber)] transition-colors">
                      {getEntityName(entity)}
                    </p>
                  </button>
                ))}
              </EntryGroup>
            )}

            {/* People */}
            {people.length > 0 && (
              <EntryGroup title="People" count={people.length}>
                {people.map((entity) => (
                  <button
                    key={entity.id}
                    onClick={() => handleEntityClick(entity)}
                    className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-[var(--text-primary)] group-hover:text-[var(--amber)] transition-colors">
                        {getEntityName(entity)}
                      </p>
                      <SignificanceDots value={(entity as any).significance ?? 0} />
                    </div>
                    {'nationality' in entity && (
                      <span className="text-xs text-[var(--text-muted)]">
                        {(entity as any).nationality}
                      </span>
                    )}
                  </button>
                ))}
              </EntryGroup>
            )}

            {/* Organizations */}
            {orgs.length > 0 && (
              <EntryGroup title="Organizations" count={orgs.length}>
                {orgs.map((entity) => (
                  <button
                    key={entity.id}
                    onClick={() => handleEntityClick(entity)}
                    className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-[var(--text-primary)] group-hover:text-[var(--amber)] transition-colors">
                        {getEntityName(entity)}
                      </p>
                      {'org_type' in entity && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-[var(--text-muted)]">
                          {(entity as any).org_type}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </EntryGroup>
            )}

            {/* Models */}
            {models.length > 0 && (
              <EntryGroup title="Models" count={models.length}>
                {models.map((entity) => (
                  <button
                    key={entity.id}
                    onClick={() => handleEntityClick(entity)}
                    className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-[var(--text-primary)] group-hover:text-[var(--amber)] transition-colors">
                        {getEntityName(entity)}
                      </p>
                      {'architecture' in entity && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-[var(--text-muted)] font-mono">
                          {(entity as any).architecture}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </EntryGroup>
            )}

            {locationEntities.length === 0 && (
              <p className="text-sm text-[var(--text-muted)] text-center py-8">
                No entries found at this location.
              </p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function EntryGroup({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
          {title}
        </h3>
        <span className="text-[10px] text-[var(--text-muted)] bg-white/5 rounded-full px-1.5 py-0.5">
          {count}
        </span>
      </div>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function SignificanceDots({ value }: { value: number }) {
  const filled = Math.min(value, 10);
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: filled }).map((_, i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-[var(--amber)]"
        />
      ))}
    </div>
  );
}
