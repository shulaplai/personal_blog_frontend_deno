import { profile } from '@/data/profile';

const CATEGORY_LABELS = {
  frontend: 'Frontend',
  backend: 'Backend',
  devops: 'DevOps & Tools',
};

function CodeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
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

export default function TechStackBadges() {
  return (
    <div className="rounded-2xl border border-border bg-background p-6 transition-shadow hover:shadow-sm">
      <SectionHeader icon={<CodeIcon />} title="Tech Stack" />
      <div className="flex flex-col gap-y-4">
        {Object.entries(profile.techStack).map(([category, skills]) => (
          <div key={category}>
            <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
              {CATEGORY_LABELS[category] || category}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-border bg-muted/60 px-2.5 py-1 text-xs text-muted-foreground transition-all hover:border-primary/30 hover:bg-primary-foreground hover:text-foreground"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
