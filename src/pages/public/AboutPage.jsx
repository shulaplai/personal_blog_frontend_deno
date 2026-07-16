import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchPublicSettings } from '@/store/slices/publicSettingsSlice';
import { useDocumentTitle } from '@/utils/useDocumentTitle';

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
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex size-28 items-center justify-center rounded-full border border-border bg-muted text-3xl font-bold text-muted-foreground">
          {(settings.site_name || '?')[0]}
        </div>
        <h1 className="text-3xl font-bold">
          {status === 'loading' ? (
            <span className="inline-block h-9 w-48 animate-pulse rounded bg-muted" />
          ) : (
            settings.site_name || 'About'
          )}
        </h1>
      </div>

      <div className="rounded-2xl border border-border bg-background p-6 sm:p-8">
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
    </div>
  );
}
