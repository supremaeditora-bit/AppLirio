import React, { useState, useEffect, useRef } from 'react';
import { getContentItem, markContentAsComplete, unmarkContentAsComplete, getAppearanceSettings } from '../services/api';
import { ContentItem, User, GeneratedDevotional } from '../types';
import Spinner from '../components/Spinner';
import { PlayIcon, CheckCircleIcon } from '../components/Icons';
import AudioPlayer from '../components/AudioPlayer';
import VideoPlayer from '../components/VideoPlayer';
import Button from '../components/Button';

interface ContentDetailProps {
  id: string;
  user: User | null;
  onNavigateBack: () => void;
  onUserUpdate: (updatedData: Partial<User>) => Promise<void>;
}

const extractYoutubeId = (url: string): string => {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : '';
}

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


export default function ContentDetail({ id, user, onNavigateBack, onUserUpdate }: ContentDetailProps) {
  const [item, setItem] = useState<ContentItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchItem = async () => {
      setIsLoading(true);
      
      let data: ContentItem | null = null;
      
      if (id === 'daily-devotional') {
          const settings = await getAppearanceSettings();
          const devotional = settings.dailyDevotional?.content;
          if (devotional) {
              data = {
                  id: 'daily-devotional',
                  type: 'Devocional',
                  title: devotional.title,
                  subtitle: devotional.verseReference,
                  description: devotional.reflection.substring(0, 150) + '...',
                  imageUrl: 'https://images.unsplash.com/photo-1518495973542-4543?auto=format&fit=crop&w=1074&q=80',
                  contentBody: formatDevotionalToContentBody(devotional),
                  audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', // Placeholder audio
              };
          }
      } else {
          data = await getContentItem(id) || null;
      }
      
      setItem(data);
      if (user && data) {
        setIsCompleted(user.completedContentIds.includes(data.id));
      }
      setIsLoading(false);
    };
    fetchItem();
  }, [id, user]);
  
  const handleToggleComplete = async () => {
    if (!user || !item) return;
    setIsUpdating(true);

    try {
      if (isCompleted) {
        await unmarkContentAsComplete(user.id, item.id);
        onUserUpdate({ 
          completedContentIds: user.completedContentIds.filter(cid => cid !== item.id),
        });
        setIsCompleted(false);
      } else {
        await markContentAsComplete(user.id, item.id);
        onUserUpdate({ 
          completedContentIds: [...user.completedContentIds, item.id],
        });
        setIsCompleted(true);
      }
    } catch (error) {
      console.error("Failed to update completion status", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStart = () => {
    contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-full"><Spinner /></div>;
  }

  if (!item) {
    return <div className="text-center p-8">Conteúdo não encontrado.</div>;
  }
  
  const hasStartableContent = item.contentBody || (item.type === 'Live' && item.actionUrl) || item.audioUrl;

  return (
    <div className="relative">
        <div className="h-[40vh] sm:h-[50vh] w-full relative">
            <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover"/>
            <div className="absolute inset-0 bg-gradient-to-t from-creme-velado via-creme-velado/70 to-transparent dark:from-verde-escuro-profundo dark:via-verde-escuro-profundo/70"></div>
        </div>
        <div className="container mx-auto p-4 sm:p-8 -mt-24 relative z-10">
            <div className="max-w-4xl mx-auto">
                <span className="font-sans text-dourado-suave font-semibold tracking-wider">{item.type}</span>
                <h1 className="font-serif text-4xl sm:text-5xl font-bold my-2 text-verde-mata dark:text-dourado-suave">
                    {item.title}
                </h1>
                <p className="font-sans text-lg text-marrom-seiva/80 dark:text-creme-velado/80">{item.subtitle}</p>

                <div className="flex items-center space-x-4 my-8">
                    {hasStartableContent && (
                        <button onClick={handleStart} className="flex items-center justify-center bg-dourado-suave text-verde-mata font-bold py-3 px-8 rounded-full text-lg hover:opacity-90 transition-all duration-200 transform hover:scale-105">
                            <PlayIcon />
                            <span>Iniciar</span>
                        </button>
                    )}
                    <Button onClick={handleToggleComplete} variant={isCompleted ? 'secondary' : 'primary'} disabled={isUpdating}>
                        <CheckCircleIcon className="w-5 h-5 mr-2" />
                        {isCompleted ? 'Concluído' : 'Marcar como Concluído'}
                    </Button>
                </div>

                <div className="font-sans text-base leading-relaxed space-y-4 text-marrom-seiva dark:text-creme-velado/90">
                    <p>{item.description}</p>
                </div>

                {hasStartableContent && (
                    <div ref={contentRef} className="mt-8 space-y-8">
                        {item.contentBody && (
                            <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: item.contentBody }} />
                        )}
                        
                        {item.type === 'Live' && item.actionUrl && (
                            <div>
                                <h2 className="font-serif text-3xl font-bold text-verde-mata dark:text-dourado-suave mb-4">Assista a Gravação</h2>
                                <VideoPlayer youtubeId={extractYoutubeId(item.actionUrl)} />
                            </div>
                        )}

                        {item.audioUrl && (
                            <div>
                                <AudioPlayer src={item.audioUrl} />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    </div>
  );
}