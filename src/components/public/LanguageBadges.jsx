import { profile } from '@/data/profile';

const LEVEL_WIDTH = {
  Native: 'w-full',
  Fluent: 'w-4/5',
  'JLPT N2': 'w-3/5',
};

function GlobeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" x2="22" y1="12" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function SectionHeader({ icon, title }) {
  return (
    <div className="mb-4 flex items-center gap-x-2 border-b border-border/50 pb-2.5">
      <span className="text-primary">{icon}</span>
      <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        {title}
      </h3>
    </div>
  );
}

export default function LanguageBadges() {
  return (
    <div className="rounded-2xl border border-border bg-background p-6 transition-shadow hover:shadow-sm">
      <SectionHeader icon={<GlobeIcon />} title="Languages" />
      <div className="flex flex-col gap-y-3.5">
        {profile.languages.map((lang) => (
          <div key={lang.name} className="flex items-center gap-x-3">
            <span className="w-20 shrink-0 text-sm font-medium text-foreground">{lang.name}</span>
            <div className="flex flex-1 items-center gap-x-2">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full bg-gradient-to-r from-primary/60 to-primary transition-all ${LEVEL_WIDTH[lang.level] || 'w-1/2'}`}
                />
              </div>
              <span className="w-10 text-right font-mono text-[11px] tabular-nums text-muted-foreground">
                {lang.level === 'JLPT N2' ? 'N2' : lang.level.slice(0, 3)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
