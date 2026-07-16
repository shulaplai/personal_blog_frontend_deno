/**
 * Reusable skeleton loading placeholders for public pages.
 */

export function SkeletonLine({ width = 'w-full' }) {
  return <div className={`h-4 animate-pulse rounded bg-muted ${width}`} />;
}

export function SkeletonBlock() {
  return (
    <div className="space-y-3">
      <SkeletonLine width="w-3/4" />
      <SkeletonLine width="w-1/2" />
      <SkeletonLine width="w-5/6" />
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl border bg-background p-5">
      <div className="h-5 w-2/3 rounded bg-muted mb-3" />
      <div className="h-4 w-full rounded bg-muted mb-2" />
      <div className="h-4 w-4/5 rounded bg-muted" />
    </div>
  );
}
