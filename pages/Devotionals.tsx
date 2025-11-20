
import React, { useState, useEffect } from 'react';
import { getDevotionals, getAppearanceSettings, createContentItem } from '../services/api';
import { generateDevotional, generateDevotionalImage } from '../services/geminiService';
import { uploadImage } from '../services/storageService';
import { ContentItem, User, GeneratedDevotional } from '../types';
import Spinner from '../components/Spinner';
import ContentCard from '../components/ContentCard';
import Button from '../components/Button';
import ContentForm from '../components/admin/ContentForm';
import { PlusIcon, BookOpenIcon, ClockIcon } from '../components/Icons';
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

const formatDevotionalToContentBody = (devotional: GeneratedDevotional): string => {
    return `
        <h2 class="font-serif !text-xl !font-semibold !text-verde-mata dark:!text-dourado-suave">Contexto Bíblico</h2>
        <p>${devotional.context}</p>
        <h2 class="font-serif !text-xl !font-semibold !text-verde-mata dark:!text-dourado-suave">Reflexão</h2>
        <p>${devotional.reflection}</p>
        <h2 class="font-serif !text-xl !font-semibold !text-verde-mata dark:!text-dourado-suave">Aplicação Prática</h2>
        <ul class="list-disc list-inside">
            ${devotional.application.map(item => `<li>${item}</li>`).join('')}
        </ul>
        <h2 class="font-serif !text-xl !font-semibold !text-verde-mata dark:!text-dourado-suave">Oração</h2>
        <p class="!italic">${devotional.prayer}</p>
    `;
};

export default function Devotionals({ onViewDetail, user, onUserUpdate }: DevotionalsProps) {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [todaysDevotional, setTodaysDevotional] = useState<ContentItem | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('recentes');

  const canCreate = user && (user.role === 'admin' || user.role === 'mentora');

  const fetchItems = async () => {
    const data = await getDevotionals();
    
    // Sort by date descending
    data.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    setItems(data);
    
    return data;
  };
  
  useEffect(() => {
    const fetchItemsAndCheckDaily = async () => {
      setIsLoading(true);
      const [data, settingsData] = await Promise.all([
        fetchItems(),
        getAppearanceSettings()
      ]);
      
      const today = new Date().toISOString().split('T')[0];
      // Check if we already have a devotional created today
      const existingDaily = data.find(d => d.type === 'Devocional' && d.createdAt?.startsWith(today));
      
      if (existingDaily) {
          setTodaysDevotional(existingDaily);
      } else if (settingsData?.isAiDevotionalEnabled && !isGenerating) {
          // If not, generate one!
          setIsGenerating(true);
          try {
              const newDevotional = await generateDevotional();
              if (newDevotional) {
                  let imageUrl = 'https://images.unsplash.com/photo-1518495973542-4543?auto=format&fit=crop&w=1074&q=80';
                  
                  // Try to generate an image
                  const generatedImageFile = await generateDevotionalImage(newDevotional.title);
                  if (generatedImageFile && user) {
                      imageUrl = await uploadImage(generatedImageFile, 'system', () => {});
                  }

                  const newContentItem = {
                      type: 'Devocional' as const,
                      title: newDevotional.title,
                      subtitle: newDevotional.verseReference,
                      description: newDevotional.reflection.substring(0, 150) + '...',
                      imageUrl: imageUrl,
                      contentBody: formatDevotionalToContentBody(newDevotional),
                      audioUrl: newDevotional.audioUrl,
                  };

                  await createContentItem(newContentItem);
                  
                  // Refresh list to show the new item
                  const updatedData = await fetchItems();
                  const newDaily = updatedData.find(d => d.title === newDevotional.title);
                  if (newDaily) setTodaysDevotional(newDaily);
              }
          } catch (error) {
              console.error("Failed to auto-generate devotional", error);
          } finally {
              setIsGenerating(false);
          }
      }

      setIsLoading(false);
    };
    fetchItemsAndCheckDaily();
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
          <h1 className="font-serif text-4xl font-bold text-verde-mata dark:text-dourado-suave">Devocionais</h1>
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
            {isGenerating && (
                <div className="mb-8 p-6 bg-dourado-suave/10 rounded-xl flex items-center justify-center gap-3 text-marrom-seiva dark:text-creme-velado animate-pulse">
                    <Spinner variant="button" />
                    <span>Preparando o devocional de hoje para você...</span>
                </div>
            )}

            {todaysDevotional && !searchQuery && (
              <section 
                className="relative p-6 sm:p-8 rounded-2xl flex flex-col justify-end min-h-[300px] bg-cover bg-center overflow-hidden mb-12 shadow-xl group" 
                style={{backgroundImage: `url('${todaysDevotional.imageUrl}')`}}
              >
                  <div className="absolute inset-0 bg-gradient-to-t from-[#D9C7A6] from-20% via-[#D9C7A6]/80 via-60% to-transparent dark:from-[#152218] dark:from-20% dark:via-[#152218]/80 dark:via-60% transition-colors duration-500"></div>

                  <div className="relative z-10">
                    <div className="flex items-center justify-between">
                        <span className="font-sans font-semibold tracking-wider uppercase text-xs sm:text-sm text-marrom-seiva/80 dark:text-dourado-suave bg-white/30 dark:bg-black/30 px-2 py-1 rounded backdrop-blur-sm">
                            Devocional do Dia
                        </span>
                        <span className="text-xs font-sans text-marrom-seiva/70 dark:text-creme-velado/70 flex items-center gap-1">
                            <ClockIcon className="w-3 h-3" />
                            Gerado em: {new Date(todaysDevotional.createdAt!).toLocaleString('pt-BR')}
                        </span>
                    </div>
                    
                    <h2 className="font-serif text-3xl font-bold mt-2 text-verde-mata dark:text-white">{todaysDevotional.title}</h2>
                    <p className="font-sans mt-2 text-sm text-marrom-seiva dark:text-white/90 font-medium">{todaysDevotional.subtitle}</p>
                    <Button 
                        onClick={() => onViewDetail(todaysDevotional.id)} 
                        className="mt-6 self-start !bg-verde-mata !text-dourado-suave hover:!bg-verde-mata/90 dark:!bg-white/90 dark:!text-verde-mata dark:hover:!bg-white shadow-lg"
                    >
                        <BookOpenIcon className="w-5 h-5 mr-2" /> Ler Devocional
                    </Button>
                  </div>
              </section>
            )}
            
            <h2 className="font-serif text-3xl font-semibold mb-6 text-verde-mata dark:text-dourado-suave">Explore Mais</h2>
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
