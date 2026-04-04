// apps/web/components/travel/TestimonialsSection.tsx
'use client';

import type { TravelTestimonial } from '@houselevi/travel-api';

interface TestimonialsSectionProps {
  testimonials: TravelTestimonial[];
  loading: boolean;
  onSubmitTestimonial: () => void;
}

export function TestimonialsSection({
  testimonials,
  loading,
  onSubmitTestimonial,
}: TestimonialsSectionProps) {
  return (
    <section className="testimonials-section">
      <div className="testimonials-section__header">
        <h2 className="testimonials-section__title">TESTIMONIALS</h2>
      </div>

      {loading && (
        <div className="testimonials-section__loading">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="testimonial-card__skeleton" />
          ))}
        </div>
      )}

      {!loading && testimonials.length === 0 && (
        <div className="testimonials-section__empty">
          <p>Be the first to share your experience.</p>
        </div>
      )}

      {!loading && testimonials.length > 0 && (
        <div className="testimonials-section__grid">
          {testimonials.map((t, i) => (
            <TestimonialCard
              key={t.id}
              testimonial={t}
              align={i % 2 === 0 ? 'left' : 'right'}
            />
          ))}
        </div>
      )}

      {/* Guest CTA — guests who have traveled submit their review */}
      <div className="testimonials-section__submit">
        <p className="testimonials-section__submit-copy">
          Traveled with Levi? We&rsquo;d love to hear about your experience.
        </p>
        <button
          className="testimonials-section__submit-btn"
          onClick={onSubmitTestimonial}
        >
          SHARE YOUR STORY
        </button>
      </div>
    </section>
  );
}

// ── Individual testimonial card ────────────────────────────────────────────

interface TestimonialCardProps {
  testimonial: TravelTestimonial;
  align: 'left' | 'right';
}

function TestimonialCard({ testimonial: t, align }: TestimonialCardProps) {
  return (
    <article className={`testimonial-card testimonial-card--${align}`}>
      {t.imageUrl && (
        <div className="testimonial-card__image-wrap">
          <img
            src={t.imageUrl}
            alt={`${t.clientName} on ${t.destination ?? 'their journey'}`}
            className="testimonial-card__image"
            loading="lazy"
          />
        </div>
      )}
      <div className="testimonial-card__body">
        {t.destination && (
          <p className="testimonial-card__destination">{t.destination}</p>
        )}
        <blockquote className="testimonial-card__quote">
          &ldquo;{t.quote}&rdquo;
        </blockquote>
        <p className="testimonial-card__name">{t.clientName}</p>
      </div>
    </article>
  );
}
