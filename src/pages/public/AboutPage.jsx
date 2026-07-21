import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchPublicSettings } from '@/store/slices/publicSettingsSlice';
import { useDocumentTitle } from '@/utils/useDocumentTitle';
import { profile } from '@/data/profile';
import ExperienceTimeline from '@/components/public/ExperienceTimeline';
import ProfileSidebar from '@/components/public/ProfileSidebar';

function UserIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
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

export default function AboutPage() {
  const dispatch = useAppDispatch();
  const { settings, status } = useAppSelector((state) => state.publicSettings);

  useDocumentTitle('About');

  useEffect(() => {
    dispatch(fetchPublicSettings());
    window.scrollTo(0, 0);
  }, [dispatch]);

  return (
    <div className="animate-fade-in mx-auto py-12 sm:py-16">
      {/* Page header */}
      <div className="mb-10 text-center">
        {/* Avatar with subtle ring decoration */}
        <div className="relative mx-auto mb-5 inline-flex">
          <div className="absolute -inset-1.5 rounded-full bg-primary/10 blur-sm" />
          <div className="relative flex size-28 items-center justify-center rounded-full border-2 border-border bg-muted text-3xl font-bold text-muted-foreground ring-4 ring-background">
            {profile.name.charAt(0)}
          </div>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {profile.name}
          {profile.nameZh && (
            <span className="ml-2.5 text-xl font-normal text-muted-foreground">
              · {profile.nameZh}
            </span>
          )}
        </h1>
        <p className="mt-2 text-sm font-medium text-muted-foreground">{profile.title}</p>
      </div>

      {/* Split layout */}
      <div className="flex flex-col gap-y-5 md:flex-row md:gap-x-6">
        {/* Left column */}
        <div className="flex flex-1 flex-col gap-y-5 md:w-[65%]">
          {/* About Me */}
          <div className="rounded-2xl border border-border bg-background p-6 transition-shadow hover:shadow-sm">
            <SectionHeader icon={<UserIcon />} title="About Me" />
            {status === 'loading' ? (
              <div className="space-y-3">
                <div className="h-4 w-full animate-pulse rounded bg-muted" />
                <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
                <div className="h-4 w-4/6 animate-pulse rounded bg-muted" />
              </div>
            ) : (
              <p className="whitespace-pre-wrap leading-relaxed text-sm text-muted-foreground">
                {settings.about_me || 'No introduction yet.'}
              </p>
            )}
          </div>

          {/* Experience */}
          <ExperienceTimeline />

          {/* Soft Skills */}
          <div className="rounded-2xl border border-border bg-background p-6 transition-shadow hover:shadow-sm">
            <SectionHeader icon={<HeartIcon />} title="Soft Skills" />
            <div className="flex flex-wrap gap-2">
              {profile.softSkills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-border bg-muted/60 px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:border-primary/30 hover:bg-primary-foreground hover:text-foreground"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="w-full md:w-[35%]">
          <ProfileSidebar />
        </div>
      </div>
    </div>
  );
}
