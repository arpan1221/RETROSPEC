interface HeroProps {
  stats: {
    events: number;
    people: number;
    orgs: number;
    models: number;
    epochs: number;
    total: number;
  };
}

export default function Hero({ stats }: HeroProps) {
  return (
    <section className="relative flex flex-col items-center justify-center min-h-screen px-6 py-20 text-center overflow-hidden">
      {/* CSS-only constellation grid background */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: `
            radial-gradient(1px 1px at 20% 30%, #f59e0b 0%, transparent 100%),
            radial-gradient(1px 1px at 80% 10%, #f59e0b 0%, transparent 100%),
            radial-gradient(1px 1px at 40% 70%, #f59e0b 0%, transparent 100%),
            radial-gradient(1px 1px at 60% 50%, #f59e0b 0%, transparent 100%),
            radial-gradient(1px 1px at 10% 90%, #f59e0b 0%, transparent 100%),
            radial-gradient(1px 1px at 90% 80%, #f59e0b 0%, transparent 100%),
            radial-gradient(1px 1px at 50% 20%, #f59e0b 0%, transparent 100%),
            radial-gradient(1px 1px at 30% 60%, #f59e0b 0%, transparent 100%),
            radial-gradient(1.5px 1.5px at 70% 40%, #e2e8f0 0%, transparent 100%),
            radial-gradient(1.5px 1.5px at 15% 55%, #e2e8f0 0%, transparent 100%),
            radial-gradient(1.5px 1.5px at 85% 65%, #e2e8f0 0%, transparent 100%),
            radial-gradient(1.5px 1.5px at 45% 85%, #e2e8f0 0%, transparent 100%)
          `,
          backgroundSize: '200px 200px',
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(245,158,11,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(245,158,11,0.3) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto">
        <h1 className="font-serif text-6xl md:text-8xl font-bold tracking-tight mb-6 text-[var(--text-primary)]">
          RETROSPEC
        </h1>

        <p className="text-[var(--text-muted)] text-sm md:text-base max-w-2xl mx-auto mb-6 leading-relaxed">
          Repository for the Evolutionary Trajectory and Record of
          Sentient-Parallel Engineered Cognition
        </p>

        <p className="text-[var(--text-muted)] italic text-sm mb-8 max-w-xl mx-auto opacity-70">
          &ldquo;Those who cannot remember the past are condemned to repeat
          it.&rdquo;
          <span className="block mt-1 not-italic text-xs opacity-60">
            &mdash; George Santayana
          </span>
        </p>

        <p className="text-[var(--amber)] text-lg md:text-xl font-medium mb-14">
          AI&rsquo;s own history, mapped across the world
        </p>

        {/* Stats grid */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 md:gap-4 mb-14">
          {(
            [
              ['Events', stats.events],
              ['People', stats.people],
              ['Organizations', stats.orgs],
              ['Models', stats.models],
              ['Epochs', stats.epochs],
              ['Total', stats.total],
            ] as const
          ).map(([label, count]) => (
            <div
              key={label}
              className="flex flex-col items-center bg-[var(--bg-surface)] rounded-lg px-4 py-3 border border-white/5"
            >
              <span
                className="text-2xl md:text-3xl font-bold text-[var(--amber)]"
                style={{ fontVariantNumeric: 'tabular-nums' }}
              >
                {count}
              </span>
              <span className="text-[var(--text-muted)] text-xs mt-1">
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <a
          href="#map"
          className="inline-flex items-center gap-2 px-8 py-3 rounded-full border border-[var(--amber)] text-[var(--amber)] hover:bg-[var(--amber)] hover:text-[var(--bg-primary)] transition-colors duration-300 text-sm font-medium"
        >
          Explore the Map
          <span aria-hidden="true">&darr;</span>
        </a>
      </div>
    </section>
  );
}
