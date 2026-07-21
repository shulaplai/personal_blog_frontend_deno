import { profile } from '@/data/profile';
import TechStackBadges from './TechStackBadges';
import LanguageBadges from './LanguageBadges';

function MailIcon() {
  return (
    <svg
      aria-hidden="true"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg
      aria-hidden="true"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function GraduationIcon() {
  return (
    <svg
      aria-hidden="true"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c0 2 3 4 6 4s6-2 6-4v-5" />
    </svg>
  );
}

function ContactIcon() {
  return (
    <svg
      aria-hidden="true"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15.05 5A5 5 0 0 1 19 8.95M15.05 1A9 9 0 0 1 23 8.94m-1 7.98v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
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

export default function ProfileSidebar() {
  return (
    <div className="flex flex-col gap-y-4">
      <TechStackBadges />

      <LanguageBadges />

      {/* Education */}
      <div className="rounded-2xl border border-border bg-background p-6 transition-shadow hover:shadow-sm">
        <SectionHeader icon={<GraduationIcon />} title="Education" />
        <p className="text-sm font-semibold text-foreground">{profile.education.degree}</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {profile.education.school}
          {profile.education.schoolZh && (
            <span className="ml-1 text-xs opacity-70">({profile.education.schoolZh})</span>
          )}
        </p>
        <p className="mt-1.5 font-mono text-xs text-muted-foreground">{profile.education.period}</p>
      </div>

      {/* Contact */}
      <div className="rounded-2xl border border-border bg-background p-6 transition-shadow hover:shadow-sm">
        <SectionHeader icon={<ContactIcon />} title="Contact" />
        <div className="flex flex-col gap-y-3">
          <a
            href={`mailto:${profile.email}`}
            className="inline-flex items-center gap-x-2.5 rounded-lg px-2 py-1.5 -mx-2 text-sm text-muted-foreground no-underline transition-colors hover:bg-muted hover:text-primary"
          >
            <span className="flex size-7 items-center justify-center rounded-md border border-border bg-muted/50">
              <MailIcon />
            </span>
            <span className="truncate">{profile.email}</span>
          </a>
          <a
            href={`tel:${profile.phone}`}
            className="inline-flex items-center gap-x-2.5 rounded-lg px-2 py-1.5 -mx-2 text-sm text-muted-foreground no-underline transition-colors hover:bg-muted hover:text-primary"
          >
            <span className="flex size-7 items-center justify-center rounded-md border border-border bg-muted/50">
              <PhoneIcon />
            </span>
            <span>{profile.phone}</span>
          </a>
          <a
            href={`https://${profile.github}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-x-2.5 rounded-lg px-2 py-1.5 -mx-2 text-sm text-muted-foreground no-underline transition-colors hover:bg-muted hover:text-primary"
          >
            <span className="flex size-7 items-center justify-center rounded-md border border-border bg-muted/50">
              <GitHubIcon />
            </span>
            <span className="truncate">{profile.github}</span>
          </a>
        </div>
      </div>
    </div>
  );
}
