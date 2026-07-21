import { profile } from '@/data/profile';

const LEVEL_WIDTH = {
  Native: 'w-full',
  Fluent: 'w-4/5',
  'JLPT N2': 'w-3/5',
};

export default function LanguageBadges() {
  return (
    <div className="rounded-2xl border border-border bg-background p-5">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Languages
      </h3>
      <div className="flex flex-col gap-y-3">
        {profile.languages.map((lang) => (
          <div key={lang.name} className="flex items-center justify-between gap-x-3">
            <span className="w-24 shrink-0 text-sm text-foreground">{lang.name}</span>
            <div className="flex flex-1 items-center gap-x-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full bg-primary ${LEVEL_WIDTH[lang.level] || 'w-1/2'}`}
                />
              </div>
              <span className="w-10 text-right text-xs text-muted-foreground">
                {lang.level === 'JLPT N2' ? 'N2' : lang.level.slice(0, 3)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
