import { useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchPublicPosts } from '@/store/slices/publicPostsSlice';
import { fetchPublicProjects } from '@/store/slices/publicProjectsSlice';
import { fetchPublicNovels } from '@/store/slices/publicNovelsSlice';
import { formatDate } from '@/utils/formatters';
import { useDocumentTitle } from '@/utils/useDocumentTitle';
import { ArrowRightIcon } from '@/components/public/Icons';
import { SkeletonLine, SkeletonBlock } from '@/components/public/Skeletons';

function SectionTitle({ children }) {
  return (
    <div className="text-xl font-semibold md:min-w-36">
      <h2>{children}</h2>
    </div>
  );
}

function MoreLink({ to, children }) {
  return (
    <RouterLink
      to={to}
      className="group inline-flex items-center gap-x-1 rounded-lg border bg-muted px-2 py-1 text-sm text-muted-foreground no-underline transition-all hover:bg-primary-foreground hover:text-primary self-end"
    >
      <span>{children}</span>
      <ArrowRightIcon className="stroke-muted-foreground group-hover:stroke-primary link-arrow" />
    </RouterLink>
  );
}

export default function HomePage() {
  const dispatch = useAppDispatch();
  const { items: posts, pagination: postsPagination, status: postsStatus } = useAppSelector((state) => state.publicPosts);
  const { items: projects, pagination: projectsPagination, status: projectsStatus } = useAppSelector((state) => state.publicProjects);
  const { items: novels, pagination: novelsPagination, status: novelsStatus } = useAppSelector((state) => state.publicNovels);
  const { settings } = useAppSelector((state) => state.publicSettings);

  useDocumentTitle('');

  useEffect(() => {
    dispatch(fetchPublicPosts({ per_page: 6 }));
    dispatch(fetchPublicProjects({ per_page: 3 }));
    dispatch(fetchPublicNovels({ per_page: 3 }));
  }, [dispatch]);

  const siteName = settings.site_name || 'Personal Blog';
  const siteDesc = settings.site_description || 'Welcome to my personal space.';

  return (
    <div className="flex w-full flex-col items-center">
      {/* Hero Section */}
      <section className="animate-fade-in animate-delay-50 mb-10 flex flex-col items-center gap-y-7 relative z-50">
        {/* Avatar placeholder */}
        <div className="flex size-28 items-center justify-center rounded-full border border-border bg-muted text-3xl font-bold text-muted-foreground">
          {siteName.charAt(0)}
        </div>

        <div className="flex flex-col items-center gap-y-4">
          <h1 className="text-3xl font-bold">{siteName}</h1>
          <p className="text-muted-foreground">{siteDesc}</p>
        </div>

        <div className="flex flex-row gap-3">
          <RouterLink
            to="/about"
            className="flex flex-row items-center gap-x-3 rounded-full border bg-background px-4 py-2 text-sm shadow-sm transition-shadow hover:shadow-md no-underline"
          >
            <span className="relative flex items-center justify-center">
              <span className="absolute size-2 animate-ping rounded-full border border-green-400 bg-green-400 opacity-75" />
              <span className="size-2 rounded-full bg-green-400" />
            </span>
            <span className="font-medium text-muted-foreground">Connect Me!</span>
          </RouterLink>
        </div>
      </section>

      {/* Main content */}
      <div className="animate-fade-in animate-delay-100 relative z-0 flex w-full min-w-0 flex-col gap-y-10">
        {/* About Section */}
        <section className="flex flex-col gap-y-5 md:flex-row md:gap-y-0">
          <SectionTitle>About</SectionTitle>
          <div className="flex flex-1 flex-col gap-y-3">
            <p className="text-muted-foreground">{siteDesc}</p>
            <MoreLink to="/about">More about me</MoreLink>
          </div>
        </section>

        {/* Blog Section */}
        <section className="flex flex-col gap-y-5 md:flex-row md:gap-y-0">
          <SectionTitle>Blog</SectionTitle>
          <div className="flex flex-1 flex-col gap-y-3">
            {postsStatus === 'loading' ? (
              <SkeletonBlock />
            ) : (
              <ul className="flex flex-col gap-y-1.5 sm:gap-y-2">
                {posts.slice(0, 5).map((post) => (
                  <li key={post.id} className="post-preview group/card relative flex flex-col rounded-2xl border bg-background px-5 py-2.5 transition-colors hover:bg-muted">
                    <RouterLink
                      to={`/blog/${post.slug}`}
                      className="group/link flex w-full flex-col no-underline transition-all hover:text-primary sm:flex-row"
                    >
                      <span className="min-w-[95px] py-1 font-mono text-xs text-muted-foreground">
                        {formatDate(post.published_at)}
                      </span>
                      <div className="z-10 flex-grow">
                        <div className="flex justify-between">
                          <span>{post.title}</span>
                          <ArrowRightIcon className="my-1 stroke-muted-foreground group-hover/link:stroke-primary link-arrow shrink-0" />
                        </div>
                      </div>
                    </RouterLink>
                  </li>
                ))}
              </ul>
            )}
            <MoreLink to="/blog">More blogs</MoreLink>
          </div>
        </section>

        {/* Projects Section */}
        <section className="flex flex-col gap-y-5 md:flex-row md:gap-y-0">
          <SectionTitle>Projects</SectionTitle>
          <div className="flex flex-1 flex-col gap-y-3">
            {projectsStatus === 'loading' ? (
              <SkeletonBlock />
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {projects.slice(0, 3).map((project) => (
                  <RouterLink
                    key={project.id}
                    to={`/projects/${project.slug}`}
                    className="block rounded-2xl border bg-background p-5 no-underline transition-all hover:-translate-y-0.5 hover:bg-muted hover:shadow-sm"
                  >
                    <h3 className="text-lg font-medium text-foreground">{project.title}</h3>
                    <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">
                      {project.short_description}
                    </p>
                  </RouterLink>
                ))}
              </div>
            )}
            <MoreLink to="/projects">More projects</MoreLink>
          </div>
        </section>

        {/* Novels Section */}
        <section className="flex flex-col gap-y-5 md:flex-row md:gap-y-0">
          <SectionTitle>Novels</SectionTitle>
          <div className="flex flex-1 flex-col gap-y-3">
            {novelsStatus === 'loading' ? (
              <SkeletonBlock />
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {novels.slice(0, 3).map((novel) => (
                  <RouterLink
                    key={novel.id}
                    to={`/novels/${novel.slug}`}
                    className="block rounded-2xl border bg-background p-5 no-underline transition-all hover:-translate-y-0.5 hover:bg-muted hover:shadow-sm"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {novel.status && (
                        <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${
                          novel.status === 'ongoing' ? 'border-blue-500/40 bg-blue-500/15 text-blue-600 dark:text-blue-300' :
                          novel.status === 'completed' ? 'border-green-500/40 bg-green-500/15 text-green-600 dark:text-green-300' :
                          'border-amber-500/40 bg-amber-500/15 text-amber-600 dark:text-amber-300'
                        }`}>
                          {novel.status === 'ongoing' ? 'Ongoing' : novel.status === 'completed' ? 'Completed' : 'Hiatus'}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-medium text-foreground">{novel.title}</h3>
                    <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">
                      {novel.description}
                    </p>
                  </RouterLink>
                ))}
              </div>
            )}
            <MoreLink to="/novels">More novels</MoreLink>
          </div>
        </section>

        {/* Stats Section — uses actual totals from pagination */}
        <section className="flex flex-col gap-y-5 md:flex-row md:gap-y-0">
          <SectionTitle>Stats</SectionTitle>
          <div className="flex flex-1 flex-col gap-y-3">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl border bg-muted/30 px-4 py-3 text-center">
                <div className="text-2xl font-medium tabular-nums">{postsPagination.total || posts.length || '-'}</div>
                <div className="mt-1 text-xs text-muted-foreground">Posts</div>
              </div>
              <div className="rounded-xl border bg-muted/30 px-4 py-3 text-center">
                <div className="text-2xl font-medium tabular-nums">{projectsPagination.total || projects.length || '-'}</div>
                <div className="mt-1 text-xs text-muted-foreground">Projects</div>
              </div>
              <div className="rounded-xl border bg-muted/30 px-4 py-3 text-center">
                <div className="text-2xl font-medium tabular-nums">{novelsPagination.total || novels.length || '-'}</div>
                <div className="mt-1 text-xs text-muted-foreground">Novels</div>
              </div>
              <div className="rounded-xl border bg-muted/30 px-4 py-3 text-center">
                <div className="text-2xl font-medium tabular-nums">-</div>
                <div className="mt-1 text-xs text-muted-foreground">Views</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
