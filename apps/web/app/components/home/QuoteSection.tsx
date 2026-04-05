'use client';

import { useEffect, useState } from 'react';

export function QuoteSection() {
  const [quote, setQuote] = useState({ text: 'Loading...', author: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuote();
  }, []);

  const loadQuote = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/quotes/random`);
      const data = await response.json();
      setQuote(data);
    } catch (error) {
      console.error('Failed to load quote:', error);
      setQuote({ text: 'Create with purpose, build with passion', author: 'House Levi+' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="quote-skeleton"></div>;

  return (
    <section className="quote-section">
      <div className="quote-container">
        <blockquote className="quote-text">"{quote.text}"</blockquote>
        <p className="quote-author">â€” {quote.author}</p>
      </div>
    </section>
  );
}
