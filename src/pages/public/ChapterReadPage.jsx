import { useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import parse from 'html-react-parser';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchPublicNovelBySlug, fetchPublicChapter } from '@/store/slices/publicNovelsSlice';
import ChapterNav from '@/components/public/ChapterNav';
import { formatDate, formatWordCount, estimateReadTime } from '@/utils/formatters';
import { useDocumentTitle } from '@/utils/useDocumentTitle';

export default function ChapterReadPage() {
  const { novelSlug, chapterNumber } = useParams();
  const dispatch = useAppDispatch();
  const { currentItem: novel, currentChapter, status } = useAppSelector((state) => state.publicNovels);

  useDocumentTitle(currentChapter?.title || novel?.title || 'Chapter');

  useEffect(() => {
    dispatch(fetchPublicNovelBySlug(novelSlug));
    dispatch(fetchPublicChapter({ novelSlug, chapterNumber: Number(chapterNumber) }));
    window.scrollTo(0, 0);
  }, [dispatch, novelSlug, chapterNumber]);

  if (status === 'loading' || !currentChapter) {
    return (
      <div className="animate-fade-in mx-auto py-8">
        <div className="mb-4 h-8 w-2/3 animate-pulse rounded bg-muted" />
        <div className="mb-8 h-6 w-1/3 animate-pulse rounded bg-muted" />
        <div className="h-96 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in mx-auto py-8">
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-x-1.5 text-sm text-muted-foreground">
        <RouterLink to="/novels" className="hover:text-primary no-underline">Novels</RouterLink>
        <span>/</span>
        <RouterLink to={`/novels/${novelSlug}`} className="hover:text-primary no-underline truncate">
          {novel?.title || novelSlug}
        </RouterLink>
        <span>/</span>
        <span className="text-foreground">Ch. {currentChapter.chapter_number}</span>
      </nav>

      {/* Chapter Header */}
      <header className="mb-8 text-center">
        <h1 className="text-2xl font-bold sm:text-3xl">
          Chapter {currentChapter.chapter_number} — {currentChapter.title}
        </h1>
        <div className="mt-2 flex items-center justify-center gap-x-4 text-sm text-muted-foreground">
          <span>{formatDate(currentChapter.published_at)}</span>
          <span>{formatWordCount(currentChapter.word_count)}</span>
          <span>{estimateReadTime(currentChapter.word_count)} read</span>
        </div>
      </header>

      {/* Content */}
      <div className="rounded-2xl border border-border bg-background p-6 sm:p-8">
        <div className="prose-custom [&_p]:my-4 [&_p]:leading-relaxed [&_p]:text-[1.05rem] [&_h2]:mt-8 [&_h2]:mb-4 [&_h3]:mt-6 [&_h3]:mb-3 [&_img]:max-w-full [&_img]:rounded-xl">
          {parse(currentChapter.content || '')}
        </div>
      </div>

      {/* Chapter Navigation */}
      <ChapterNav novel={novel} currentChapter={currentChapter} />
    </div>
  );
}
