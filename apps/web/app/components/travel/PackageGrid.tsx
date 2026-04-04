// apps/web/components/travel/PackageGrid.tsx
'use client';

import type { TravelPackage } from '@houselevi/travel-api';
import { PackageCard } from './PackageCard';

interface PackageGridProps {
  packages: TravelPackage[];
  loading: boolean;
  onInquire: (pkg: TravelPackage) => void;
}

export function PackageGrid({ packages, loading, onInquire }: PackageGridProps) {
  if (loading) {
    return (
      <div className="package-grid__loading">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="package-card__skeleton" />
        ))}
      </div>
    );
  }

  if (!packages.length) {
    return (
      <div className="package-grid__empty">
        <p>No upcoming journeys at this time. Check back soon.</p>
      </div>
    );
  }

  // Sort by order field
  const sorted = [...packages].sort((a, b) => a.order - b.order);
  const featured = sorted.find(p => p.featured) ?? sorted[0];
  const remaining = sorted.filter(p => p.id !== featured.id);

  return (
    <div className="package-grid">
      {/* Featured / hero package — full width */}
      <PackageCard
        package={featured}
        onInquire={onInquire}
        layout="featured"
      />

      {/* Remaining packages — 2-column grid */}
      {remaining.length > 0 && (
        <div className="package-grid__secondary">
          {remaining.map(pkg => (
            <PackageCard
              key={pkg.id}
              package={pkg}
              onInquire={onInquire}
              layout="grid"
            />
          ))}
        </div>
      )}
    </div>
  );
}
