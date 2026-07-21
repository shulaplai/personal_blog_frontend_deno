import { Link as RouterLink } from 'react-router-dom';

export default function ChapterNav({ novel, currentChapter }) {
  if (!novel?.chapters) return null;

  const chapters = novel.chapters;
  const idx = chapters.findIndex((c) => c.chapter_number === currentChapter?.chapter_number);
  const prev = idx > 0 ? chapters[idx - 1] : null;
  const next = idx < chapters.length - 1 ? chapters[idx + 1] : null;

  const linkClass =
    'inline-flex items-center gap-x-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium no-underline transition-colors hover:bg-muted hover:text-primary text-foreground';
  const disabledClass =
    'inline-flex items-center gap-x-1.5 rounded-lg border border-border px-3 py-2 text-sm font-medium text-muted-foreground/50 pointer-events-none';

  return (
    <div className="mt-8 flex items-center justify-between pt-4 border-t border-border">
      {prev ? (
        <RouterLink
          to={`/novels/${novel.slug}/chapters/${prev.chapter_number}`}
          className={linkClass}
        >
          <svg
            aria-hidden="true"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Ch. {prev.chapter_number}
        </RouterLink>
      ) : (
        <span className={disabledClass}>
          <svg
            aria-hidden="true"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          First Chapter
        </span>
      )}

      <RouterLink to={`/novels/${novel.slug}`} className={linkClass}>
        <svg
          aria-hidden="true"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <line x1="8" y1="6" x2="21" y2="6" />
          <line x1="8" y1="12" x2="21" y2="12" />
          <line x1="8" y1="18" x2="21" y2="18" />
          <line x1="3" y1="6" x2="3.01" y2="6" />
          <line x1="3" y1="12" x2="3.01" y2="12" />
          <line x1="3" y1="18" x2="3.01" y2="18" />
        </svg>
        TOC
      </RouterLink>

      {next ? (
        <RouterLink
          to={`/novels/${novel.slug}/chapters/${next.chapter_number}`}
          className={linkClass}
        >
          Ch. {next.chapter_number}
          <svg
            aria-hidden="true"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </RouterLink>
      ) : (
        <span className={disabledClass}>
          Latest Chapter
          <svg
            aria-hidden="true"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </span>
      )}
    </div>
  );
}
