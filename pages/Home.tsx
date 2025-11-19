import React, { useState, useEffect } from 'react';
import { Page, User, ContentItem, GeneratedDevotional, CommunityPost } from '../types';
import { getAllContent, getAppearanceSettings, updateAppearanceSettings, getCommunityPosts, markContentAsComplete, unmarkContentAsComplete } from '../services/api';
import { generateDevotional } from '../services/geminiService';
import Spinner from '../components/Spinner';
import Button from '../components/Button';
import Carousel from '../components/Carousel';
import { ChevronRightIcon, PlayIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { processActivity } from '../services/gamificationService';

interface HomeProps {
    onNavigate: (page: Page, id?: string) => void;
    user: User;
    onViewDetail: (id: string) => void;
    onUserUpdate: (updatedData: Partial<User>) => Promise<void>;
}

export default function Home({ onNavigate, user, onViewDetail, onUserUpdate }: HomeProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [heroContent, setHeroContent] = useState<ContentItem | null>(null);
  const [continueWatching, setContinueWatching] = useState<ContentItem[]>([]);
  const [latestTestimonial, setLatestTestimonial] = useState<CommunityPost | null>(null);
  const [isHeroCompleted, setIsHeroCompleted] = useState(false);
  const [isUpdatingCompletion, setIsUpdatingCompletion] = useState(false);

  // States for category carousels
  const [lives, setLives] = useState<ContentItem[]>([]);
  const [studies, setStudies] = useState<ContentItem[]>([]);
  const [podcasts, setPodcasts] = useState<ContentItem[]>([]);
  const [mentorships, setMentorships] = useState<ContentItem[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [allContent, settings, testimonials] = await Promise.all([
          getAllContent(),
          getAppearanceSettings(),
          getCommunityPosts('testemunhos'),
        ]);

        // Process Content
        setContinueWatching(allContent.filter(item => item.progress && item.progress > 0 && item.progress < (item.total || 1)));
        setLatestTestimonial(testimonials[0] || null);
        
        // Filter content for category carousels
        const sortedContent = allContent.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        setLives(sortedContent.filter(item => item.type === 'Live').slice(0, 10));
        setStudies(sortedContent.filter(item => item.type === 'Estudo').slice(0, 10));
        setPodcasts(sortedContent.filter(item => item.type === 'Podcast').slice(0, 10));
        setMentorships(sortedContent.filter(item => item.type === 'Mentoria').slice(0, 10));

        // Hero Content Logic
        // 1. Prioritize the most recently created manual devotional
        const manualDevotionals = sortedContent.filter(item => item.type === 'Devocional');
        let heroContentItem: ContentItem | null = manualDevotionals.length > 0 ? manualDevotionals[0] : null;

        // 2. Fallback to AI devotional if enabled and no manual devotional is set
        const today = new Date().toISOString().split('T')[0];
        if (!heroContentItem && settings?.isAiDevotionalEnabled) {
            let aiDevotional: GeneratedDevotional | null = null;
            if (settings.dailyDevotional?.date === today) {
                aiDevotional = settings.dailyDevotional.content;
            } else {
                aiDevotional = await generateDevotional();
                if (aiDevotional) {
                   await updateAppearanceSettings({
                        dailyDevotional: { date: today, content: aiDevotional }
                   });
                }
            }
            
            if (aiDevotional) {
                heroContentItem = {
                    id: 'daily-devotional',
                    type: 'Devocional',
                    title: aiDevotional.title,
                    subtitle: aiDevotional.verseReference,
                    description: aiDevotional.reflection.substring(0, 150) + '...',
                    imageUrl: 'https://images.unsplash.com/photo-1518495973542-4543?auto=format&fit=crop&w=1074&q=80',
                    comments: [], reactions: [],
                };
            }
        }

        // 3. Fallback to Mentorship if still no hero content
        if (!heroContentItem) {
            const latestMentorship = sortedContent.find(item => item.type === 'Mentoria');
            if (latestMentorship) {
                heroContentItem = latestMentorship;
            }
        }
        
        setHeroContent(heroContentItem);
        if (heroContentItem) {
            setIsHeroCompleted(user.completedContentIds.includes(heroContentItem.id));
        }

      } catch (error) {
        console.error("Failed to fetch home page data", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleToggleHeroComplete = async () => {
    if (!user || !heroContent) return;
    setIsUpdatingCompletion(true);

    const wasCompleted = isHeroCompleted;

    try {
        if (wasCompleted) {
            await unmarkContentAsComplete(user.id, heroContent.id);
            onUserUpdate({ 
              completedContentIds: user.completedContentIds.filter(cid => cid !== heroContent.id),
            });
            setIsHeroCompleted(false);
        } else {
            await markContentAsComplete(user.id, heroContent.id);
            const gamificationUpdate = processActivity(user, 'devocional_completo');
            onUserUpdate({ 
                ...gamificationUpdate,
                completedContentIds: [...user.completedContentIds, heroContent.id],
            });
            setIsHeroCompleted(true);
        }
    } catch (error) {
        console.error("Failed to update hero completion status", error);
    } finally {
        setIsUpdatingCompletion(false);
    }
};

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen bg-creme-velado dark:bg-verde-escuro-profundo"><Spinner /></div>;
  }
  
  const firstName = user.fullName?.split(' ')[0] || 'Usuária';

  return (
    <>
      <div className="p-4 sm:p-6 md:p-8 space-y-8">
        
        {heroContent ? (
             <section 
                className="relative rounded-2xl flex flex-col justify-end min-h-[60vh] bg-cover bg-center overflow-hidden shadow-xl transition-all duration-500" 
                style={{backgroundImage: `url('${heroContent.imageUrl}')`}}
             >
                 {/* Gradiente adaptativo: Bege Dourado no Claro (#D9C7A6) e Verde Mata no Escuro (com !important) */}
                 <div className="absolute inset-0 bg-gradient-to-t from-[#D9C7A6] via-[#D9C7A6]/80 to-transparent dark:!from-verde-mata dark:!via-verde-mata/80 transition-colors duration-500"></div>
                 
                 <div className="relative z-10 p-6 sm:p-8 md:p-12 w-full">
                    <span className="font-sans font-semibold tracking-wider uppercase text-xs sm:text-sm text-marrom-seiva/80 dark:text-dourado-suave">{heroContent.type}</span>
                    
                    {/* Título e Descrição com cores adaptativas */}
                    <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold mt-2 leading-tight text-verde-mata dark:text-creme-velado">
                        {heroContent.title}
                    </h1>
                    {heroContent.subtitle && (
                             <p className="font-sans text-sm font-semibold text-marrom-seiva/70 dark:text-dourado-suave mt-1">{heroContent.subtitle}</p>
                    )}
                    <p className="font-sans mt-4 text-sm sm:text-base font-medium text-marrom-seiva dark:text-creme-velado/90 line-clamp-3 max-w-2xl">
                        {heroContent.description}
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-4 mt-6">
                        <Button 
                            onClick={() => onViewDetail(heroContent.id)} 
                            className="shadow-lg dark:!bg-dourado-suave dark:!text-verde-mata dark:hover:!opacity-90"
                        >
                            <PlayIcon className="w-5 h-5 mr-2" /> Iniciar
                        </Button>
                        <Button 
                            onClick={handleToggleHeroComplete} 
                            variant="secondary" 
                            disabled={isUpdatingCompletion} 
                            className="!bg-marrom-seiva/10 !text-marrom-seiva hover:!bg-marrom-seiva/20 dark:!bg-creme-velado/10 dark:!text-creme-velado dark:hover:!bg-creme-velado/20 border border-marrom-seiva/10 dark:border-creme-velado/10"
                        >
                            <CheckCircleIcon className="w-5 h-5 mr-2" />
                            {isHeroCompleted ? 'Concluído' : 'Marcar como Concluído'}
                        </Button>
                    </div>
                 </div>
             </section>
        ) : (
            <header>
                <h1 className="font-serif text-3xl md:text-4xl font-bold text-verde-mata dark:text-dourado-suave">
                    Bem-vinda, {firstName}!
                </h1>
                <p className="font-sans text-marrom-seiva/80 dark:text-creme-velado/80 mt-1">
                    "O Senhor te abençoe e te guarde." - Números 6:24
                </p>
            </header>
        )}


        {/* Content Discovery Section */}
        <div className="space-y-12">
            {latestTestimonial && latestTestimonial.author && (
                <section>
                    <h2 className="font-serif text-3xl font-semibold mb-4 text-verde-mata dark:text-dourado-suave">Comunidade em Ação</h2>
                     <div className="bg-branco-nevoa dark:bg-verde-mata p-6 rounded-2xl shadow-lg">
                       <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                              <img src={latestTestimonial.author.avatarUrl} alt={latestTestimonial.author.fullName} className="w-8 h-8 rounded-full"/>
                              <span className="font-sans text-sm font-semibold">{latestTestimonial.author.fullName}</span>
                          </div>
                          <p className="font-sans text-sm italic text-marrom-seiva/90 dark:text-creme-velado/90 line-clamp-2">"{latestTestimonial.body}"</p>
                          <button onClick={() => onNavigate('testimonialDetail', latestTestimonial.id)} className="font-sans text-sm font-bold text-dourado-suave hover:underline flex items-center">
                              Ler mais <ChevronRightIcon className="w-4 h-4 ml-1"/>
                          </button>
                       </div>
                    </div>
                </section>
             )}

            {continueWatching.length > 0 && (
              <Carousel 
                title="Continuar sua Jornada" 
                items={continueWatching} 
                onCardClick={onViewDetail} 
                user={user} 
              />
            )}
            
             {mentorships.length > 0 && (
              <Carousel title="Mentorias" items={mentorships} onCardClick={onViewDetail} user={user} />
            )}
            {studies.length > 0 && (
              <Carousel title="Estudos Recentes" items={studies} onCardClick={onViewDetail} user={user} />
            )}
            {lives.length > 0 && (
              <Carousel title="Últimas Lives" items={lives} onCardClick={onViewDetail} user={user} />
            )}
            {podcasts.length > 0 && (
              <Carousel title="Novos Podcasts" items={podcasts} onCardClick={onViewDetail} user={user} />
            )}
        </div>
      </div>
    </>
  );
}