import { profile } from '@/data/profile';

export default function ExperienceTimeline() {
  return (
    <div className="rounded-2xl border border-border bg-background p-5">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        Experience
      </h3>
      <div className="relative">
        {profile.experience.map((exp, i) => (
          <div
            key={i}
            className={`relative pl-6 ${
              i < profile.experience.length - 1 ? 'mb-6 pb-2' : ''
            }`}
          >
            {/* Vertical line */}
            <div className="absolute left-0 top-1.5 h-full w-px bg-border" />

            {/* Dot */}
            <div className="absolute left-[-3.5px] top-1.5 size-2 rounded-full bg-primary ring-2 ring-background" />

            {/* Content */}
            <h4 className="text-base font-medium text-foreground">{exp.role}</h4>
            <p className="mb-2 text-sm text-muted-foreground">{exp.period}</p>
            <ul className="flex flex-col gap-y-1">
              {exp.highlights.map((item, j) => (
                <li key={j} className="flex items-start gap-x-2 text-sm text-muted-foreground">
                  <span className="mt-1.5 block size-1 shrink-0 rounded-full bg-muted-foreground/40" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
