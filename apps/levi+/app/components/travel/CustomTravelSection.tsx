// apps/web/components/travel/CustomTravelSection.tsx
'use client';

interface CustomTravelSectionProps {
  onInquire: () => void;
}

export function CustomTravelSection({ onInquire }: CustomTravelSectionProps) {
  return (
    <section className="custom-travel-section">
      <div className="custom-travel-section__inner">
        <h2 className="custom-travel-section__title">Custom Travel Opportunities</h2>
        <p className="custom-travel-section__body">
          If you&rsquo;re interested in private tours of the destinations mentioned,
          or if there is another location you are interested in, please contact Levi.
        </p>
        <button
          className="custom-travel-section__cta"
          onClick={onInquire}
        >
          INQUIRE NOW
        </button>
      </div>
    </section>
  );
}