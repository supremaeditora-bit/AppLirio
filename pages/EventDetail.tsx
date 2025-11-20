import React, { useState, useEffect } from 'react';
import { Event, User, Page } from '../types';
import { getEventById, registerForEvent } from '../services/api';
import Spinner from '../components/Spinner';
import Button from '../components/Button';
import { ChevronLeftIcon, CalendarDaysIcon } from '../components/Icons';
import TicketModal from '../components/TicketModal';

interface EventDetailProps {
  id: string;
  user: User | null;
  onNavigate: (page: Page, id?: string) => void;
}

export default function EventDetail({ id, user, onNavigate }: EventDetailProps) {
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isTicketOpen, setIsTicketOpen] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      setIsLoading(true);
      const data = await getEventById(id);
      setEvent(data || null);
      if (user && data) {
        setIsRegistered(data.attendeeIds.includes(user.id));
      }
      setIsLoading(false);
    };
    fetchEvent();
  }, [id, user]);

  const handleRegister = async () => {
    if (!user || !event) return;
    
    // Se for pago, vai para checkout
    if (event.price && event.price > 0) {
        onNavigate('checkout', event.id);
        return;
    }

    setIsRegistering(true);
    await registerForEvent(event.id, user.id);
    setIsRegistered(true);
    setIsRegistering(false);
  };
  
  if (isLoading) {
    return <div className="flex justify-center items-center h-full"><Spinner /></div>;
  }

  if (!event) {
    return <div className="text-center p-8">Evento não encontrado.</div>;
  }

  const eventDate = new Date(event.date);
  const isPast = eventDate < new Date();
  const formattedDate = eventDate.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const formattedTime = eventDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  return (
    <>
      <div className="relative">
        <button onClick={() => onNavigate('events')} className="absolute top-4 left-4 z-20 p-2 bg-creme-velado/50 dark:bg-verde-mata/50 rounded-full text-marrom-seiva dark:text-creme-velado backdrop-blur-sm">
          <ChevronLeftIcon className="w-6 h-6" />
        </button>
        <div className="h-[40vh] sm:h-[50vh] w-full relative">
          <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#D9C7A6] from-20% via-[#D9C7A6]/80 via-60% to-transparent dark:from-[#152218] dark:from-20% dark:via-[#152218]/80 dark:via-60% transition-colors duration-500"></div>
        </div>
        <div className="container mx-auto p-4 sm:p-8 -mt-24 relative z-10">
          <div className="max-w-4xl mx-auto">
            <h1 className="font-serif text-4xl sm:text-5xl font-bold my-2 text-verde-mata dark:text-dourado-suave">{event.title}</h1>
            
            <div className="my-6 p-4 bg-branco-nevoa/80 dark:bg-verde-mata/80 backdrop-blur-sm rounded-xl flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <CalendarDaysIcon className="w-10 h-10 text-dourado-suave flex-shrink-0" />
              <div>
                <p className="font-sans font-bold text-lg text-verde-mata dark:text-creme-velado">{formattedDate}</p>
                <p className="font-sans text-marrom-seiva/80 dark:text-creme-velado/80">{formattedTime} • {event.location}</p>
              </div>
            </div>

            <div className="font-sans text-base leading-relaxed space-y-4 text-marrom-seiva dark:text-creme-velado/90 whitespace-pre-wrap">
              <p>{event.description}</p>
            </div>

            <div className="my-6">
                <p className="font-sans text-lg font-bold text-verde-mata dark:text-creme-velado">
                    Valor: <span className="text-dourado-suave">{event.price && event.price > 0 ? `R$ ${event.price.toFixed(2).replace('.', ',')}` : 'Gratuito'}</span>
                </p>
            </div>
            
            <div className="mt-8 pt-8 border-t border-marrom-seiva/10 dark:border-creme-velado/10">
              {isPast ? (
                <Button fullWidth disabled>Evento Encerrado</Button>
              ) : isRegistered ? (
                <Button fullWidth onClick={() => setIsTicketOpen(true)}>Ver Ingresso</Button>
              ) : (
                <Button fullWidth onClick={handleRegister} disabled={isRegistering}>
                  {isRegistering ? <Spinner variant="button" /> : (event.price && event.price > 0 ? 'Comprar Ingresso' : 'Confirmar Presença')}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      {user && event && (
        <TicketModal isOpen={isTicketOpen} onClose={() => setIsTicketOpen(false)} event={event} user={user} />
      )}
    </>
  );
}