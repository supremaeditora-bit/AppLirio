import React, { useState, useEffect } from 'react';
import { Event, User, Page, PageHeaderConfig } from '../types';
import { getEvents, getAppearanceSettings } from '../services/api';
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
  const [headerConfig, setHeaderConfig] = useState<PageHeaderConfig | undefined>(undefined);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('proximos');
  
  const canManage = user && user.role === 'admin';

  const fetchEvents = async () => {
    setIsLoading(true);
    const [data, settings] = await Promise.all([
        getEvents(),
        getAppearanceSettings()
    ]);
    setEvents(data);
    if (settings.pageHeaders?.events) {
        setHeaderConfig(settings.pageHeaders.events);
    }
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
      <div className="min-h-full bg-creme-velado dark:bg-verde-escuro-profundo">
        {/* Hero Header */}
        <div className="relative h-[40vh] sm:h-[50vh] w-full">
            <img 
                src={headerConfig?.imageUrl || "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=1470&auto=format&fit=crop"}
                alt="Eventos" 
                className="w-full h-full object-cover" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#D9C7A6] from-20% via-[#D9C7A6]/80 via-60% to-transparent dark:from-[#152218] dark:from-20% dark:via-[#152218]/80 dark:via-60% transition-colors duration-500"></div>
            
            {canManage && (
                <button 
                    onClick={() => setIsFormOpen(true)}
                    className="absolute top-4 right-4 bg-white/90 dark:bg-verde-mata/90 p-3 rounded-full shadow-lg hover:scale-110 transition-transform z-20 text-verde-mata dark:text-dourado-suave flex items-center gap-2 font-semibold text-sm"
                >
                    <PlusIcon className="w-5 h-5" />
                    <span className="hidden sm:inline">Novo Evento</span>
                </button>
            )}

            <div className="absolute bottom-0 left-0 w-full p-6 sm:p-12">
                <div className="container mx-auto">
                    <h1 className="font-serif text-4xl sm:text-6xl font-bold text-verde-mata dark:text-dourado-suave drop-shadow-sm">
                        {headerConfig?.title || "Eventos"}
                    </h1>
                    <p className="text-marrom-seiva/80 dark:text-creme-velado/90 mt-2 text-lg max-w-xl font-sans font-medium drop-shadow-md">
                        {headerConfig?.subtitle || "Participe de nossas conferências, workshops e encontros para crescer em comunhão."}
                    </p>
                </div>
            </div>
        </div>

        <div className="container mx-auto p-4 sm:p-8">
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