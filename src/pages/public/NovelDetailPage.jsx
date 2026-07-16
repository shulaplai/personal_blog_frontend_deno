import { useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchPublicNovelBySlug } from '@/store/slices/publicNovelsSlice';
import { formatDate, formatWordCount } from '@/utils/formatters';
import { NOVEL_STATUS_LABELS, getNovelStatusStyle } from '@/utils/novelStatus';
import { useDocumentTitle } from '@/utils/useDocumentTitle';

export default function NovelDetailPage() {
  const { slug } = useParams();
  const dispatch = useAppDispatch();
  const { currentItem: novel, status } = useAppSelector((state) => state.publicNovels);

  useDocumentTitle(novel?.title || 'Novel');

  useEffect(() => {
    dispatch(fetchPublicNovelBySlug(slug));
    window.scrollTo(0, 0);
  }, [dispatch, slug]);

  if (status === 'loading') {
    return (
      <div className="animate-fade-in mx-auto py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="h-80 animate-pulse rounded-2xl bg-muted" />
          <div className="md:col-span-2">
            <div className="mb-4 h-10 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-40 animate-pulse rounded bg-muted" />
          </div>
        </div>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="animate-fade-in py-16 text-center">
        <p className="mb-4 text-lg text-muted-foreground">Failed to load novel</p>
        <button onClick={() => dispatch(fetchPublicNovelBySlug(slug))} className="text-primary underline hover:no-underline">
          Try again
        </button>
      </div>
    );
  }

  if (!novel) {
    return (
      <div className="animate-fade-in py-16 text-center text-lg text-muted-foreground">
        Novel not found
      </div>
    );
  }

  const publishedChapters = (novel.chapters || []).filter((c) => c.status === 'published');
  const totalWords = publishedChapters.reduce((sum, c) => sum + (c.word_count || 0), 0);
  const statusStyle = getNovelStatusStyle(novel.status);

  return (
    <div className="animate-fade-in mx-auto py-8">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {/* Cover + Info */}
        <div>
          {novel.cover_image ? (
            <img src={novel.cover_image} alt={novel.title} className="w-full rounded-2xl" loading="lazy" />
          ) : (
            <div className="flex aspect-[3/4] w-full items-center justify-center rounded-2xl border border-border bg-muted text-4xl font-bold text-muted-foreground">
              {novel.title.charAt(0)}
            </div>
          )}
          <div className="mt-3 flex flex-wrap gap-1.5">
            <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusStyle}`}>
              {NOVEL_STATUS_LABELS[novel.status] || novel.status}
            </span>
            {novel.genre && (
              <span className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground">
                {novel.genre}
              </span>
            )}
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {publishedChapters.length} chapters · {formatWordCount(totalWords)}
          </p>
        </div>

        {/* Description + Chapter List */}
        <div className="md:col-span-2">
          <h1 className="text-3xl font-bold">{novel.title}</h1>
          <p className="mt-3 text-muted-foreground leading-relaxed">{novel.description}</p>

          <h2 className="mt-8 mb-4 text-xl font-semibold">Table of Contents</h2>
          {publishedChapters.length === 0 ? (
            <p className="text-sm text-muted-foreground">No published chapters yet</p>
          ) : (
            <div className="flex flex-col gap-y-0.5">
              {publishedChapters.map((ch) => (
                <RouterLink
                  key={ch.id}
                  to={`/novels/${novel.slug}/chapters/${ch.chapter_number}`}
                  className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm no-underline transition-colors hover:bg-muted"
                >
                  <span className="font-medium text-foreground">
                    Chapter {ch.chapter_number} — {ch.title}
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatWordCount(ch.word_count)}
                  </span>
                </RouterLink>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
