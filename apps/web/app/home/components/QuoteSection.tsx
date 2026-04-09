'use client';

import { useEffect, useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'https://api.houselevi.com';

export default function QuoteSection() {
  const [quote, setQuote]   = useState('');
  const [author, setAuthor] = useState('');

  useEffect(() => {
    fetch(`${API}/home/config`)
      .then(r => r.json())
      .then(d => {
        if (d?.quote) { setQuote(d.quote); setAuthor(d.quoteAuthor ?? ''); }
      })
      .catch(() => {});
  }, []);

  if (!quote) return null;

  return (
    <section className="quote-section">
      <blockquote className="quote-text">&ldquo;{quote}&rdquo;</blockquote>
      {author && <p className="quote-author">â€” {author}</p>}
    </section>
  );
}
