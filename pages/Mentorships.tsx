import React, { useState, useEffect } from 'react';
import { getMentorships } from '../services/api';
import { ContentItem, User } from '../types';
import Spinner from '../components/Spinner';
import ContentCard from '../components/ContentCard';
import Button from '../components/Button';
import { PlusIcon } from '../components/Icons';
import ContentForm from '../components/admin/ContentForm';
import SearchAndFilter from '../components/SearchAndFilter';

interface MentorshipsProps {
  onViewDetail: (id: string) => void;
  user: User | null;
}

const filterOptions = [
  { value: 'recentes', label: 'Mais Recentes' },
  { value: 'antigos', label: 'Mais Antigos' },
];

export default function Mentorships({ onViewDetail, user }: MentorshipsProps) {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('recentes');

  const canCreate = user && (user.role === 'admin' || user.role === 'mentora');

  const fetchItems = async () => {
    setIsLoading(true);
    const data = await getMentorships();
    setItems(data);
    setIsLoading(false);
  };
  
  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    let results = [...items];
    
    if (searchQuery) {
        const lowercasedQuery = searchQuery.toLowerCase();
        results = results.filter(item => 
            item.title.toLowerCase().includes(lowercasedQuery) ||
            item.description.toLowerCase().includes(lowercasedQuery)
        );
    }

    if (activeFilter === 'recentes') {
        results.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    } else if (activeFilter === 'antigos') {
        results.sort((a, b) => new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime());
    }
    
    setFilteredItems(results);
  }, [searchQuery, activeFilter, items]);

  const handleFormClose = () => {
    setIsFormOpen(false);
    fetchItems();
  };
    
  return (
    <>
      <div className="container mx-auto p-4 sm:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h1 className="font-serif text-4xl font-bold text-gradient">Mentorias</h1>
          {canCreate && (
            <Button onClick={() => setIsFormOpen(true)}>
                <PlusIcon className="w-5 h-5 mr-2" />
                Adicionar Mentoria
            </Button>
          )}
        </div>
        
        <SearchAndFilter
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            filterOptions={filterOptions}
            searchPlaceholder="Buscar por título ou tema..."
        />

        {isLoading ? (
          <div className="flex justify-center items-center py-20"><Spinner /></div>
        ) : filteredItems.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredItems.map(item => (
                <ContentCard 
                key={item.id} 
                item={item} 
                onClick={() => onViewDetail(item.id)} 
                isCompleted={user?.completedContentIds?.includes(item.id)}
                />
            ))}
            </div>
        ) : (
            <div className="text-center py-10 text-marrom-seiva/70 dark:text-creme-velado/70">
                Nenhuma mentoria encontrada.
            </div>
        )}
      </div>

      {canCreate && user && (
          <ContentForm
              isOpen={isFormOpen}
              onClose={handleFormClose}
              item={null}
              user={user}
              defaultType="Mentoria"
          />
      )}
    </>
  );
}