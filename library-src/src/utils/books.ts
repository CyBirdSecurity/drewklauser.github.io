export type Medium = 'hardcover' | 'paperback' | 'audiobook' | 'ebook';

export type Category =
  | 'Biography'
  | 'Business'
  | 'Cybersecurity'
  | 'Fiction'
  | 'Finance'
  | 'Leadership'
  | 'Management'
  | 'Productivity'
  | 'Science'
  | 'Self-Help'
  | 'Sports'
  | 'Technology';

export interface Book {
  title: string;
  author: string;
  year_read: number;
  categories: Category[];
  medium: Medium;
  in_progress: boolean;
  ranking: number | null;
  notes: string;
  // Computed at build time
  slug: string;
  hasCover: boolean;
  coverUrl: string | null;
}

export const CATEGORY_COLORS: Record<string, string> = {
  Biography:    '#8B4513',  // saddle brown
  Business:     '#1e3f8c',  // rich navy
  Cybersecurity:'#065f46',  // deep emerald
  Fiction:      '#4c1d95',  // deep violet
  Finance:      '#92400e',  // dark cognac
  Leadership:   '#991b1b',  // deep crimson
  Management:   '#1e3a8a',  // steel blue
  Productivity: '#9a3412',  // burnt sienna
  Science:      '#075985',  // deep teal-blue
  'Self-Help':  '#14532d',  // hunter green
  Sports:       '#15803d',  // forest green
  Technology:   '#334155',  // slate
};

export const MEDIUM_HEIGHTS: Record<Medium, number> = {
  hardcover: 34,
  paperback: 26,
  audiobook: 28,
  ebook:     20,
};

export const MEDIUM_ICONS: Record<Medium, string> = {
  hardcover: '📖',
  paperback: '📄',
  audiobook: '🎧',
  ebook:     '📱',
};

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .substring(0, 60);
}

export function categoryColor(categories: string[]): string {
  return CATEGORY_COLORS[categories[0]] ?? '#334155';
}

export function spineHeight(medium: Medium): number {
  return MEDIUM_HEIGHTS[medium] ?? 26;
}
