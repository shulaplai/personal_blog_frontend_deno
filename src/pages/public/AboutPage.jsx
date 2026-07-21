import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchPublicSettings } from '@/store/slices/publicSettingsSlice';
import { useDocumentTitle } from '@/utils/useDocumentTitle';
import { profile } from '@/data/profile';
import ExperienceTimeline from '@/components/public/ExperienceTimeline';
import ProfileSidebar from '@/components/public/ProfileSidebar';

export default function AboutPage() {
  const dispatch = useAppDispatch();
  const { settings, status } = useAppSelector((state) => state.publicSettings);

  useDocumentTitle('About');

  useEffect(() => {
    dispatch(fetchPublicSettings());
    window.scrollTo(0, 0);
  }, [dispatch]);

  return (
    <div className="animate-fade-in mx-auto py-16">
      {/* Page header */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex size-28 items-center justify-center rounded-full border border-border bg-muted text-3xl font-bold text-muted-foreground">
          {profile.name.charAt(0)}
        </div>
        <h1 className="text-3xl font-bold text-foreground">
          {profile.name}
          {profile.nameZh && (
            <span className="ml-2 text-xl font-normal text-muted-foreground">
              · {profile.nameZh}
            </span>
          )}
        </h1>
        <p className="mt-1 text-base text-muted-foreground">{profile.title}</p>
      </div>

      {/* Split layout */}
      <div className="flex flex-col gap-y-6 md:flex-row md:gap-x-6">
        {/* Left column */}
        <div className="flex flex-1 flex-col gap-y-4 md:w-[65%]">
          {/* About Me */}
          <div className="rounded-2xl border border-border bg-background p-5">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              About Me
            </h3>
            {status === 'loading' ? (
              <div className="space-y-3">
                <div className="h-4 w-full animate-pulse rounded bg-muted" />
                <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
                <div className="h-4 w-4/6 animate-pulse rounded bg-muted" />
              </div>
            ) : (
              <p className="whitespace-pre-wrap leading-relaxed text-muted-foreground">
                {settings.about_me || 'No introduction yet.'}
              </p>
            )}
          </div>

          {/* Experience */}
          <ExperienceTimeline />

          {/* Soft Skills */}
          <div className="rounded-2xl border border-border bg-background p-5">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Soft Skills
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {profile.softSkills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-border bg-muted px-3 py-1 text-sm text-muted-foreground"
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
