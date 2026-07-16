import { useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchPublicProjects } from '@/store/slices/publicProjectsSlice';
import { useDocumentTitle } from '@/utils/useDocumentTitle';
import ProjectCard from '@/components/public/ProjectCard';

export default function ProjectsPage() {
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { items, pagination, status } = useAppSelector((state) => state.publicProjects);
  const page = Number(searchParams.get('page')) || 1;

  useDocumentTitle('Projects');

  const loadProjects = useCallback(() => {
    dispatch(fetchPublicProjects({ page, per_page: 9 }));
  }, [dispatch, page]);

  useEffect(() => { loadProjects(); }, [loadProjects]);

  const setPage = (p) => {
    setSearchParams({ page: String(p) });
    window.scrollTo(0, 0);
  };

  return (
    <div className="animate-fade-in py-8">
      <h1 className="mb-8 text-3xl font-bold">Projects</h1>

      {status === 'loading' && (
        <div className="flex justify-center py-12">
          <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}
      {status === 'succeeded' && items.length === 0 && (
        <div className="py-12 text-center text-muted-foreground">No projects yet</div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>

      {pagination.lastPage > 1 && (
        <div className="mt-8 flex justify-center gap-x-1">
          {Array.from({ length: pagination.lastPage }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`flex size-9 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                p === page ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
