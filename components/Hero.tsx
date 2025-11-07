import React from 'react';
import { ContentItem } from '../types';
import { PlayIcon } from './Icons';

interface HeroProps {
  content: ContentItem;
  onPlayClick: () => void;
}

export default function Hero({ content, onPlayClick }: HeroProps) {
  return (
    <section className="relative h-[60vh] sm:h-[70vh] w-full flex items-end text-white">
      <div className="absolute inset-0">
        <img src={content.imageUrl} alt={content.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent"></div>
      </div>
      <div className="relative z-10 p-4 sm:p-8 md:p-12 max-w-2xl">
        <span className="font-sans font-semibold tracking-wider uppercase text-dourado-suave">{content.subtitle}</span>
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold my-3">
          {content.title}
        </h1>
        <p className="font-sans text-base sm:text-lg text-white/90 leading-relaxed mb-8">
          {content.description}
        </p>
        <button 
          onClick={onPlayClick}
          className="flex items-center justify-center bg-dourado-suave text-verde-mata font-bold py-3 px-8 rounded-full text-lg hover:opacity-90 transition-all duration-200 transform hover:scale-105"
        >
          <PlayIcon />
          <span>Começar Jornada</span>
        </button>
      </div>
    </section>
  );
}
