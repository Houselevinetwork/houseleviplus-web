// apps/web/components/travel/PackageCard.tsx
'use client';

import type { TravelPackage } from '../../lib/types/travel.types';

interface PackageCardProps {
  package: TravelPackage;
  onInquire: (pkg: TravelPackage) => void;
  layout?: 'featured' | 'grid';
}

export function PackageCard({ package: pkg, onInquire, layout = 'grid' }: PackageCardProps) {
  const spotsLow = pkg.spotsRemaining > 0 && pkg.spotsRemaining <= 5;
  const soldOut = pkg.spotsRemaining === 0 || pkg.status === 'sold_out';

  if (layout === 'featured') {
    return (
      <article className="package-card package-card--featured">
        <div className="package-card__image-wrap package-card__image-wrap--featured">
          {pkg.heroImageUrl ? (
            <img
              src={pkg.heroImageUrl}
              alt={pkg.heroImageAlt ?? pkg.destination}
              className="package-card__image"
              loading="eager"
            />
          ) : (
            <div className="package-card__image-placeholder">
              <span>{pkg.destination}</span>
            </div>
          )}
        </div>

        <div className="package-card__body package-card__body--featured">
          {pkg.tagline && (
            <p
              className="package-card__tagline"
              style={{ color: pkg.taglineColor === 'red' ? '#c0392b' : '#c9a84c' }}
            >
              {pkg.tagline}
            </p>
          )}
          <h3 className="package-card__title">{pkg.title}</h3>
          <p className="package-card__description">{pkg.description}</p>

          {pkg.photographerNote && (
            <p className="package-card__photographer-note">
              <em>{pkg.photographerNote}</em>
            </p>
          )}

          {pkg.duration && (
            <p className="package-card__duration">{pkg.duration}</p>
          )}

          {spotsLow && !soldOut && (
            <p className="package-card__spots package-card__spots--low">
              Only {pkg.spotsRemaining} {pkg.spotsRemaining === 1 ? 'Space' : 'Spaces'} Left
            </p>
          )}

          <button
            className={`package-card__cta ${soldOut ? 'package-card__cta--disabled' : ''}`}
            onClick={() => !soldOut && onInquire(pkg)}
            disabled={soldOut}
          >
            {soldOut ? 'Sold Out' : 'INQUIRE NOW'}
          </button>
        </div>
      </article>
    );
  }

  // Grid layout (default)
  return (
    <article className="package-card package-card--grid">
      <div className="package-card__image-wrap">
        {pkg.heroImageUrl ? (
          <img
            src={pkg.heroImageUrl}
            alt={pkg.heroImageAlt ?? pkg.destination}
            className="package-card__image"
            loading="lazy"
          />
        ) : (
          <div className="package-card__image-placeholder">
            <span>{pkg.destination}</span>
          </div>
        )}
      </div>

      <div className="package-card__body">
        {pkg.tagline && (
          <p
            className="package-card__tagline"
            style={{ color: pkg.taglineColor === 'red' ? '#c0392b' : '#c9a84c' }}
          >
            {pkg.tagline}
          </p>
        )}
        <h3 className="package-card__title">{pkg.title}</h3>
        <p className="package-card__description">{pkg.description}</p>

        {pkg.photographerNote && (
          <p className="package-card__photographer-note">
            <em>{pkg.photographerNote}</em>
          </p>
        )}

        {spotsLow && !soldOut && (
          <p className="package-card__spots package-card__spots--low">
            Only {pkg.spotsRemaining} {pkg.spotsRemaining === 1 ? 'Space' : 'Spaces'} Left
          </p>
        )}

        <button
          className={`package-card__cta ${soldOut ? 'package-card__cta--disabled' : ''}`}
          onClick={() => !soldOut && onInquire(pkg)}
          disabled={soldOut}
        >
          {soldOut ? 'Sold Out' : 'INQUIRE NOW'}
        </button>
      </div>
    </article>
  );
}