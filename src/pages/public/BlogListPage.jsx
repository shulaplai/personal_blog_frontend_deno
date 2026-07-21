import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchPublicPosts } from '@/store/slices/publicPostsSlice';
import { fetchPublicCategories } from '@/store/slices/publicCategoriesSlice';
import { fetchPublicTags } from '@/store/slices/publicTagsSlice';
import { useDocumentTitle } from '@/utils/useDocumentTitle';
import BlogCard from '@/components/public/BlogCard';

export default function BlogListPage() {
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { items, pagination, status } = useAppSelector((state) => state.publicPosts);
  const { items: categories } = useAppSelector((state) => state.publicCategories);
  const { items: tags } = useAppSelector((state) => state.publicTags);

  useDocumentTitle('Blog');

  const category = searchParams.get('category') || '';
  const tag = searchParams.get('tag') || '';
  const search = searchParams.get('search') || '';
  const page = Number(searchParams.get('page')) || 1;
  const [searchInput, setSearchInput] = useState(search);

  const loadPosts = useCallback(() => {
    const params = { page, per_page: 9 };
    if (category) params.category = category;
    if (tag) params.tag = tag;
    if (search) params.search = search;
    dispatch(fetchPublicPosts(params));
  }, [dispatch, page, category, tag, search]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);
  useEffect(() => {
    dispatch(fetchPublicCategories());
    dispatch(fetchPublicTags());
  }, [dispatch]);

  const updateParams = (updates) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([k, v]) => {
      if (v) params.set(k, v);
      else params.delete(k);
    });
    if (
      updates.category !== undefined ||
      updates.tag !== undefined ||
      updates.search !== undefined
    ) {
      params.delete('page');
    }
    setSearchParams(params);
  };

  return (
    <>
      <Helmet>
        <title>Blog — Shulap Lai</title>
        <meta
          name="description"
          content="Blog posts by Shulap Lai — thoughts on web development, React, Laravel, and more."
        />
        <meta property="og:title" content="Blog — Shulap Lai" />
        <meta property="og:type" content="website" />
      </Helmet>
      <div className="animate-fade-in py-8">
        <h1 className="mb-8 text-3xl font-bold">Blog</h1>

        <div className="flex flex-col gap-8 md:flex-row">
          {/* Sidebar */}
          <aside className="w-full shrink-0 md:w-56">
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Search..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') updateParams({ search: searchInput });
                }}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 pl-9 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
              <svg
                className="absolute left-2.5 top-2.5 size-4 text-muted-foreground"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M5 10a5 5 0 1 1 10 0 5 5 0 0 1-10 0m5-7a7 7 0 1 0 4.192 12.606l5.1 5.101a1 1 0 0 0 1.415-1.414l-5.1-5.1A7 7 0 0 0 10 3" />
              </svg>
            </div>

            {/* Categories */}
            <div className="mb-4">
              <h3 className="mb-1 text-sm font-semibold text-foreground">Categories</h3>
              <ul className="space-y-0.5">
                <li>
                  <button
                    onClick={() => updateParams({ category: '' })}
                    className={`w-full rounded-lg px-3 py-1.5 text-left text-sm transition-colors ${
                      !category
                        ? 'bg-muted font-medium text-primary'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    All{' '}
                    {categories.length > 0 &&
                      `(${categories.reduce((sum, c) => sum + (c.posts_count || 0), 0)})`}
                  </button>
                </li>
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <button
                      onClick={() =>
                        updateParams({ category: category === cat.slug ? '' : cat.slug })
                      }
                      className={`w-full rounded-lg px-3 py-1.5 text-left text-sm transition-colors ${
                        category === cat.slug
                          ? 'bg-muted font-medium text-primary'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      {cat.name} {cat.posts_count > 0 && `(${cat.posts_count})`}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tags */}
            {tags.length > 0 && (
              <div>
                <h3 className="mb-1 text-sm font-semibold text-foreground">Tags</h3>
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => updateParams({ tag: tag === t.slug ? '' : t.slug })}
                      className={`rounded-lg border px-2 py-0.5 text-xs transition-colors ${
                        tag === t.slug
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </aside>

          {/* Main */}
          <div className="flex-1">
            {status === 'loading' && (
              <div className="flex justify-center py-12">
                <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            )}
            {status === 'failed' && (
              <div className="py-12 text-center">
                <p className="mb-4 text-muted-foreground">Failed to load posts</p>
                <button onClick={loadPosts} className="text-primary underline hover:no-underline">
                  Try again
                </button>
              </div>
            )}
            {status === 'succeeded' && items.length === 0 && (
              <div className="py-12 text-center text-muted-foreground">No posts found</div>
            )}
            <div className="flex flex-col gap-y-1.5 sm:gap-y-2">
              {items.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
            {pagination.lastPage > 1 && (
              <div className="mt-8 flex justify-center gap-x-1">
                {Array.from({ length: pagination.lastPage }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => {
                      updateParams({ page: String(p) });
                      window.scrollTo(0, 0);
                    }}
                    className={`flex size-9 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                      p === page
                        ? 'bg-primary text-white'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
