import React from 'react';
import { ContentItem } from '../types';
import { PlayCircleIcon, CheckCircleIcon } from './Icons';

interface ContentCardProps {
  item: ContentItem;
  onClick: () => void;
  isCompleted?: boolean;
}

// FIX: Changed component to React.FC to correctly handle React's special `key` prop and resolve TypeScript errors.
const ContentCard: React.FC<ContentCardProps> = ({ item, onClick, isCompleted }) => {
  return (
    <div 
      onClick={onClick} 
      className="flex-shrink-0 w-40 sm:w-48 md:w-56 group cursor-pointer"
    >
      <div className="relative aspect-[3/4] rounded-xl overflow-hidden shadow-lg bg-parchment-light dark:bg-parchment-dark">
        <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

        {item.badge && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold uppercase px-2 py-1 rounded-full">
            {item.badge}
          </div>
        )}

        {isCompleted && (
           <div className="absolute top-2 left-2 text-green-400">
             <CheckCircleIcon className="w-7 h-7" />
           </div>
        )}

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <PlayCircleIcon className="w-16 h-16 text-white/80" />
        </div>
        
        {item.progress !== undefined && item.total !== undefined && (
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/30">
            <div 
              className="h-full bg-dourado-suave" 
              style={{ width: `${(item.progress / item.total) * 100}%` }}
            ></div>
          </div>
        )}
      </div>
      <div className="mt-2">
        <p className="font-sans text-xs font-semibold uppercase text-marrom-seiva/70 dark:text-creme-velado/70">{item.type}</p>
        <h3 className="font-serif font-semibold text-base leading-tight mt-0.5 text-verde-mata dark:text-creme-velado truncate">{item.title}</h3>
      </div>
    </div>
  );
};

export default ContentCard;
