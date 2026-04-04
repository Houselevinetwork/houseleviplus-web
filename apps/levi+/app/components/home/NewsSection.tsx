'use client';

import { useEffect, useState } from 'react';

interface NewsArticle {
  _id: string;
  image: string;
  title: string;
  excerpt: string;
  link: string;
}

export function NewsSection() {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/news`);
      const data = await response.json();
      setNews(Array.isArray(data) ? data.slice(0, 3) : []);
    } catch (error) {
      console.error('Failed to load news:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading news...</div>;

  return (
    <div className="section-container">
      <h2>Capital of Afrika Times News</h2>
      <p className="section-subtitle">Latest updates from the African entertainment scene</p>
      <div className="news-grid">
        {news.map((article) => (
          <article key={article._id} className="news-card">
            <img src={article.image} alt={article.title} />
            <h3>{article.title}</h3>
            <p>{article.excerpt}</p>
            <a href={article.link} className="btn btn-text">Read More →</a>
          </article>
        ))}
      </div>
    </div>
  );
}