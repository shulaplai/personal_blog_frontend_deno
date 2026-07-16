import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import parse from 'html-react-parser';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchPublicProjectBySlug } from '@/store/slices/publicProjectsSlice';
import { useDocumentTitle } from '@/utils/useDocumentTitle';

export default function ProjectDetailPage() {
  const { slug } = useParams();
  const dispatch = useAppDispatch();
  const { currentItem: project, status } = useAppSelector((state) => state.publicProjects);

  useDocumentTitle(project?.title || 'Project');

  useEffect(() => {
    dispatch(fetchPublicProjectBySlug(slug));
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
        <p className="mb-4 text-lg text-muted-foreground">Failed to load project</p>
        <button onClick={() => dispatch(fetchPublicProjectBySlug(slug))} className="text-primary underline hover:no-underline">
          Try again
        </button>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="animate-fade-in py-16 text-center text-lg text-muted-foreground">
        Project not found
      </div>
    );
  }

  return (
    <article className="animate-fade-in mx-auto py-8">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">{project.title}</h1>
        <p className="mt-2 text-muted-foreground">{project.short_description}</p>

        {/* Links */}
        <div className="mt-4 flex flex-wrap gap-2">
          {project.project_url && (
            <a
              href={project.project_url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground no-underline transition-colors hover:bg-muted"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              Demo
            </a>
          )}
          {project.github_url && (
            <a
              href={project.github_url} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-foreground no-underline transition-colors hover:bg-muted"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M6.315 6.176c-.25-.638-.24-1.367-.129-2.034a6.8 6.8 0 0 1 2.12 1.07c.28.214.647.283.989.18A9.3 9.3 0 0 1 12 5c.961 0 1.874.14 2.703.391c.342.104.709.034.988-.18a6.8 6.8 0 0 1 2.119-1.07c.111.667.12 1.396-.128 2.033c-.15.384-.075.826.208 1.14C18.614 8.117 19 9.04 19 10c0 2.114-1.97 4.187-5.134 4.818c-.792.158-1.101 1.155-.495 1.726c.389.366.629.882.629 1.456v3a1 1 0 0 0 2 0v-3c0-.57-.12-1.112-.334-1.603C18.683 15.35 21 12.993 21 10c0-1.347-.484-2.585-1.287-3.622c.21-.82.191-1.646.111-2.28c-.071-.568-.17-1.312-.57-1.756c-.595-.659-1.58-.271-2.28-.032a9 9 0 0 0-2.125 1.045A11.4 11.4 0 0 0 12 3c-.994 0-1.953.125-2.851.356a9 9 0 0 0-2.125-1.045c-.7-.24-1.686-.628-2.281.031c-.408.452-.493 1.137-.566 1.719l-.005.038c-.08.635-.098 1.462.112 2.283C3.484 7.418 3 8.654 3 10c0 2.992 2.317 5.35 5.334 6.397A4 4 0 0 0 8 17.98l-.168.034c-.717.099-1.176.01-1.488-.122c-.76-.322-1.152-1.133-1.63-1.753c-.298-.385-.732-.866-1.398-1.088a1 1 0 0 0-.632 1.898c.558.186.944 1.142 1.298 1.566c.373.448.869.916 1.58 1.218c.682.29 1.483.393 2.438.276V21a1 1 0 0 0 2 0v-3c0-.574.24-1.09.629-1.456c.607-.572.297-1.568-.495-1.726C6.969 14.187 5 12.114 5 10c0-.958.385-1.881 1.108-2.684c.283-.314.357-.756.207-1.14"/></svg>
              GitHub
            </a>
          )}
        </div>

        {/* Technologies */}
        {project.technologies && project.technologies.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {project.technologies.map((tech) => (
              <span key={tech.id} className="rounded-lg border border-border bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                {tech.name}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* Cover */}
      {project.cover_image && (
        <div className="mb-8 overflow-hidden rounded-2xl">
          <img src={project.cover_image} alt={project.title} className="w-full max-h-96 object-cover" loading="lazy" />
        </div>
      )}

      {/* Content */}
      <div className="rounded-2xl border border-border bg-background p-6 sm:p-8 mb-8">
        <div className="prose-custom [&_img]:max-w-full [&_img]:rounded-xl [&_pre]:rounded-xl [&_pre]:border [&_pre]:border-border [&_pre]:bg-muted [&_pre]:p-4 [&_h2]:mt-8 [&_h2]:mb-4 [&_p]:my-4 [&_p]:leading-relaxed">
          {parse(project.content || '')}
        </div>
      </div>

      {/* Gallery */}
      {project.images && project.images.length > 0 && (
        <div>
          <h2 className="mb-4 text-xl font-semibold">Gallery</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {project.images.map((img) => (
              <div key={img.id}>
                <img src={img.image_path} alt={img.caption || ''} className="w-full rounded-xl object-cover" loading="lazy" />
                {img.caption && <p className="mt-1 text-center text-xs text-muted-foreground">{img.caption}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
