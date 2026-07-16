import { memo } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { NOVEL_STATUS_LABELS, getNovelStatusStyle } from '@/utils/novelStatus';

const NovelCard = memo(function NovelCard({ novel }) {
  const statusStyle = getNovelStatusStyle(novel.status);

  return (
    <RouterLink
      to={`/novels/${novel.slug}`}
      className="block rounded-2xl border bg-background p-5 no-underline transition-all hover:-translate-y-0.5 hover:bg-muted hover:shadow-sm"
    >
      <div className="mb-2 flex items-center gap-2">
        <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${statusStyle}`}>
          {NOVEL_STATUS_LABELS[novel.status] || novel.status}
        </span>
        {novel.genre && (
          <span className="text-xs text-muted-foreground">{novel.genre}</span>
        )}
      </div>
      <h3 className="text-lg font-medium text-foreground">{novel.title}</h3>
      <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">
        {novel.description}
      </p>
      {novel.chapters_count > 0 && (
        <p className="mt-2 text-xs text-muted-foreground">
          {novel.chapters_count} chapters
        </p>
      )}
    </RouterLink>
  );
});

export default NovelCard;
