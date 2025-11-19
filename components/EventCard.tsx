
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
    <div onClick={onClick} className="group cursor-pointer bg-branco-nevoa dark:bg-verde-mata rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
      <div className="relative aspect-video overflow-hidden">
        <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors duration-300"></div>
      </div>
      <div className="p-5">
        <div className="flex justify-between items-center">
            <p className="font-sans text-sm font-bold text-dourado-suave uppercase tracking-wider">{formatDate(eventDate)}</p>
            {isPast && (
                <span className="flex items-center text-xs font-semibold text-marrom-seiva/60 dark:text-creme-velado/60 bg-marrom-seiva/10 dark:bg-creme-velado/10 px-2 py-0.5 rounded-full">
                    <ClockIcon className="w-3 h-3 mr-1" />
                    Encerrado
                </span>
            )}
        </div>
        <h3 className="font-serif text-xl font-bold text-verde-mata dark:text-creme-velado mt-2 line-clamp-2 group-hover:text-dourado-suave transition-colors duration-200">{event.title}</h3>
        <p className="font-sans text-sm text-marrom-seiva/80 dark:text-creme-velado/80 mt-2 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-dourado-suave inline-block"></span>
            {event.location}
        </p>
      </div>
    </div>
  );
};

export default EventCard;
