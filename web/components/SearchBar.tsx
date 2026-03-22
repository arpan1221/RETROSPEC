'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import Fuse from 'fuse.js';
import { useMapState } from './MapProvider';
import { AnyEntity, getEntityName } from '@/lib/types';

interface SearchBarProps {
  entities: AnyEntity[];
}

export default function SearchBar({ entities }: SearchBarProps) {
  const { setSelectedEntity, incrementEntityViewCount } = useMapState();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const fuse = useMemo(
    () =>
      new Fuse(entities, {
        threshold: 0.3,
        keys: ['name', 'title', 'summary', 'id'],
      }),
    [entities]
  );

  const results = useMemo(() => {
    if (!query.trim()) return [];
    return fuse.search(query, { limit: 10 }).map((r) => r.item);
  }, [fuse, query]);

  useEffect(() => {
    setActiveIndex(0);
  }, [results]);

  const selectEntity = useCallback(
    (entity: AnyEntity) => {
      setSelectedEntity(entity);
      incrementEntityViewCount();
      setQuery('');
      setIsOpen(false);
    },
    [setSelectedEntity, incrementEntityViewCount]
  );

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    }
    if (e.key === 'Enter' && results[activeIndex]) {
      selectEntity(results[activeIndex]);
    }
  }

  // Close on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const typeColors: Record<string, string> = {
    event: 'bg-blue-500/20 text-blue-400',
    person: 'bg-green-500/20 text-green-400',
    organization: 'bg-purple-500/20 text-purple-400',
    model: 'bg-amber-500/20 text-amber-400',
    paper: 'bg-cyan-500/20 text-cyan-400',
    concept: 'bg-pink-500/20 text-pink-400',
    cycle: 'bg-red-500/20 text-red-400',
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        {/* Magnifying glass icon */}
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search entities..."
          className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--amber)]/50 transition-colors"
        />
      </div>

      {/* Results dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute z-50 top-full mt-1 w-full bg-[var(--bg-surface)] border border-white/10 rounded-lg shadow-2xl overflow-hidden max-h-[400px] overflow-y-auto">
          {results.map((entity, i) => (
            <button
              key={entity.id}
              onClick={() => selectEntity(entity)}
              onMouseEnter={() => setActiveIndex(i)}
              className={`w-full text-left px-3 py-2.5 flex items-center gap-3 transition-colors ${
                i === activeIndex ? 'bg-white/5' : 'hover:bg-white/[0.03]'
              }`}
            >
              {/* Type badge */}
              <span
                className={`text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded shrink-0 ${
                  typeColors[entity.type] ?? 'bg-white/10 text-white'
                }`}
              >
                {entity.type}
              </span>

              <div className="flex-1 min-w-0">
                <p className="text-sm text-[var(--text-primary)] truncate">
                  {getEntityName(entity)}
                </p>
              </div>

              {/* Significance dots */}
              <div className="flex gap-0.5 shrink-0">
                {Array.from({ length: Math.min(entity.significance, 10) }).map((_, j) => (
                  <span key={j} className="w-1 h-1 rounded-full bg-[var(--amber)]" />
                ))}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
