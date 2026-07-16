/**
 * Shared novel status labels and Tailwind style classes.
 * Used by NovelCard, NovelDetailPage, and any other novel display components.
 */
export const NOVEL_STATUS_LABELS = {
  ongoing: 'Ongoing',
  completed: 'Completed',
  hiatus: 'Hiatus',
};

export const NOVEL_STATUS_STYLES = {
  ongoing: 'border-blue-500/40 bg-blue-500/15 text-blue-600 dark:text-blue-300',
  completed: 'border-green-500/40 bg-green-500/15 text-green-600 dark:text-green-300',
  hiatus: 'border-amber-500/40 bg-amber-500/15 text-amber-600 dark:text-amber-300',
};

export function getNovelStatusStyle(status) {
  return NOVEL_STATUS_STYLES[status] || 'border-muted-foreground/40 bg-muted text-muted-foreground';
}
