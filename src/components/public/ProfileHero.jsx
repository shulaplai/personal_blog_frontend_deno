import { Link as RouterLink } from 'react-router-dom';
import { profile } from '@/data/profile';

function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

export default function ProfileHero() {
  const topTechs = [
    ...profile.techStack.frontend.slice(0, 2),
    ...profile.techStack.backend.slice(0, 1),
    ...profile.techStack.devops.slice(0, 1),
  ];

  return (
    <div className="mb-10 flex flex-col items-center gap-y-5">
      {/* Avatar */}
      <div className="flex size-28 items-center justify-center rounded-full border border-border bg-muted text-3xl font-bold text-muted-foreground">
        {profile.name.charAt(0)}
      </div>

      {/* Name & Title */}
      <div className="flex flex-col items-center gap-y-1.5">
        <h1 className="text-3xl font-bold text-foreground">
          {profile.name}
          {profile.nameZh && (
            <span className="ml-2 text-xl font-normal text-muted-foreground">
              · {profile.nameZh}
            </span>
          )}
        </h1>
        <p className="text-base font-medium text-foreground">{profile.title}</p>
        <p className="text-sm text-muted-foreground">{profile.tagline}</p>
      </div>

      {/* Tech pills */}
      <div className="flex flex-wrap justify-center gap-1.5">
        {topTechs.map((tech) => (
          <span
            key={tech}
            className="rounded-full border border-border bg-muted px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
          >
            {tech}
          </span>
        ))}
      </div>

      {/* Contact row */}
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm">
        <a
          href={`mailto:${profile.email}`}
          className="inline-flex items-center gap-x-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-muted-foreground no-underline transition-colors hover:bg-muted hover:text-primary"
        >
          <MailIcon />
          <span>Email</span>
        </a>
        <a
          href={`https://${profile.github}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-x-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-muted-foreground no-underline transition-colors hover:bg-muted hover:text-primary"
        >
          <GitHubIcon />
          <span>GitHub</span>
        </a>
        <RouterLink
          to="/about"
          className="inline-flex items-center gap-x-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-muted-foreground no-underline transition-colors hover:bg-muted hover:text-primary"
        >
          <span>View Resume</span>
        </RouterLink>
      </div>
    </div>
  );
}
