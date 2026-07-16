import { useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchPublicNovels } from '@/store/slices/publicNovelsSlice';
import { useDocumentTitle } from '@/utils/useDocumentTitle';
import NovelCard from '@/components/public/NovelCard';

const GENRES = ['Sci-Fi', 'Fantasy', 'Wuxia', 'Romance', 'Suspense', 'Horror', 'Historical', 'Light Novel'];

export default function NovelsPage() {
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const { items, pagination, status } = useAppSelector((state) => state.publicNovels);

  useDocumentTitle('Novels');

  const genre = searchParams.get('genre') || '';
  const page = Number(searchParams.get('page')) || 1;

  const loadNovels = useCallback(() => {
    const params = { page, per_page: 9 };
    if (genre) params.genre = genre;
    dispatch(fetchPublicNovels(params));
  }, [dispatch, page, genre]);

  useEffect(() => { loadNovels(); }, [loadNovels]);

  const updateParams = (updates) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([k, v]) => {
      if (v) params.set(k, v); else params.delete(k);
    });
    if (updates.genre !== undefined) params.delete('page');
    setSearchParams(params);
  };

  return (
    <div className="animate-fade-in py-8">
      <h1 className="mb-6 text-3xl font-bold">Novels</h1>

      {/* Genre Filter */}
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          onClick={() => updateParams({ genre: '' })}
          className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
            !genre ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          All
        </button>
        {GENRES.map((g) => (
          <button
            key={g}
            onClick={() => updateParams({ genre: genre === g ? '' : g })}
            className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
              genre === g ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      {status === 'loading' && (
        <div className="flex justify-center py-12">
          <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}
      {status === 'succeeded' && items.length === 0 && (
        <div className="py-12 text-center text-muted-foreground">No novels yet</div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((novel) => (
          <NovelCard key={novel.id} novel={novel} />
        ))}
      </div>

      {pagination.lastPage > 1 && (
        <div className="mt-8 flex justify-center gap-x-1">
          {Array.from({ length: pagination.lastPage }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => { updateParams({ page: String(p) }); window.scrollTo(0, 0); }}
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
