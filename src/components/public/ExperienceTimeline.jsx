import { profile } from '@/data/profile';

// Inline SVG icons for section headers
function UserIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function BriefcaseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
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

export default function ExperienceTimeline() {
  const { experience } = profile;

  return (
    <div className="rounded-2xl border border-border bg-background p-6 transition-shadow hover:shadow-sm">
      <SectionHeader icon={<BriefcaseIcon />} title="Experience" />

      <div className="relative">
        {experience.map((exp, i) => (
          <div
            key={i}
            className={`relative pl-8 ${
              i < experience.length - 1 ? 'mb-6 pb-4' : ''
            }`}
          >
            {/* Vertical line — only between items */}
            {i < experience.length - 1 && (
              <div className="absolute left-[7px] top-3 h-[calc(100%+8px)] w-px bg-border" />
            )}

            {/* Outer ring + inner dot */}
            <div className="absolute left-0 top-1 flex size-[15px] items-center justify-center rounded-full border-2 border-primary/20 bg-background">
              <div className="size-[5px] rounded-full bg-primary" />
            </div>

            {/* Content */}
            <div className="rounded-lg bg-muted/40 px-4 py-3">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                <h4 className="text-sm font-semibold text-foreground">{exp.role}</h4>
                <span className="font-mono text-xs text-muted-foreground">{exp.period}</span>
              </div>
              <ul className="mt-2.5 flex flex-col gap-y-1.5">
                {exp.highlights.map((item, j) => (
                  <li key={j} className="flex items-start gap-x-2.5 text-sm text-muted-foreground">
                    <span className="mt-[7px] block size-1 shrink-0 rounded-full bg-primary/50" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
