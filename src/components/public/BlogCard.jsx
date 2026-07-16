import { memo } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { formatDate } from '@/utils/formatters';

const BlogCard = memo(function BlogCard({ post }) {
  return (
    <div className="post-preview group/card relative flex flex-col rounded-2xl border bg-background px-5 py-2.5 transition-colors hover:bg-muted">
      <RouterLink
        to={`/blog/${post.slug}`}
        className="group/link flex w-full flex-col no-underline transition-all hover:text-primary sm:flex-row"
      >
        <span className="min-w-[95px] py-1 font-mono text-xs text-muted-foreground">
          {formatDate(post.published_at)}
        </span>
        <div className="z-10 flex-grow">
          <div className="flex justify-between gap-x-2">
            <span className="text-foreground">{post.title}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round"
              className="my-1 shrink-0 stroke-muted-foreground group-hover/link:stroke-primary link-arrow">
              <line x1="5" y1="12" x2="19" y2="12" className="origin-left scale-x-0 transition-transform duration-300 group-hover/link:scale-x-100" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </div>
        </div>
      </RouterLink>
    </div>
  );
});

export default BlogCard;
