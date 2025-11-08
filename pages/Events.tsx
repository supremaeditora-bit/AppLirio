import React, { useState, useEffect } from 'react';
import { Event, User, Page } from '../types';
import { getEvents } from '../services/api';
import Spinner from '../components/Spinner';
import EventCard from '../components/EventCard';
import Button from '../components/Button';
import { PlusIcon } from '../components/Icons';
import EventForm from '../components/admin/EventForm';
import SearchAndFilter from '../components/SearchAndFilter';

interface EventsProps {
  user: User | null;
  onNavigate: (page: Page, id?: string) => void;
}

const filterOptions = [
    { value: 'proximos', label: 'Próximos Eventos' },
    { value: 'passados', label: 'Eventos Passados' },
];

export default function Events({ user, onNavigate }: EventsProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('proximos');
  
  const canManage = user && user.role === 'admin';

  const fetchEvents = async () => {
    setIsLoading(true);
    const data = await getEvents();
    setEvents(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    let results = [...events];
    const now = new Date();
    
    if (activeFilter === 'proximos') {
        results = results.filter(e => new Date(e.date) >= now);
    } else if (activeFilter === 'passados') {
        results = results.filter(e => new Date(e.date) < now);
    }
    
    if (searchQuery) {
        const lowercasedQuery = searchQuery.toLowerCase();
        results = results.filter(event => 
            event.title.toLowerCase().includes(lowercasedQuery) ||
            event.description.toLowerCase().includes(lowercasedQuery) ||
            event.location.toLowerCase().includes(lowercasedQuery)
        );
    }
    
    setFilteredEvents(results);
  }, [searchQuery, activeFilter, events]);
  
  const handleFormClose = () => {
      setIsFormOpen(false);
      fetchEvents();
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-full"><Spinner /></div>;
  }

  return (
    <>
      <div className="container mx-auto p-4 sm:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div className="text-center sm:text-left">
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-verde-mata dark:text-dourado-suave">Eventos</h1>
            <p className="font-sans text-lg text-marrom-seiva/80 dark:text-creme-velado/80 mt-2 max-w-2xl mx-auto sm:mx-0">
              Participe de nossas conferências, workshops e encontros para crescer em comunhão.
            </p>
          </div>
          {canManage && (
              <Button onClick={() => setIsFormOpen(true)} className="mt-4 sm:mt-0 self-center sm:self-auto">
                  <PlusIcon className="w-5 h-5 mr-2" />
                  Novo Evento
              </Button>
          )}
        </div>

        <SearchAndFilter
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            filterOptions={filterOptions}
            searchPlaceholder="Buscar por eventos..."
        />

        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredEvents.map(event => (
              <EventCard key={event.id} event={event} onClick={() => onNavigate('eventDetail', event.id)} />
            ))}
          </div>
        ) : (
          <div className="text-center p-8 bg-branco-nevoa dark:bg-verde-mata rounded-2xl">
            <p className="font-sans text-marrom-seiva/70 dark:text-creme-velado/70">
              Nenhum evento encontrado para os filtros selecionados.
            </p>
          </div>
        )}
      </div>

      {canManage && user && (
          <EventForm
            isOpen={isFormOpen}
            onClose={handleFormClose}
            event={null}
            user={user}
          />
      )}
    </>
  );
}