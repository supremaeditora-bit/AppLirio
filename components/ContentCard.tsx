
import React from 'react';
import { ContentItem } from '../types';
import { PlayCircleIcon, CheckCircleIcon } from './Icons';

interface ContentCardProps {
  item: ContentItem;
  onClick: () => void;
  isCompleted?: boolean;
}

const ContentCard: React.FC<ContentCardProps> = ({ item, onClick, isCompleted }) => {
  return (
    <div 
      key={item.id}
      onClick={onClick} 
      className="flex-shrink-0 w-40 sm:w-48 md:w-56 group cursor-pointer transition-all duration-300 hover:-translate-y-2"
    >
      <div className="relative aspect-[3/4] rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 bg-parchment-light dark:bg-parchment-dark">
        <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-300"></div>

        {item.badge && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold uppercase px-2 py-1 rounded-full shadow-md">
            {item.badge}
          </div>
        )}

        {isCompleted && (
           <div className="absolute top-2 left-2 text-green-400 animate-scale-in">
             <CheckCircleIcon className="w-7 h-7 drop-shadow-md" />
           </div>
        )}

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform group-hover:scale-110">
            <PlayCircleIcon className="w-16 h-16 text-white/90 drop-shadow-lg" />
        </div>
        
        {item.progress !== undefined && item.total !== undefined && (
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/30">
            <div 
              className="h-full bg-dourado-suave transition-all duration-500 ease-out" 
              style={{ width: `${(item.progress / item.total) * 100}%` }}
            ></div>
          </div>
        )}
      </div>
      <div className="mt-3 transition-opacity duration-300 group-hover:opacity-90">
        <p className="font-sans text-xs font-semibold uppercase text-marrom-seiva/70 dark:text-creme-velado/70 tracking-wide">{item.type}</p>
        <h3 className="font-serif font-semibold text-base leading-tight mt-1 text-verde-mata dark:text-creme-velado truncate group-hover:text-dourado-suave transition-colors duration-200">{item.title}</h3>
      </div>
    </div>
  );
};

export default ContentCard;
