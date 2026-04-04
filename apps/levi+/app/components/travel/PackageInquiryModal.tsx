// apps/web/components/travel/PackageInquiryModal.tsx
'use client';

import { useState } from 'react';
import type { TravelPackage, CreateInquiryDto } from '@houselevi/travel-api';

interface PackageInquiryModalProps {
  isOpen: boolean;
  package: TravelPackage;
  onClose: () => void;
  onSubmit: (data: Omit<CreateInquiryDto, 'packageId' | 'packageSlug'>) => Promise<void>;
}

export function PackageInquiryModal({
  isOpen,
  package: pkg,
  onClose,
  onSubmit,
}: PackageInquiryModalProps) {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: '',
    numberOfTravelers: 1,
    isPhotographer: false,
    message: '',
    hearAboutUs: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = e.target.type === 'checkbox'
      ? (e.target as HTMLInputElement).checked
      : e.target.value;
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await onSubmit(form);
      setSuccess(true);
    } catch {
      setError('Something went wrong. Please email us directly at travel@houselevi.com');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="modal__close" onClick={onClose} aria-label="Close">×</button>

        {success ? (
          <div className="modal__success">
            <h3>Thank you, {form.firstName}.</h3>
            <p>
              We&rsquo;ve received your inquiry for <strong>{pkg.title}</strong> and will
              be in touch at <strong>{form.email}</strong> shortly.
            </p>
            <button className="modal__btn" onClick={onClose}>Close</button>
          </div>
        ) : (
          <>
            <div className="modal__header">
              <h3 className="modal__title">Inquire: {pkg.title}</h3>
              {pkg.spotsRemaining > 0 && (
                <p className="modal__spots">
                  {pkg.spotsRemaining} {pkg.spotsRemaining === 1 ? 'space' : 'spaces'} remaining
                </p>
              )}
            </div>

            <form className="modal__form" onSubmit={handleSubmit}>
              <div className="modal__row">
                <div className="modal__field">
                  <label>First Name *</label>
                  <input
                    type="text"
                    value={form.firstName}
                    onChange={set('firstName')}
                    required
                    placeholder="First name"
                  />
                </div>
                <div className="modal__field">
                  <label>Last Name *</label>
                  <input
                    type="text"
                    value={form.lastName}
                    onChange={set('lastName')}
                    required
                    placeholder="Last name"
                  />
                </div>
              </div>

              <div className="modal__field">
                <label>Email Address *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={set('email')}
                  required
                  placeholder="your@email.com"
                />
              </div>

              <div className="modal__row">
                <div className="modal__field">
                  <label>Phone</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={set('phone')}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
                <div className="modal__field">
                  <label>Country</label>
                  <input
                    type="text"
                    value={form.country}
                    onChange={set('country')}
                    placeholder="Country of residence"
                  />
                </div>
              </div>

              <div className="modal__row">
                <div className="modal__field">
                  <label>Number of Travelers</label>
                  <input
                    type="number"
                    min={1}
                    max={pkg.groupSizeMax}
                    value={form.numberOfTravelers}
                    onChange={set('numberOfTravelers')}
                  />
                </div>
                <div className="modal__field modal__field--checkbox">
                  <label>
                    <input
                      type="checkbox"
                      checked={form.isPhotographer}
                      onChange={set('isPhotographer')}
                    />
                    I am attending as a photographer
                  </label>
                </div>
              </div>

              <div className="modal__field">
                <label>Message</label>
                <textarea
                  value={form.message}
                  onChange={set('message')}
                  rows={4}
                  placeholder="Any questions or special requirements..."
                />
              </div>

              <div className="modal__field">
                <label>How did you hear about us?</label>
                <select value={form.hearAboutUs} onChange={set('hearAboutUs')}>
                  <option value="">Select...</option>
                  <option value="instagram">Instagram</option>
                  <option value="website">Website</option>
                  <option value="referral">Friend / Referral</option>
                  <option value="email">Email Newsletter</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {error && <p className="modal__error">{error}</p>}

              <p className="modal__disclaimer">
                Your inquiry will be sent to <a href="mailto:travel@houselevi.com">travel@houselevi.com</a>.
                We respond within 48 hours.
              </p>

              <button
                type="submit"
                className="modal__btn modal__btn--submit"
                disabled={submitting}
              >
                {submitting ? 'Sending...' : 'SUBMIT INQUIRY'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}