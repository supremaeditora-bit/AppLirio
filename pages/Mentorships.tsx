import React, { useState, useEffect } from 'react';
import { getMentorships, getAppearanceSettings } from '../services/api';
import { ContentItem, User, PageHeaderConfig } from '../types';
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
  const [headerConfig, setHeaderConfig] = useState<PageHeaderConfig | undefined>(undefined);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('recentes');

  const canCreate = user && (user.role === 'admin' || user.role === 'mentora');

  const fetchItems = async () => {
    setIsLoading(true);
    const [data, settings] = await Promise.all([
        getMentorships(),
        getAppearanceSettings()
    ]);
    setItems(data);
    if (settings.pageHeaders?.mentorships) {
        setHeaderConfig(settings.pageHeaders.mentorships);
    }
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
      <div className="min-h-full bg-creme-velado dark:bg-verde-escuro-profundo">
        {/* Hero Header */}
        <div className="relative h-[40vh] sm:h-[50vh] w-full">
            <img 
                src={headerConfig?.imageUrl || "https://images.unsplash.com/photo-1531545514256-b1400bc00f31?q=80&w=1374&auto=format&fit=crop"}
                alt="Mentorias" 
                className="w-full h-full object-cover" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#D9C7A6] from-20% via-[#D9C7A6]/80 via-60% to-transparent dark:from-[#152218] dark:from-20% dark:via-[#152218]/80 dark:via-60% transition-colors duration-500"></div>
            
            {canCreate && (
                <button 
                    onClick={() => setIsFormOpen(true)}
                    className="absolute top-4 right-4 bg-white/90 dark:bg-verde-mata/90 p-3 rounded-full shadow-lg hover:scale-110 transition-transform z-20 text-verde-mata dark:text-dourado-suave flex items-center gap-2 font-semibold text-sm"
                >
                    <PlusIcon className="w-5 h-5" />
                    <span className="hidden sm:inline">Adicionar Mentoria</span>
                </button>
            )}

            <div className="absolute bottom-0 left-0 w-full p-6 sm:p-12">
                 <div className="container mx-auto">
                    <h1 className="font-serif text-4xl sm:text-6xl font-bold text-verde-mata dark:text-dourado-suave drop-shadow-sm">
                        {headerConfig?.title || "Mentorias"}
                    </h1>
                    <p className="text-marrom-seiva/80 dark:text-creme-velado/90 mt-2 text-lg max-w-xl font-sans font-medium drop-shadow-md">
                        {headerConfig?.subtitle || "Cursos e trilhas de conhecimento para guiar sua jornada de crescimento."}
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