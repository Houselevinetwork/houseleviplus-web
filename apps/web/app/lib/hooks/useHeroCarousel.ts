import { useEffect, useState } from 'react';

interface HeroItem {
  _id: string;
  title: string;
  subtitle: string;
  image: string;
  category: string;
}

export function useHeroCarousel() {
  const [heroItems, setHeroItems] = useState<HeroItem[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHeroContent = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/hero-carousel`
        );
        const data = await response.json();
        setHeroItems(Array.isArray(data) ? data.slice(0, 6) : []);
      } catch (error) {
        console.error('Failed to load hero content:', error);
        setHeroItems([]);
      } finally {
        setLoading(false);
      }
    };

    loadHeroContent();
  }, []);

  useEffect(() => {
    if (heroItems.length === 0) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroItems.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroItems.length]);

  return { heroItems, currentSlide, setCurrentSlide, loading };
}
