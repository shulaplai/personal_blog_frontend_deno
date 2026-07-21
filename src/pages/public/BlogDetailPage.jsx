import { useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import parse from 'html-react-parser';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchPublicPostBySlug } from '@/store/slices/publicPostsSlice';
import { formatDate, estimateReadTime } from '@/utils/formatters';
import { useDocumentTitle } from '@/utils/useDocumentTitle';

export default function BlogDetailPage() {
  const { slug } = useParams();
  const dispatch = useAppDispatch();
  const { currentItem: post, status } = useAppSelector((state) => state.publicPosts);

  useDocumentTitle(post?.title || 'Blog');

  useEffect(() => {
    dispatch(fetchPublicPostBySlug(slug));
    window.scrollTo(0, 0);
  }, [dispatch, slug]);

  if (status === 'loading') {
    return (
      <div className="animate-fade-in mx-auto py-8">
        <div className="mb-4 h-10 w-3/4 animate-pulse rounded bg-muted" />
        <div className="mb-8 h-5 w-1/3 animate-pulse rounded bg-muted" />
        <div className="h-80 animate-pulse rounded-2xl bg-muted" />
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="animate-fade-in py-16 text-center">
        <p className="mb-4 text-lg text-muted-foreground">Failed to load post</p>
        <button
          onClick={() => dispatch(fetchPublicPostBySlug(slug))}
          className="text-primary underline hover:no-underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="animate-fade-in py-16 text-center text-lg text-muted-foreground">
        Post not found
      </div>
    );
  }

  const wordCount = post.content?.replace(/<[^>]+>/g, '').length || 0;

  return (
    <>
      {post && (
        <Helmet>
          <title>{post.title} — Shulap Lai</title>
          <meta name="description" content={post.excerpt || post.title} />
          <meta property="og:title" content={post.title} />
          <meta property="og:description" content={post.excerpt || post.title} />
          <meta property="og:type" content="article" />
        </Helmet>
      )}
      <article className="animate-fade-in mx-auto py-8">
        {/* Header */}
        <header className="mb-6">
          {post.category && (
            <span className="mb-3 inline-block rounded-full border border-primary/40 bg-primary/10 px-3 py-0.5 text-xs font-medium text-primary">
              {post.category.name}
            </span>
          )}
          <h1 className="text-3xl font-bold tracking-tight">{post.title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span>{formatDate(post.published_at, 'YYYY MMM D')}</span>
            <span>{estimateReadTime(wordCount)} read</span>
            <span>{wordCount.toLocaleString()} words</span>
          </div>
          {post.tags && post.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {post.tags.map((tag) => (
                <RouterLink
                  key={tag.id}
                  to={`/blog?tag=${tag.slug}`}
                  className="rounded-lg border border-border px-2.5 py-0.5 text-xs text-muted-foreground no-underline transition-colors hover:bg-muted hover:text-foreground"
                >
                  {tag.name}
                </RouterLink>
              ))}
            </div>
          )}
        </header>

        {/* Cover Image */}
        {post.cover_image && (
          <div className="mb-8 overflow-hidden rounded-2xl">
            <img
              src={post.cover_image}
              alt={post.title}
              className="w-full max-h-96 object-cover"
              loading="lazy"
            />
          </div>
        )}

        {/* Content */}
        <div className="rounded-2xl border border-border bg-background p-6 sm:p-8">
          <div className="prose-custom [&_img]:max-w-full [&_img]:rounded-xl [&_pre]:rounded-xl [&_pre]:border [&_pre]:border-border [&_pre]:bg-muted [&_pre]:p-4 [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:text-muted-foreground [&_h2]:mt-8 [&_h2]:mb-4 [&_h3]:mt-6 [&_h3]:mb-3 [&_p]:my-4 [&_p]:leading-relaxed [&_a]:text-primary [&_a]:underline">
            {parse(post.content || '')}
          </div>
        </div>
      </article>
    </>
  );
}
