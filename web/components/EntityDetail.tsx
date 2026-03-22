'use client';

import { useEffect, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useMapState } from './MapProvider';
import {
  AnyEntity,
  RetroEvent,
  Person,
  Organization,
  Model,
  Paper,
  Concept,
  Cycle,
  EPOCH_LABELS,
  EpochId,
  getEntityName,
} from '@/lib/types';

interface EntityDetailProps {
  allEntities: AnyEntity[];
}

export default function EntityDetail({ allEntities }: EntityDetailProps) {
  const { selectedEntity, setSelectedEntity } = useMapState();
  const [navStack, setNavStack] = useState<AnyEntity[]>([]);

  // Push to navigation stack when entity changes
  useEffect(() => {
    if (selectedEntity) {
      setNavStack((prev) => {
        // Avoid duplicating current top
        if (prev.length > 0 && prev[prev.length - 1].id === selectedEntity.id) {
          return prev;
        }
        return [...prev, selectedEntity];
      });
    } else {
      setNavStack([]);
    }
  }, [selectedEntity]);

  const close = useCallback(() => {
    setSelectedEntity(null);
    setNavStack([]);
  }, [setSelectedEntity]);

  const goBack = useCallback(() => {
    if (navStack.length <= 1) {
      close();
      return;
    }
    const newStack = navStack.slice(0, -1);
    setNavStack(newStack);
    setSelectedEntity(newStack[newStack.length - 1]);
  }, [navStack, close, setSelectedEntity]);

  // Close on escape
  useEffect(() => {
    if (!selectedEntity) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') close();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selectedEntity, close]);

  function navigateToEntity(id: string) {
    const entity = allEntities.find((e) => e.id === id);
    if (entity) {
      setSelectedEntity(entity);
    }
  }

  // Collect all referenced entity IDs from current entity
  function getConnectedIds(entity: AnyEntity): string[] {
    const ids = new Set<string>();

    if ('entities' in entity) {
      const ent = (entity as RetroEvent).entities;
      ent.people?.forEach((id) => ids.add(id));
      ent.organizations?.forEach((id) => ids.add(id));
      ent.models_spawned?.forEach((id) => ids.add(id));
    }
    if ('preceded_by' in entity) {
      (entity.preceded_by as string[] | undefined)?.forEach((id) => ids.add(id));
    }
    if ('succeeded_by' in entity) {
      (entity.succeeded_by as string[] | undefined)?.forEach((id) => ids.add(id));
    }
    if ('affiliations' in entity) {
      (entity as Person).affiliations?.forEach((id) => ids.add(id));
    }
    if ('influenced_by' in entity) {
      (entity as Person).influenced_by?.forEach((id) => ids.add(id));
    }
    if ('influenced' in entity) {
      (entity as Person).influenced?.forEach((id) => ids.add(id));
    }
    if ('founders' in entity) {
      (entity as Organization).founders?.forEach((id) => ids.add(id));
    }
    if ('key_models' in entity) {
      (entity as Organization).key_models?.forEach((id) => ids.add(id));
    }
    if ('organization' in entity && typeof (entity as Model).organization === 'string') {
      ids.add((entity as Model).organization);
    }
    if ('parent_models' in entity) {
      (entity as Model).parent_models?.forEach((id) => ids.add(id));
    }
    if ('child_models' in entity) {
      (entity as Model).child_models?.forEach((id) => ids.add(id));
    }
    if ('authors' in entity) {
      (entity as Paper).authors?.forEach((id) => ids.add(id));
    }
    if ('introduced_by' in entity) {
      (entity as Concept).introduced_by?.forEach((id) => ids.add(id));
    }
    if ('prerequisites' in entity) {
      (entity as Concept).prerequisites?.forEach((id) => ids.add(id));
    }
    if ('enables' in entity) {
      (entity as Concept).enables?.forEach((id) => ids.add(id));
    }

    return Array.from(ids);
  }

  return (
    <AnimatePresence>
      {selectedEntity && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black"
            onClick={close}
          />

          {/* Content */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-[var(--bg-surface)] border border-white/10 rounded-2xl shadow-2xl"
          >
            {/* Top bar */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 bg-[var(--bg-surface)] border-b border-white/10 rounded-t-2xl">
              <div className="flex items-center gap-3">
                {navStack.length > 1 && (
                  <button
                    onClick={goBack}
                    className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-1"
                    aria-label="Go back"
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 5l-5 5 5 5" />
                    </svg>
                  </button>
                )}
                <TypeBadge type={selectedEntity.type} />
              </div>
              <button
                onClick={close}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-1"
                aria-label="Close detail"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 5l10 10M15 5L5 15" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-6">
              {selectedEntity.type === 'event' && (
                <EventContent entity={selectedEntity as RetroEvent} onNavigate={navigateToEntity} />
              )}
              {selectedEntity.type === 'person' && (
                <PersonContent entity={selectedEntity as Person} onNavigate={navigateToEntity} />
              )}
              {selectedEntity.type === 'organization' && (
                <OrgContent entity={selectedEntity as Organization} onNavigate={navigateToEntity} />
              )}
              {selectedEntity.type === 'model' && (
                <ModelContent entity={selectedEntity as Model} onNavigate={navigateToEntity} />
              )}
              {selectedEntity.type === 'paper' && (
                <PaperContent entity={selectedEntity as Paper} onNavigate={navigateToEntity} />
              )}
              {selectedEntity.type === 'concept' && (
                <ConceptContent entity={selectedEntity as Concept} onNavigate={navigateToEntity} />
              )}
              {selectedEntity.type === 'cycle' && (
                <CycleContent entity={selectedEntity as Cycle} />
              )}

              {/* Connected entities */}
              <ConnectedEntities
                ids={getConnectedIds(selectedEntity)}
                allEntities={allEntities}
                onNavigate={navigateToEntity}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------- Type-specific content renderers ---------- */

function EventContent({
  entity,
  onNavigate,
}: {
  entity: RetroEvent;
  onNavigate: (id: string) => void;
}) {
  return (
    <>
      <div>
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
          {entity.title}
        </h2>
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-sm text-[var(--text-muted)]">{entity.date}</span>
          <EpochBadge epoch={entity.epoch} />
          <SignificanceBar value={entity.significance} />
        </div>
      </div>

      <p className="text-sm text-[var(--text-primary)] leading-relaxed">
        {entity.summary}
      </p>

      {entity.impact_description && (
        <p className="text-sm text-[var(--text-muted)] leading-relaxed">
          {entity.impact_description}
        </p>
      )}

      {/* Counterfactual */}
      {entity.counterfactual && (
        <div className="border border-[var(--amber)]/30 bg-[var(--amber)]/5 rounded-lg px-4 py-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--amber)] mb-1">
            Counterfactual
          </h4>
          <p className="text-sm text-[var(--text-primary)] leading-relaxed">
            {entity.counterfactual}
          </p>
        </div>
      )}

      {/* Entities involved */}
      {entity.entities && (
        <div className="space-y-2">
          {entity.entities.people && entity.entities.people.length > 0 && (
            <EntityIdBadges label="People" ids={entity.entities.people} onNavigate={onNavigate} />
          )}
          {entity.entities.organizations && entity.entities.organizations.length > 0 && (
            <EntityIdBadges label="Organizations" ids={entity.entities.organizations} onNavigate={onNavigate} />
          )}
          {entity.entities.models_spawned && entity.entities.models_spawned.length > 0 && (
            <EntityIdBadges label="Models spawned" ids={entity.entities.models_spawned} onNavigate={onNavigate} />
          )}
        </div>
      )}

      {/* Preceded / succeeded */}
      {entity.preceded_by && entity.preceded_by.length > 0 && (
        <EntityIdBadges label="Preceded by" ids={entity.preceded_by} onNavigate={onNavigate} />
      )}
      {entity.succeeded_by && entity.succeeded_by.length > 0 && (
        <EntityIdBadges label="Succeeded by" ids={entity.succeeded_by} onNavigate={onNavigate} />
      )}

      {/* Paper link */}
      {entity.paper?.url && (
        <a
          href={entity.paper.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-[var(--amber)] hover:underline"
        >
          View paper ({entity.paper.citation_count_approx?.toLocaleString()} citations)
        </a>
      )}

      {/* Query hooks */}
      {entity.query_hooks && entity.query_hooks.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {entity.query_hooks.map((hook) => (
            <span
              key={hook}
              className="text-[10px] px-2 py-1 rounded-full bg-white/5 text-[var(--text-muted)]"
            >
              {hook}
            </span>
          ))}
        </div>
      )}

      {/* Tags */}
      {entity.tags && entity.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {entity.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-[var(--text-muted)]"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </>
  );
}

function PersonContent({
  entity,
  onNavigate,
}: {
  entity: Person;
  onNavigate: (id: string) => void;
}) {
  return (
    <>
      <div>
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
          {entity.name}
        </h2>
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-sm text-[var(--text-muted)]">
            {entity.born}{entity.died ? ` \u2013 ${entity.died}` : ''}
          </span>
          <span className="text-xs px-2 py-0.5 rounded bg-white/5 text-[var(--text-muted)]">
            {entity.nationality}
          </span>
          <SignificanceBar value={entity.significance} />
        </div>
      </div>

      <p className="text-sm text-[var(--text-primary)] leading-relaxed">
        {entity.summary}
      </p>

      {/* Affiliations */}
      {entity.affiliations && entity.affiliations.length > 0 && (
        <EntityIdBadges label="Affiliations" ids={entity.affiliations} onNavigate={onNavigate} />
      )}

      {/* Key contributions */}
      {entity.key_contributions && entity.key_contributions.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">
            Key Contributions
          </h4>
          <ul className="list-disc list-inside space-y-1">
            {entity.key_contributions.map((c) => (
              <li key={c} className="text-sm text-[var(--text-primary)]">{c}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Influence chain */}
      {entity.influenced_by && entity.influenced_by.length > 0 && (
        <EntityIdBadges label="Influenced by" ids={entity.influenced_by} onNavigate={onNavigate} />
      )}
      {entity.influenced && entity.influenced.length > 0 && (
        <EntityIdBadges label="Influenced" ids={entity.influenced} onNavigate={onNavigate} />
      )}
    </>
  );
}

function OrgContent({
  entity,
  onNavigate,
}: {
  entity: Organization;
  onNavigate: (id: string) => void;
}) {
  return (
    <>
      <div>
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
          {entity.name}
        </h2>
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-sm text-[var(--text-muted)]">
            Founded {entity.founded}
          </span>
          <span className="text-xs px-2 py-0.5 rounded bg-[var(--amber)]/10 text-[var(--amber)]">
            {entity.org_type}
          </span>
          {entity.headquarters && (
            <span className="text-xs text-[var(--text-muted)]">
              {entity.headquarters}
            </span>
          )}
          <SignificanceBar value={entity.significance} />
        </div>
      </div>

      <p className="text-sm text-[var(--text-primary)] leading-relaxed">
        {entity.summary}
      </p>

      {entity.founders && entity.founders.length > 0 && (
        <EntityIdBadges label="Founders" ids={entity.founders} onNavigate={onNavigate} />
      )}
      {entity.key_models && entity.key_models.length > 0 && (
        <EntityIdBadges label="Key Models" ids={entity.key_models} onNavigate={onNavigate} />
      )}
    </>
  );
}

function ModelContent({
  entity,
  onNavigate,
}: {
  entity: Model;
  onNavigate: (id: string) => void;
}) {
  return (
    <>
      <div>
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
          {entity.name}
        </h2>
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <button
            onClick={() => onNavigate(entity.organization)}
            className="text-sm text-[var(--amber)] hover:underline"
          >
            {entity.organization}
          </button>
          <span className="text-sm text-[var(--text-muted)]">
            {entity.release_date}
          </span>
          <span className="text-xs px-2 py-0.5 rounded bg-white/5 text-[var(--text-muted)] font-mono">
            {entity.architecture}
          </span>
          {entity.parameter_count && (
            <span className="text-xs text-[var(--text-muted)]">
              {entity.parameter_count}
            </span>
          )}
          <SignificanceBar value={entity.significance} />
        </div>
      </div>

      {/* Lineage path */}
      {entity.lineage_path && (
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">
            Lineage
          </h4>
          <div className="flex flex-wrap items-center gap-1 text-xs">
            {entity.lineage_path.split(/\s*→\s*/).map((step, i, arr) => (
              <span key={i} className="flex items-center gap-1">
                <span className="px-2 py-0.5 rounded bg-white/5 text-[var(--text-primary)]">
                  {step}
                </span>
                {i < arr.length - 1 && (
                  <span className="text-[var(--amber)]">&rarr;</span>
                )}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Key innovations */}
      {entity.key_innovations && entity.key_innovations.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">
            Key Innovations
          </h4>
          <ul className="list-disc list-inside space-y-1">
            {entity.key_innovations.map((i) => (
              <li key={i} className="text-sm text-[var(--text-primary)]">{i}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Parent / child models */}
      {entity.parent_models && entity.parent_models.length > 0 && (
        <EntityIdBadges label="Parent Models" ids={entity.parent_models} onNavigate={onNavigate} />
      )}
      {entity.child_models && entity.child_models.length > 0 && (
        <EntityIdBadges label="Child Models" ids={entity.child_models} onNavigate={onNavigate} />
      )}

      {/* Benchmarks table */}
      {entity.benchmark_highlights && Object.keys(entity.benchmark_highlights).length > 0 && (
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">
            Benchmarks
          </h4>
          <div className="border border-white/10 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <tbody>
                {Object.entries(entity.benchmark_highlights).map(([key, val]) => (
                  <tr key={key} className="border-b border-white/5 last:border-b-0">
                    <td className="px-3 py-2 text-[var(--text-muted)]">{key}</td>
                    <td className="px-3 py-2 text-[var(--text-primary)] text-right font-mono">
                      {val}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Cultural impact */}
      {entity.cultural_impact && (
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1">
            Cultural Impact
          </h4>
          <p className="text-sm text-[var(--text-primary)] leading-relaxed">
            {entity.cultural_impact}
          </p>
        </div>
      )}
    </>
  );
}

function PaperContent({
  entity,
  onNavigate,
}: {
  entity: Paper;
  onNavigate: (id: string) => void;
}) {
  return (
    <>
      <div>
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
          {entity.title}
        </h2>
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-sm text-[var(--text-muted)]">{entity.date}</span>
          <span className="text-xs text-[var(--text-muted)]">{entity.venue}</span>
          <span className="text-xs text-[var(--text-muted)]">
            {entity.citation_count_approx?.toLocaleString()} citations
          </span>
          <SignificanceBar value={entity.significance} />
        </div>
      </div>

      <p className="text-sm text-[var(--text-primary)] leading-relaxed">{entity.summary}</p>

      {entity.key_contributions && entity.key_contributions.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">
            Key Contributions
          </h4>
          <ul className="list-disc list-inside space-y-1">
            {entity.key_contributions.map((c) => (
              <li key={c} className="text-sm text-[var(--text-primary)]">{c}</li>
            ))}
          </ul>
        </div>
      )}

      {entity.authors && entity.authors.length > 0 && (
        <EntityIdBadges label="Authors" ids={entity.authors} onNavigate={onNavigate} />
      )}

      {entity.url && (
        <a
          href={entity.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-[var(--amber)] hover:underline"
        >
          View paper
        </a>
      )}

      {entity.query_hooks && entity.query_hooks.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {entity.query_hooks.map((hook) => (
            <span
              key={hook}
              className="text-[10px] px-2 py-1 rounded-full bg-white/5 text-[var(--text-muted)]"
            >
              {hook}
            </span>
          ))}
        </div>
      )}
    </>
  );
}

function ConceptContent({
  entity,
  onNavigate,
}: {
  entity: Concept;
  onNavigate: (id: string) => void;
}) {
  return (
    <>
      <div>
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
          {entity.name}
        </h2>
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-sm text-[var(--text-muted)]">{entity.introduced_date}</span>
          <span className="text-xs px-2 py-0.5 rounded bg-white/5 text-[var(--text-muted)]">
            {entity.current_status}
          </span>
          <SignificanceBar value={entity.significance} />
        </div>
      </div>

      <p className="text-sm text-[var(--text-primary)] leading-relaxed">{entity.summary}</p>

      {entity.introduced_by && entity.introduced_by.length > 0 && (
        <EntityIdBadges label="Introduced by" ids={entity.introduced_by} onNavigate={onNavigate} />
      )}
      {entity.prerequisites && entity.prerequisites.length > 0 && (
        <EntityIdBadges label="Prerequisites" ids={entity.prerequisites} onNavigate={onNavigate} />
      )}
      {entity.enables && entity.enables.length > 0 && (
        <EntityIdBadges label="Enables" ids={entity.enables} onNavigate={onNavigate} />
      )}

      {entity.query_hooks && entity.query_hooks.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {entity.query_hooks.map((hook) => (
            <span
              key={hook}
              className="text-[10px] px-2 py-1 rounded-full bg-white/5 text-[var(--text-muted)]"
            >
              {hook}
            </span>
          ))}
        </div>
      )}
    </>
  );
}

function CycleContent({ entity }: { entity: Cycle }) {
  return (
    <>
      <div>
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
          {entity.name}
        </h2>
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className="text-sm text-[var(--text-muted)]">
            {entity.date_start} \u2013 {entity.date_end}
          </span>
          <span className="text-xs px-2 py-0.5 rounded bg-[var(--amber)]/10 text-[var(--amber)]">
            {entity.cycle_type}
          </span>
          <span className="text-xs text-[var(--text-muted)]">
            {entity.duration_years} years
          </span>
          <SignificanceBar value={entity.significance} />
        </div>
      </div>

      <p className="text-sm text-[var(--text-primary)] leading-relaxed">{entity.summary}</p>

      {entity.trigger_signals && entity.trigger_signals.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">
            Trigger Signals
          </h4>
          <ul className="list-disc list-inside space-y-1">
            {entity.trigger_signals.map((s) => (
              <li key={s} className="text-sm text-[var(--text-primary)]">{s}</li>
            ))}
          </ul>
        </div>
      )}

      {entity.lessons_learned && entity.lessons_learned.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">
            Lessons Learned
          </h4>
          <ul className="list-disc list-inside space-y-1">
            {entity.lessons_learned.map((l) => (
              <li key={l} className="text-sm text-[var(--text-primary)]">{l}</li>
            ))}
          </ul>
        </div>
      )}

      {entity.query_hooks && entity.query_hooks.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {entity.query_hooks.map((hook) => (
            <span
              key={hook}
              className="text-[10px] px-2 py-1 rounded-full bg-white/5 text-[var(--text-muted)]"
            >
              {hook}
            </span>
          ))}
        </div>
      )}
    </>
  );
}

/* ---------- Shared sub-components ---------- */

function TypeBadge({ type }: { type: string }) {
  const colorMap: Record<string, string> = {
    event: 'bg-blue-500/20 text-blue-400',
    person: 'bg-green-500/20 text-green-400',
    organization: 'bg-purple-500/20 text-purple-400',
    model: 'bg-[var(--amber)]/20 text-[var(--amber)]',
    paper: 'bg-cyan-500/20 text-cyan-400',
    concept: 'bg-pink-500/20 text-pink-400',
    cycle: 'bg-red-500/20 text-red-400',
  };
  return (
    <span className={`text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded ${colorMap[type] ?? 'bg-white/10 text-white'}`}>
      {type}
    </span>
  );
}

function EpochBadge({ epoch }: { epoch: string }) {
  const label = EPOCH_LABELS[epoch as EpochId] ?? epoch;
  return (
    <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--amber)]/10 text-[var(--amber)] border border-[var(--amber)]/20">
      {label}
    </span>
  );
}

function SignificanceBar({ value }: { value: number }) {
  const filled = Math.min(value, 10);
  return (
    <div className="flex gap-0.5 items-center" title={`Significance: ${value}/10`}>
      {Array.from({ length: filled }).map((_, i) => (
        <span key={i} className="w-1.5 h-1.5 rounded-full bg-[var(--amber)]" />
      ))}
    </div>
  );
}

function EntityIdBadges({
  label,
  ids,
  onNavigate,
}: {
  label: string;
  ids: string[];
  onNavigate: (id: string) => void;
}) {
  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">
        {label}
      </h4>
      <div className="flex flex-wrap gap-1.5">
        {ids.map((id) => (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            className="text-xs px-2 py-1 rounded bg-white/5 text-[var(--text-primary)] hover:bg-[var(--amber)]/10 hover:text-[var(--amber)] transition-colors"
          >
            {id}
          </button>
        ))}
      </div>
    </div>
  );
}

function ConnectedEntities({
  ids,
  allEntities,
  onNavigate,
}: {
  ids: string[];
  allEntities: AnyEntity[];
  onNavigate: (id: string) => void;
}) {
  if (ids.length === 0) return null;

  return (
    <div className="border-t border-white/10 pt-5">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-3">
        Connected Entities
      </h3>
      <div className="flex flex-wrap gap-1.5">
        {ids.map((id) => {
          const resolved = allEntities.find((e) => e.id === id);
          const displayName = resolved ? getEntityName(resolved) : id;
          const type = resolved?.type;
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className="text-xs px-2.5 py-1 rounded-full bg-white/5 text-[var(--text-primary)] hover:bg-[var(--amber)]/10 hover:text-[var(--amber)] transition-colors flex items-center gap-1.5"
            >
              {type && <TypeDot type={type} />}
              {displayName}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TypeDot({ type }: { type: string }) {
  const colorMap: Record<string, string> = {
    event: 'bg-blue-400',
    person: 'bg-green-400',
    organization: 'bg-purple-400',
    model: 'bg-[var(--amber)]',
    paper: 'bg-cyan-400',
    concept: 'bg-pink-400',
    cycle: 'bg-red-400',
  };
  return (
    <span className={`w-1.5 h-1.5 rounded-full inline-block ${colorMap[type] ?? 'bg-white/50'}`} />
  );
}
