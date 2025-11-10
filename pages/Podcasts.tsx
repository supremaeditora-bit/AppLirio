import React, { useState, useEffect, useRef } from 'react';
import { ContentItem, User } from '../types';
import { getPodcastEpisodes } from '../services/api';
import Spinner from '../components/Spinner';
import { PlayIcon, PlusIcon, PauseIcon, ForwardIcon, BackwardIcon } from '../components/Icons';
import Button from '../components/Button';
import ContentForm from '../components/admin/ContentForm';
import SearchAndFilter from '../components/SearchAndFilter';

interface PodcastsProps {
  user: User | null;
}

const filterOptions = [
    { value: 'all', label: 'Todos' },
    { value: 'interviews', label: 'Entrevistas' },
    { value: 'meditations', label: 'Meditações' },
    { value: 'studies', label: 'Estudos' },
];

export default function Podcasts({ user }: PodcastsProps) {
  const [episodes, setEpisodes] = useState<ContentItem[]>([]);
  const [filteredEpisodes, setFilteredEpisodes] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentEpisode, setCurrentEpisode] = useState<ContentItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const audioRef = useRef<HTMLAudioElement>(null);

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

  useEffect(() => {
    let results = [...episodes];

    if (activeFilter !== 'all') {
      results = results.filter(ep => ep.tags?.includes(activeFilter));
    }

    if (searchQuery) {
        const lowercasedQuery = searchQuery.toLowerCase();
        results = results.filter(ep => 
            ep.title.toLowerCase().includes(lowercasedQuery) ||
            ep.description.toLowerCase().includes(lowercasedQuery)
        );
    }
    
    setFilteredEpisodes(results);
  }, [searchQuery, activeFilter, episodes]);

  // Effect to handle play/pause logic
  useEffect(() => {
    if (audioRef.current) {
        if (isPlaying) {
            audioRef.current.play().catch(e => console.error("Audio play failed", e));
        } else {
            audioRef.current.pause();
        }
    }
  }, [isPlaying, currentEpisode]);

  const handleFormClose = () => {
      setIsFormOpen(false);
      fetchEpisodes();
  }
  
  const playEpisode = (episode: ContentItem) => {
    if (currentEpisode?.id !== episode.id) {
        setCurrentEpisode(episode);
        setIsPlaying(true);
    } else {
        setIsPlaying(!isPlaying);
    }
  };

  const findCurrentIndex = () => filteredEpisodes.findIndex(ep => ep.id === currentEpisode?.id);

  const handleNext = () => {
    const currentIndex = findCurrentIndex();
    if (currentIndex > -1 && currentIndex < filteredEpisodes.length - 1) {
        setCurrentEpisode(filteredEpisodes[currentIndex + 1]);
        setIsPlaying(true);
    } else {
        setIsPlaying(false);
    }
  };

  const handlePrevious = () => {
    const currentIndex = findCurrentIndex();
    if (currentIndex > 0) {
        setCurrentEpisode(filteredEpisodes[currentIndex - 1]);
        setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
  };
  const handleLoadedData = () => {
    if (audioRef.current) setDuration(audioRef.current.duration);
  };
  const handleScrubberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
        const newTime = Number(e.target.value);
        audioRef.current.currentTime = newTime;
        setCurrentTime(newTime);
    }
  };
  
  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds)) return '00:00';
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

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
      <audio 
        ref={audioRef} 
        src={currentEpisode?.audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedData={handleLoadedData}
        onEnded={handleNext}
      />
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
                <img src={currentEpisode.imageUrl} alt={currentEpisode.title} className="w-full md:w-48 h-48 rounded-lg object-cover flex-shrink-0" />
                <div className="flex-1 w-full">
                    <h2 className="font-serif text-3xl font-bold text-verde-mata dark:text-dourado-suave line-clamp-2">{currentEpisode.title}</h2>
                    <div className="mt-4 w-full">
                        <input
                            type="range"
                            min="0"
                            max={duration || 0}
                            value={currentTime}
                            onChange={handleScrubberChange}
                            className="w-full h-2 bg-marrom-seiva/20 dark:bg-creme-velado/20 rounded-lg appearance-none cursor-pointer accent-dourado-suave"
                        />
                        <div className="flex justify-between text-xs font-sans text-marrom-seiva/70 dark:text-creme-velado/70 mt-1">
                            <span>{formatTime(currentTime)}</span>
                            <span>{formatTime(duration)}</span>
                        </div>
                    </div>
                    <div className="flex items-center justify-center gap-6 mt-4">
                        <button onClick={handlePrevious} className="text-marrom-seiva dark:text-creme-velado hover:text-dourado-suave disabled:opacity-30" disabled={findCurrentIndex() <= 0}>
                            <BackwardIcon className="w-8 h-8" />
                        </button>
                        <button onClick={() => setIsPlaying(!isPlaying)} className="p-2 bg-dourado-suave text-verde-mata rounded-full w-16 h-16 flex items-center justify-center">
                           {isPlaying ? <PauseIcon className="w-8 h-8" /> : <PlayIcon className="w-8 h-8" />}
                        </button>
                        <button onClick={handleNext} className="text-marrom-seiva dark:text-creme-velado hover:text-dourado-suave disabled:opacity-30" disabled={findCurrentIndex() >= filteredEpisodes.length - 1}>
                            <ForwardIcon className="w-8 h-8" />
                        </button>
                    </div>
                </div>
            </section>
        )}

        <section>
          <div className="mb-6">
              <SearchAndFilter
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
                filterOptions={filterOptions}
                searchPlaceholder="Buscar por episódios..."
              />
          </div>
          <div className="space-y-4">
              {filteredEpisodes.length > 0 ? filteredEpisodes.map((episode, index) => (
                  <div key={episode.id} 
                      onClick={() => playEpisode(episode)}
                      className={`p-4 rounded-lg flex items-center gap-4 transition-colors cursor-pointer ${currentEpisode?.id === episode.id ? 'bg-dourado-suave/20' : 'bg-branco-nevoa/50 dark:bg-verde-mata/50 hover:bg-creme-velado dark:hover:bg-verde-escuro-profundo'}`}
                  >
                      <span className="font-sans font-bold text-marrom-seiva/60 dark:text-creme-velado/60 w-6 text-center">
                          {currentEpisode?.id === episode.id && isPlaying ? <PauseIcon className="w-6 h-6 text-dourado-suave"/> : <PlayIcon className="w-6 h-6 text-dourado-suave"/>}
                      </span>
                      <img src={episode.imageUrl} alt={episode.title} className="w-12 h-12 object-cover rounded"/>
                      <div className="flex-1">
                          <h3 className={`font-serif font-semibold ${currentEpisode?.id === episode.id ? 'text-dourado-suave' : 'text-verde-mata dark:text-creme-velado'}`}>{episode.title}</h3>
                          <p className="font-sans text-sm text-marrom-seiva/70 dark:text-creme-velado/70">{episode.createdAt ? new Date(episode.createdAt).toLocaleDateString('pt-BR') : ''}</p>
                      </div>
                      <span className="font-sans text-sm font-semibold text-marrom-seiva/80 dark:text-creme-velado/80">{formatDuration(episode.duration)}</span>
                  </div>
              )) : (
                 <div className="text-center py-10 text-marrom-seiva/70 dark:text-creme-velado/70">
                    Nenhum episódio encontrado.
                </div>
              )}
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