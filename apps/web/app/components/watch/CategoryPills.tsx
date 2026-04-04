'use client';

export interface Category {
  _id: string;
  label: string;
  slug: string;
  icon?: string;
}

const DEFAULT_CATEGORIES: Category[] = [
  { _id: 'all',        label: 'All',           slug: 'all' },
  { _id: 'podcasts',   label: 'Podcasts',       slug: 'podcasts' },
  { _id: 'stage-plays',label: 'Stage Plays',    slug: 'stage-plays' },
  { _id: 'movies',     label: 'Movies',         slug: 'movies' },
  { _id: 'series',     label: 'TV Shows',       slug: 'series' },
  { _id: 'shorts',     label: 'Shorts',         slug: 'shorts' },
  { _id: 'sports',     label: 'Sports',         slug: 'sports' },
  { _id: 'kids',       label: 'Kids',           slug: 'kids' },
  { _id: 'music',      label: 'Music',          slug: 'music' },
  { _id: 'documentary',label: 'Documentaries',  slug: 'documentary' },
];

interface CategoryPillsProps {
  categories?: Category[];
  active: string;
  onChange: (slug: string) => void;
}

export function CategoryPills({ categories = DEFAULT_CATEGORIES, active, onChange }: CategoryPillsProps) {
  return (
    <div className="category-pills-wrap">
      <div className="category-pills">
        {categories.map(cat => (
          <button
            key={cat._id}
            className={`category-pill${active === cat.slug ? ' category-pill--active' : ''}`}
            onClick={() => onChange(cat.slug)}
          >
            {cat.icon && <span style={{ marginRight: 6 }}>{cat.icon}</span>}
            {cat.label}
          </button>
        ))}
      </div>
    </div>
  );
}
