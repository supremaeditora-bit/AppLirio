
import React, { useRef } from 'react';
import { ContentItem, User } from '../types';
import ContentCard from './ContentCard';
import { ChevronLeftIcon, ChevronRightIcon } from './Icons';

interface CarouselProps {
  title: string;
  items: ContentItem[];
  onCardClick: (id: string) => void; 
  user: User | null;
}

export default function Carousel({ title, items, onCardClick, user }: CarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' 
        ? scrollLeft - clientWidth * 0.8
        : scrollLeft + clientWidth * 0.8;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <section>
      <h2 className="font-serif text-3xl font-semibold mb-4 text-verde-mata dark:text-dourado-suave">{title}</h2>
      <div className="relative group">
        <button 
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-creme-velado/50 dark:bg-verde-mata/50 rounded-full text-marrom-seiva dark:text-creme-velado opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:scale-110 -translate-x-4"
          aria-label="Scroll left"
        >
          <ChevronLeftIcon />
        </button>
        <div 
          ref={scrollRef}
          className="flex space-x-4 sm:space-x-6 overflow-x-auto scrollbar-hide py-2 -mx-4 sm:-mx-8 md:-mx-12 px-4 sm:px-8 md:px-12"
        >
          {items.map(item => (
            <ContentCard 
              key={item.id} 
              item={item} 
              onClick={() => onCardClick(item.id)}
              isCompleted={user?.completedContentIds?.includes(item.id)}
            />
          ))}
        </div>
        <button 
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-creme-velado/50 dark:bg-verde-mata/50 rounded-full text-marrom-seiva dark:text-creme-velado opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:scale-110 translate-x-4"
          aria-label="Scroll right"
        >
          <ChevronRightIcon />
        </button>
      </div>
    </section>
  );
}