// apps/web/components/travel/CustomInquiryModal.tsx
'use client';

import { useState } from 'react';
import type { CreateCustomInquiryDto } from '../../lib/types/travel.types';

interface CustomInquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCustomInquiryDto) => Promise<void>;
}

export function CustomInquiryModal({ isOpen, onClose, onSubmit }: CustomInquiryModalProps) {
  const [form, setForm] = useState<CreateCustomInquiryDto>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    desiredDestination: '',
    desiredDates: '',
    groupSize: undefined as number | undefined,
    budget: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const set = (field: keyof CreateCustomInquiryDto) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm(prev => ({ ...prev, [field]: e.target.value }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await onSubmit(form);
      setSuccess(true);
    } catch {
      setError('Something went wrong. Please email us at travel@houselevi.com');
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
            <p>We&rsquo;ll be in touch about your custom journey at <strong>{form.email}</strong>.</p>
            <button className="modal__btn" onClick={onClose}>Close</button>
          </div>
        ) : (
          <>
            <div className="modal__header">
              <h3 className="modal__title">Custom Travel Inquiry</h3>
              <p className="modal__subtitle">
                Speak with Lily about a private or bespoke journey.
              </p>
            </div>

            <form className="modal__form" onSubmit={handleSubmit}>
              <div className="modal__row">
                <div className="modal__field">
                  <label>First Name *</label>
                  <input type="text" value={form.firstName} onChange={set('firstName')} required placeholder="First name" />
                </div>
                <div className="modal__field">
                  <label>Last Name *</label>
                  <input type="text" value={form.lastName} onChange={set('lastName')} required placeholder="Last name" />
                </div>
              </div>

              <div className="modal__field">
                <label>Email Address *</label>
                <input type="email" value={form.email} onChange={set('email')} required placeholder="your@email.com" />
              </div>

              <div className="modal__field">
                <label>Phone</label>
                <input type="tel" value={form.phone} onChange={set('phone')} placeholder="+1 (555) 000-0000" />
              </div>

              <div className="modal__field">
                <label>Desired Destination(s)</label>
                <input
                  type="text"
                  value={form.desiredDestination}
                  onChange={set('desiredDestination')}
                  placeholder="e.g. Kenya, Patagonia..."
                />
              </div>

              <div className="modal__row">
                <div className="modal__field">
                  <label>Preferred Dates / Season</label>
                  <input
                    type="text"
                    value={form.desiredDates}
                    onChange={set('desiredDates')}
                    placeholder="e.g. March 2026, flexible..."
                  />
                </div>
                <div className="modal__field">
                  <label>Group Size</label>
                  <input
                    type="number"
                    min={1}
                    value={form.groupSize ?? ''}
                    onChange={set('groupSize')}
                    placeholder="No. of travelers"
                  />
                </div>
              </div>

              <div className="modal__field">
                <label>Approximate Budget (per person)</label>
                <input
                  type="text"
                  value={form.budget}
                  onChange={set('budget')}
                  placeholder="e.g. $10,000–$15,000"
                />
              </div>

              <div className="modal__field">
                <label>Tell us more *</label>
                <textarea
                  value={form.message}
                  onChange={set('message')}
                  required
                  rows={4}
                  placeholder="What kind of experience are you looking for?"
                />
              </div>

              {error && <p className="modal__error">{error}</p>}

              <p className="modal__disclaimer">
                Your inquiry will be sent to Levi at <a href="mailto:travel@houselevi.com">travel@houselevi.com</a>.
              </p>

              <button type="submit" className="modal__btn modal__btn--submit" disabled={submitting}>
                {submitting ? 'Sending...' : 'SEND INQUIRY'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}