import { profile } from '@/data/profile';

const CATEGORY_LABELS = {
  frontend: 'Frontend',
  backend: 'Backend',
  devops: 'DevOps & Tools',
};

export default function TechStackBadges() {
  return (
    <div className="rounded-2xl border border-border bg-background p-5">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Tech Stack
      </h3>
      <div className="flex flex-col gap-y-4">
        {Object.entries(profile.techStack).map(([category, skills]) => (
          <div key={category}>
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {CATEGORY_LABELS[category] || category}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-border bg-muted px-3 py-1 text-sm text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
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
