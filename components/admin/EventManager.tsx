import React, { useState, useEffect } from 'react';
import { Event, User } from '../../types';
import { getEvents, deleteEvent } from '../../services/api';
import Spinner from '../Spinner';
import Button from '../Button';
import ConfirmationModal from '../ConfirmationModal';
import EventForm from './EventForm';
import { PencilIcon, TrashIcon, PlusIcon } from '../Icons';
import SearchAndFilter from '../SearchAndFilter';

interface EventManagerProps {
  user: User;
}

const filterOptions = [
    { value: 'proximos', label: 'Próximos' },
    { value: 'passados', label: 'Passados' },
];

export default function EventManager({ user }: EventManagerProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Event | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('proximos');

  const fetchEvents = async () => {
    setIsLoading(true);
    const eventList = await getEvents();
    setEvents(eventList);
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
            event.title.toLowerCase().includes(lowercasedQuery)
        );
    }
    
    setFilteredEvents(results);
  }, [searchQuery, activeFilter, events]);


  const handleOpenForm = (item: Event | null) => {
    setSelectedItem(item);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setSelectedItem(null);
    setIsFormOpen(false);
    fetchEvents();
  };

  const handleOpenConfirm = (item: Event) => {
    setSelectedItem(item);
    setIsConfirmOpen(true);
  };
  
  const handleDelete = async () => {
    if (selectedItem) {
      await deleteEvent(selectedItem.id);
      setIsConfirmOpen(false);
      setSelectedItem(null);
      fetchEvents();
    }
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('pt-BR');

  if (isLoading) {
    return <div className="flex justify-center py-10"><Spinner /></div>;
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-serif text-2xl font-semibold text-verde-mata dark:text-dourado-suave">Gerenciar Eventos</h2>
        <Button onClick={() => handleOpenForm(null)} variant="primary">
          <PlusIcon className="w-5 h-5 mr-2" />
          Adicionar Evento
        </Button>
      </div>
      <SearchAndFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        filterOptions={filterOptions}
        searchPlaceholder="Buscar por título..."
      />
      <div className="bg-branco-nevoa dark:bg-verde-mata p-6 rounded-xl shadow-lg overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-marrom-seiva/20 dark:border-creme-velado/20">
              <th className="p-3 font-sans font-semibold text-marrom-seiva dark:text-creme-velado">Título</th>
              <th className="p-3 font-sans font-semibold text-marrom-seiva dark:text-creme-velado">Data</th>
              <th className="p-3 font-sans font-semibold text-marrom-seiva dark:text-creme-velado">Inscritas</th>
              <th className="p-3 font-sans font-semibold text-marrom-seiva dark:text-creme-velado">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredEvents.map(item => (
              <tr key={item.id} className="border-b border-marrom-seiva/10 dark:border-creme-velado/10 last:border-b-0">
                <td className="p-3 font-sans font-medium text-verde-mata dark:text-creme-velado">{item.title}</td>
                <td className="p-3 font-sans text-sm text-marrom-seiva/80 dark:text-creme-velado/80">{formatDate(item.date)}</td>
                <td className="p-3 font-sans text-sm text-marrom-seiva/80 dark:text-creme-velado/80">{item.attendeeIds.length}</td>
                <td className="p-3">
                  <div className="flex space-x-2">
                    <button onClick={() => handleOpenForm(item)} className="p-2 hover:text-dourado-suave"><PencilIcon className="w-5 h-5" /></button>
                    <button onClick={() => handleOpenConfirm(item)} className="p-2 hover:text-red-500"><TrashIcon className="w-5 h-5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <EventForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        event={selectedItem}
        user={user}
      />
      
      {selectedItem && (
        <ConfirmationModal
          isOpen={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={handleDelete}
          title="Confirmar Exclusão"
          message={`Tem certeza que deseja excluir o evento "${selectedItem.title}"?`}
          confirmText="Excluir"
        />
      )}
    </>
  );
}