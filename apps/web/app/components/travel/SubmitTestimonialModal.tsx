// apps/web/components/travel/SubmitTestimonialModal.tsx
'use client';

import { useState } from 'react';
import type { TravelPackage, SubmitTestimonialDto } from '@houselevi/travel-api';

interface SubmitTestimonialModalProps {
  isOpen: boolean;
  packages: TravelPackage[];
  onClose: () => void;
  onSubmit: (data: SubmitTestimonialDto) => Promise<void>;
}

export function SubmitTestimonialModal({
  isOpen,
  packages,
  onClose,
  onSubmit,
}: SubmitTestimonialModalProps) {
  const [form, setForm] = useState<SubmitTestimonialDto>({
    packageId: '',
    packageSlug: '',
    destination: '',
    clientName: '',
    clientEmail: '',
    quote: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const set = (field: keyof SubmitTestimonialDto) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm((prev: any) => ({ ...prev, [field]: e.target.value }));
    };

  const handlePackageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = packages.find(p => p.id === e.target.value);
    setForm((prev: any) => ({
      ...prev,
      packageId: selected?.id ?? '',
      packageSlug: selected?.slug ?? '',
      destination: selected?.destination ?? '',
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await onSubmit(form);
      setSuccess(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="modal__close" onClick={onClose} aria-label="Close">Ãƒâ€”</button>

        {success ? (
          <div className="modal__success">
            <h3>Thank you for sharing.</h3>
            <p>
              Your testimonial is under review and will be published once approved.
              We appreciate you taking the time to share your experience.
            </p>
            <button className="modal__btn" onClick={onClose}>Close</button>
          </div>
        ) : (
          <>
            <div className="modal__header">
              <h3 className="modal__title">Share Your Experience</h3>
              <p className="modal__subtitle">
                Traveled with Levi? We&rsquo;d love to hear your story.
                Your review will be published after a brief review.
              </p>
            </div>

            <form className="modal__form" onSubmit={handleSubmit}>
              <div className="modal__field">
                <label>Which journey did you take?</label>
                <select value={form.packageId} onChange={handlePackageChange}>
                  <option value="">Select a destination...</option>
                  {packages.map(p => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                  <option value="other">Other / Past Journey</option>
                </select>
              </div>

              {(!form.packageId || form.packageId === 'other') && (
                <div className="modal__field">
                  <label>Destination / Year</label>
                  <input
                    type="text"
                    value={form.destination}
                    onChange={set('destination')}
                    placeholder="e.g. Kenya 2024"
                  />
                </div>
              )}

              <div className="modal__row">
                <div className="modal__field">
                  <label>Your Name *</label>
                  <input
                    type="text"
                    value={form.clientName}
                    onChange={set('clientName')}
                    required
                    placeholder="e.g. Howard S."
                  />
                </div>
                <div className="modal__field">
                  <label>Email Address *</label>
                  <input
                    type="email"
                    value={form.clientEmail}
                    onChange={set('clientEmail')}
                    required
                    placeholder="For verification only Ã¢â‚¬â€ not published"
                  />
                </div>
              </div>

              <div className="modal__field">
                <label>Your Review *</label>
                <textarea
                  value={form.quote}
                  onChange={set('quote')}
                  required
                  rows={5}
                  placeholder="Tell us about your experience..."
                />
              </div>

              {error && <p className="modal__error">{error}</p>}

              <p className="modal__disclaimer">
                Your email will not be published. Reviews are moderated before appearing on the site.
              </p>

              <button type="submit" className="modal__btn modal__btn--submit" disabled={submitting}>
                {submitting ? 'Submitting...' : 'SUBMIT REVIEW'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
