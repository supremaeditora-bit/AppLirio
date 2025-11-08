import React, { useState, useEffect } from 'react';
import { getDevotionals, getAppearanceSettings, updateAppearanceSettings } from '../services/api';
import { generateDevotional } from '../services/geminiService';
import { ContentItem, User, GeneratedDevotional } from '../types';
import Spinner from '../components/Spinner';
import ContentCard from '../components/ContentCard';
import Button from '../components/Button';
import ContentForm from '../components/admin/ContentForm';
import { PlusIcon, BookOpenIcon } from '../components/Icons';
import SearchAndFilter from '../components/SearchAndFilter';

interface DevotionalsProps {
  onViewDetail: (id: string) => void;
  user: User | null;
  onUserUpdate: (updatedData: Partial<User>) => Promise<void>;
}

const filterOptions = [
  { value: 'recentes', label: 'Mais Recentes' },
  { value: 'antigos', label: 'Mais Antigos' },
];

export default function Devotionals({ onViewDetail, user, onUserUpdate }: DevotionalsProps) {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [dailyDevotional, setDailyDevotional] = useState<GeneratedDevotional | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('recentes');

  const canCreate = user && (user.role === 'admin' || user.role === 'mentora');

  const fetchItems = async () => {
    const data = await getDevotionals();
    setItems(data);
  };
  
  useEffect(() => {
    const fetchItemsAndSettings = async () => {
      setIsLoading(true);
      const [data, settingsData] = await Promise.all([
        getDevotionals(),
        getAppearanceSettings()
      ]);
      setItems(data);
      
      const today = new Date().toISOString().split('T')[0];
      if (settingsData?.isAiDevotionalEnabled) {
          if (settingsData.dailyDevotional?.date === today) {
              setDailyDevotional(settingsData.dailyDevotional.content);
          } else {
              const newDevotional = await generateDevotional();
              setDailyDevotional(newDevotional);
              await updateAppearanceSettings({
                  dailyDevotional: { date: today, content: newDevotional }
              });
          }
      }

      setIsLoading(false);
    };
    fetchItemsAndSettings();
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
    setIsLoading(true);
    fetchItems().finally(() => setIsLoading(false));
  };
    
  return (
    <>
      <div className="container mx-auto p-4 sm:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h1 className="font-serif text-4xl font-bold text-gradient">Devocionais</h1>
          <div className="flex items-center gap-4">
            {canCreate && (
              <Button onClick={() => setIsFormOpen(true)}>
                  <PlusIcon className="w-5 h-5 mr-2" />
                  Adicionar Devocional
              </Button>
            )}
          </div>
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
        ) : (
          <>
            {dailyDevotional && !searchQuery && (
              <section 
                className="relative p-6 sm:p-8 rounded-2xl text-white flex flex-col justify-end min-h-[300px] bg-cover bg-center overflow-hidden mb-12" 
                style={{backgroundImage: `linear-gradient(rgba(0,0,0,0.1), rgba(44,62,42,0.8)), url('https://images.unsplash.com/photo-1518495973542-4543?auto=format&fit=crop&w=1074&q=80')`}}
              >
                  <span className="font-sans font-semibold tracking-wider uppercase text-dourado-suave">Devocional do Dia</span>
                  <h2 className="font-serif text-3xl font-bold mt-1">{dailyDevotional.title}</h2>
                  <p className="font-sans mt-2 text-sm">{dailyDevotional.verseReference}</p>
                  <Button onClick={() => onViewDetail('daily-devotional')} className="mt-4 self-start !bg-white/90 !text-verde-mata hover:!bg-white">
                      <BookOpenIcon className="w-5 h-5 mr-2" /> Ler Devocional
                  </Button>
              </section>
            )}
            
            <h2 className="font-serif text-3xl font-semibold mb-6 text-gradient">Explore Mais</h2>
            {filteredItems.length > 0 ? (
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
                    Nenhum devocional encontrado.
                </div>
            )}
          </>
        )}
      </div>

      {canCreate && user && (
          <ContentForm
              isOpen={isFormOpen}
              onClose={handleFormClose}
              item={null}
              user={user}
          />
      )}
    </>
  );
}