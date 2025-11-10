import React from 'react';
import { Event } from '../types';
import { ClockIcon } from './Icons';

interface EventCardProps {
  event: Event;
  onClick: () => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, onClick }) => {
  const eventDate = new Date(event.date);
  const isPast = eventDate < new Date();

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  };

  return (
    <div onClick={onClick} className="group cursor-pointer bg-branco-nevoa dark:bg-verde-mata rounded-2xl shadow-lg overflow-hidden transition-transform hover:-translate-y-1">
      <div className="relative aspect-video">
        <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
      </div>
      <div className="p-4">
        <div className="flex justify-between items-center">
            <p className="font-sans text-sm font-bold text-dourado-suave">{formatDate(eventDate)}</p>
            {isPast && (
                <span className="flex items-center text-xs font-semibold text-marrom-seiva/60 dark:text-creme-velado/60">
                    <ClockIcon className="w-4 h-4 mr-1" />
                    Encerrado
                </span>
            )}
        </div>
        <h3 className="font-serif text-xl font-bold text-verde-mata dark:text-creme-velado mt-1 line-clamp-2">{event.title}</h3>
        <p className="font-sans text-sm text-marrom-seiva/80 dark:text-creme-velado/80 mt-2">{event.location}</p>
      </div>
    </div>
  );
};

export default EventCard;