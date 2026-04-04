// apps/web/app/components/travel/TravelNewsletterFooter.tsx
'use client';

import { useState } from 'react';
import type { SubscribeDto } from '@houselevi/travel-api';

interface TravelNewsletterFooterProps {
  onSubscribe: (data: SubscribeDto) => Promise<void>;
}

export function TravelNewsletterFooter({ onSubscribe }: TravelNewsletterFooterProps) {
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await onSubscribe({ firstName, email });
      setSuccess(true);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer className="travel-footer">
      <div className="travel-footer__inner">

        <div className="travel-footer__newsletter">
          <h3 className="travel-footer__title">JOIN THE ADVENTURE</h3>
          <p className="travel-footer__body">
            Be the first to hear about new journeys, limited spots,
            and travel stories from the field.
          </p>

          {success ? (
            <p className="travel-footer__success">
              Thank you, {firstName}. You&rsquo;re on the list.
            </p>
          ) : (
            <form className="travel-footer__form" onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="First name"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                required
                className="travel-footer__input"
              />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="travel-footer__input"
              />
              {error && <p className="travel-footer__error">{error}</p>}
              <button
                type="submit"
                className="travel-footer__btn"
                disabled={submitting}
              >
                {submitting ? 'Subscribing...' : 'SUBSCRIBE'}
              </button>
            </form>
          )}
        </div>

        <div className="travel-footer__contact">
          <p>For all travel enquiries:</p>
          <a href="mailto:travel@houselevi.com">travel@houselevi.com</a>
        </div>

      </div>
    </footer>
  );
}