import React, { useState, useEffect } from 'react';
import { getDevotionals, getAppearanceSettings, updateAppearanceSettings } from '../services/api';
import { generateDevotional } from '../services/geminiService';
import { ContentItem, User, GeneratedDevotional } from '../types';
import Spinner from '../components/Spinner';
import ContentCard from '../components/ContentCard';
import Button from '../components/Button';
import ContentForm from '../components/admin/ContentForm';
import { PlusIcon, BookOpenIcon } from '../components/Icons';

interface DevotionalsProps {
  onViewDetail: (id: string) => void;
  user: User | null;
  onUserUpdate: (updatedData: Partial<User>) => Promise<void>;
}

export default function Devotionals({ onViewDetail, user, onUserUpdate }: DevotionalsProps) {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [dailyDevotional, setDailyDevotional] = useState<GeneratedDevotional | null>(null);
  
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

        {isLoading ? (
          <div className="flex justify-center items-center py-20"><Spinner /></div>
        ) : (
          <>
            {dailyDevotional && (
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
            
            <h2 className="font-serif text-3xl font-semibold mb-6 text-verde-mata dark:text-dourado-suave">Explore Mais</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {items.map(item => (
                <ContentCard 
                  key={item.id} 
                  item={item} 
                  onClick={() => onViewDetail(item.id)} 
                  isCompleted={user?.completedContentIds?.includes(item.id)}
                />
              ))}
            </div>
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