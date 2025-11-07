import React, { useState, useEffect } from 'react';
import { ContentItem, User, Category } from '../types';
import { getPodcastEpisodes } from '../services/api';
import Spinner from '../components/Spinner';
import CategoryFilters from '../components/CategoryFilters';
import { PlayCircleIcon, PlusIcon } from '../components/Icons';
import Button from '../components/Button';
import ContentForm from '../components/admin/ContentForm';

interface PodcastsProps {
  user: User | null;
}

const categories: Category[] = [
    { name: 'Todos', filter: 'all' },
    { name: 'Entrevistas', filter: 'interviews' },
    { name: 'Meditações', filter: 'meditations' },
    { name: 'Estudos', filter: 'studies' },
];

export default function Podcasts({ user }: PodcastsProps) {
  const [episodes, setEpisodes] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentEpisode, setCurrentEpisode] = useState<ContentItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement>(null);

  const fetchEpisodes = async () => {
    setIsLoading(true);
    const data = await getPodcastEpisodes();
    setEpisodes(data);
    if (data.length > 0 && !currentEpisode) {
        setCurrentEpisode(data[0]);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchEpisodes();
  }, []);

  const handleFormClose = () => {
      setIsFormOpen(false);
      fetchEpisodes();
  }

  const handlePlay = (episode: ContentItem) => {
    setCurrentEpisode(episode);
    setTimeout(() => {
        if (audioRef.current) {
            audioRef.current.play().catch(e => console.error("Audio play failed", e));
        }
    }, 100);
  }
  
  const formatDuration = (seconds?: number) => {
    if (seconds === undefined || isNaN(seconds)) return '...';
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min`;
  };

  if (isLoading && episodes.length === 0) {
    return <div className="flex justify-center items-center h-full"><Spinner /></div>;
  }
  
  const canCreate = user && (user.role === 'admin' || user.role === 'mentora');

  return (
    <>
      <div className="container mx-auto p-4 sm:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <h1 className="font-serif text-4xl font-bold text-verde-mata dark:text-dourado-suave">Podcasts</h1>
            {canCreate && (
                <Button onClick={() => setIsFormOpen(true)} className="mt-4 sm:mt-0">
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Adicionar Podcast
                </Button>
            )}
        </div>

        {currentEpisode && (
            <section className="mb-12 bg-branco-nevoa dark:bg-verde-mata p-6 rounded-2xl shadow-xl flex flex-col md:flex-row items-center gap-8">
                <img src={currentEpisode.imageUrl} alt={currentEpisode.title} className="w-full md:w-48 h-48 rounded-lg object-cover" />
                <div className="flex-1">
                    <h2 className="font-serif text-3xl font-bold text-verde-mata dark:text-dourado-suave">{currentEpisode.title}</h2>
                    <p className="font-sans text-marrom-seiva/80 dark:text-creme-velado/80 mt-2">{currentEpisode.description}</p>
                    <audio ref={audioRef} key={currentEpisode.id} controls src={currentEpisode.audioUrl} className="w-full mt-4 accent-dourado-suave">
                        Seu navegador não suporta o elemento de áudio.
                    </audio>
                </div>
            </section>
        )}

        <section>
          <div className="mb-6">
              <CategoryFilters categories={categories} />
          </div>
          <div className="space-y-4">
              {episodes.map(episode => (
                  <div key={episode.id} 
                      className={`p-4 rounded-lg flex items-center gap-4 transition-colors ${currentEpisode?.id === episode.id ? 'bg-dourado-suave/20' : 'bg-branco-nevoa/50 dark:bg-verde-mata/50 hover:bg-creme-velado dark:hover:bg-verde-escuro-profundo'}`}
                  >
                      <button onClick={() => handlePlay(episode)} className="p-2 text-dourado-suave">
                          <PlayCircleIcon className="w-10 h-10" />
                      </button>
                      <div className="flex-1">
                          <h3 className="font-serif font-semibold text-verde-mata dark:text-creme-velado">{episode.title}</h3>
                          <p className="font-sans text-sm text-marrom-seiva/70 dark:text-creme-velado/70">{episode.createdAt ? new Date(episode.createdAt).toLocaleDateString('pt-BR') : ''}</p>
                      </div>
                      <span className="font-sans text-sm font-semibold text-marrom-seiva/80 dark:text-creme-velado/80">{formatDuration(episode.duration)}</span>
                  </div>
              ))}
          </div>
        </section>
      </div>
      {canCreate && user && (
          <ContentForm
              isOpen={isFormOpen}
              onClose={handleFormClose}
              item={null} // For creating new podcast
              user={user}
              defaultType="Podcast"
          />
      )}
    </>
  );
}