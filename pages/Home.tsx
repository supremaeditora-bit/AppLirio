
import React, { useState, useEffect, useRef } from 'react';
import { Page, User, ContentItem, GeneratedDevotional, CommunityPost, ReadingPlan, Event } from '../types';
import { 
    getAllContent, 
    getCommunityPosts, 
    markContentAsComplete, 
    unmarkContentAsComplete,
    getReadingPlans,
    getEvents
} from '../services/api';
import Spinner from '../components/Spinner';
import Button from '../components/Button';
import Carousel from '../components/Carousel';
import { PlayIcon, CheckCircleIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { processActivity } from '../services/gamificationService';

interface HomeProps {
    onNavigate: (page: Page, id?: string) => void;
    user: User;
    onViewDetail: (id: string) => void;
    onUserUpdate: (updatedData: Partial<User>) => Promise<void>;
}

// Helper functions to map different data types to ContentItem for the carousel
const mapPlanToContentItem = (plan: ReadingPlan): ContentItem => ({
    id: plan.id,
    title: plan.title,
    subtitle: `${plan.durationDays} Dias`,
    description: plan.description,
    imageUrl: plan.imageUrl || 'https://images.unsplash.com/photo-1507434965515-61970f2bd7c6?auto=format&fit=crop&w=800&q=80',
    type: 'Plano',
    comments: [], reactions: []
});

const mapEventToContentItem = (event: Event): ContentItem => ({
    id: event.id,
    title: event.title,
    subtitle: new Date(event.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
    description: event.location,
    imageUrl: event.imageUrl || 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80',
    type: 'Evento',
    badge: event.price ? `R$ ${event.price}` : 'Gratuito',
    comments: [], reactions: []
});

const mapPostToContentItem = (post: CommunityPost, type: 'Testemunho' | 'Oração'): ContentItem => {
    let defaultImage = 'https://images.unsplash.com/photo-1518495973542-4543?auto=format&fit=crop&w=800&q=80';
    if (type === 'Oração') defaultImage = 'https://images.unsplash.com/photo-1621264154061-8d084318263f?auto=format&fit=crop&w=800&q=80';
    
    return {
        id: post.id,
        title: post.title,
        subtitle: post.author?.fullName || 'Anônimo',
        description: post.body,
        imageUrl: post.imageUrl || defaultImage,
        type: type,
        comments: post.comments, 
        reactions: post.reactions
    };
};

export default function Home({ onNavigate, user, onViewDetail, onUserUpdate }: HomeProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [heroContent, setHeroContent] = useState<ContentItem | null>(null);
  const [isHeroCompleted, setIsHeroCompleted] = useState(false);
  const [isUpdatingCompletion, setIsUpdatingCompletion] = useState(false);

  // States for all carousels
  const [continueWatching, setContinueWatching] = useState<ContentItem[]>([]);
  const [lives, setLives] = useState<ContentItem[]>([]);
  const [studies, setStudies] = useState<ContentItem[]>([]);
  const [podcasts, setPodcasts] = useState<ContentItem[]>([]);
  const [mentorships, setMentorships] = useState<ContentItem[]>([]);
  const [readingPlans, setReadingPlans] = useState<ContentItem[]>([]);
  const [events, setEvents] = useState<ContentItem[]>([]);
  const [testimonials, setTestimonials] = useState<ContentItem[]>([]);
  const [rawPrayerRequests, setRawPrayerRequests] = useState<CommunityPost[]>([]);

  const prayerScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [
            allContent, 
            plansData, 
            eventsData, 
            testimonialPosts, 
            prayerPosts
        ] = await Promise.all([
          getAllContent(),
          getReadingPlans(),
          getEvents(),
          getCommunityPosts('testemunhos'),
          getCommunityPosts('oracao')
        ]);

        // 1. Organize Standard Content
        const sortedContent = allContent.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        
        setContinueWatching(sortedContent.filter(item => item.progress && item.progress > 0 && item.progress < (item.total || 1)));
        setLives(sortedContent.filter(item => item.type === 'Live').slice(0, 10));
        setStudies(sortedContent.filter(item => item.type === 'Estudo').slice(0, 10));
        setPodcasts(sortedContent.filter(item => item.type === 'Podcast').slice(0, 10));
        setMentorships(sortedContent.filter(item => item.type === 'Mentoria').slice(0, 10));

        // 2. Map and Organize New Types
        setReadingPlans(plansData.map(mapPlanToContentItem));
        setEvents(eventsData.filter(e => new Date(e.date) >= new Date()).map(mapEventToContentItem)); // Only future events
        setTestimonials(testimonialPosts.map(p => mapPostToContentItem(p, 'Testemunho')));
        setRawPrayerRequests(prayerPosts);

        // 3. Hero Content Logic
        // Look for the latest Devotional created today, or just the latest one.
        const todayStr = new Date().toISOString().split('T')[0];
        
        // First try to find a devotional created today
        let heroContentItem = sortedContent.find(item => item.type === 'Devocional' && item.createdAt?.startsWith(todayStr));
        
        // If none today, just pick the latest devotional available
        if (!heroContentItem) {
            heroContentItem = sortedContent.find(item => item.type === 'Devocional');
        }

        // Fallback to Mentorship if no devotionals
        if (!heroContentItem) {
            const latestMentorship = sortedContent.find(item => item.type === 'Mentoria');
            if (latestMentorship) {
                heroContentItem = latestMentorship;
            }
        }
        
        setHeroContent(heroContentItem || null);
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

  const handleCardClick = (id: string) => {
      if (readingPlans.some(p => p.id === id)) {
          onNavigate('planDetail', id);
          return;
      }
      if (events.some(e => e.id === id)) {
          onNavigate('eventDetail', id);
          return;
      }
      if (testimonials.some(t => t.id === id)) {
          onNavigate('testimonialDetail', id);
          return;
      }
      
      onViewDetail(id);
  }
  
  const scrollPrayers = (direction: 'left' | 'right') => {
    if (prayerScrollRef.current) {
      const { scrollLeft, clientWidth } = prayerScrollRef.current;
      const scrollTo = direction === 'left' 
        ? scrollLeft - clientWidth * 0.8
        : scrollLeft + clientWidth * 0.8;
      prayerScrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen bg-creme-velado dark:bg-verde-escuro-profundo"><Spinner /></div>;
  }
  
  const firstName = user.fullName?.split(' ')[0] || 'Usuária';

  return (
    <>
      <div className="p-4 sm:p-6 md:p-8 space-y-12 pb-24">
        
        {heroContent ? (
             <section 
                className="relative rounded-2xl flex flex-col justify-end min-h-[60vh] bg-cover bg-center overflow-hidden shadow-xl transition-all duration-500" 
                style={{backgroundImage: `url('${heroContent.imageUrl}')`}}
             >
                 <div className="absolute inset-0 bg-gradient-to-t from-[#D9C7A6] from-20% via-[#D9C7A6]/80 via-60% to-transparent dark:from-[#152218] dark:from-20% dark:via-[#152218]/80 dark:via-60% transition-colors duration-500"></div>
                 
                 <div className="relative z-10 p-6 sm:p-8 md:p-12 w-full">
                    <span className="font-sans font-semibold tracking-wider uppercase text-xs sm:text-sm text-marrom-seiva/80 dark:text-dourado-suave">{heroContent.type}</span>
                    
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

        <div className="space-y-12">
            {continueWatching.length > 0 && (
              <Carousel 
                title="Continuar sua Jornada" 
                items={continueWatching} 
                onCardClick={handleCardClick} 
                user={user} 
              />
            )}
            
            {studies.length > 0 && (
              <Carousel title="Estudos Recentes" items={studies} onCardClick={handleCardClick} user={user} />
            )}

            {readingPlans.length > 0 && (
                <Carousel title="Planos de Leitura Bíblica" items={readingPlans} onCardClick={handleCardClick} user={user} />
            )}
            
            {lives.length > 0 && (
              <Carousel title="Lives & Replays" items={lives} onCardClick={handleCardClick} user={user} />
            )}
            
            {events.length > 0 && (
                <Carousel title="Próximos Eventos" items={events} onCardClick={handleCardClick} user={user} />
            )}

             {mentorships.length > 0 && (
              <Carousel title="Mentorias em Destaque" items={mentorships} onCardClick={handleCardClick} user={user} />
            )}

            {/* Custom Prayer Requests Section */}
            {rawPrayerRequests.length > 0 && (
                <section>
                    <h2 className="font-serif text-3xl font-semibold mb-4 text-verde-mata dark:text-dourado-suave">Pedidos de Oração</h2>
                    <div className="relative group">
                         <button 
                            onClick={() => scrollPrayers('left')}
                            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-creme-velado/80 dark:bg-verde-mata/80 rounded-full text-marrom-seiva dark:text-creme-velado opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:scale-110 -translate-x-2 sm:-translate-x-4 shadow-md"
                            aria-label="Scroll left"
                        >
                            <ChevronLeftIcon className="w-5 h-5" />
                        </button>
                        <div 
                            ref={prayerScrollRef}
                            className="flex space-x-4 overflow-x-auto scrollbar-hide py-2 -mx-4 sm:-mx-8 px-4 sm:px-8"
                        >
                            {rawPrayerRequests.map(post => {
                                const authorName = post.isAnonymous || !post.author ? "Anônima" : post.author.fullName.split(' ')[0];
                                const avatarUrl = post.isAnonymous || !post.author ? `https://api.dicebear.com/8.x/initials/svg?seed=A` : post.author.avatarUrl;
                                return (
                                    <div 
                                        key={post.id} 
                                        onClick={() => onNavigate('prayers')}
                                        className="flex-shrink-0 w-64 sm:w-72 p-5 bg-branco-nevoa dark:bg-verde-mata rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border border-marrom-seiva/10 dark:border-creme-velado/10 group/card"
                                    >
                                        <div className="flex items-center gap-3 mb-3">
                                            <img src={avatarUrl} alt={authorName} className="w-10 h-10 rounded-full object-cover border-2 border-dourado-suave/50" />
                                            <span className="font-sans font-semibold text-sm text-verde-mata dark:text-creme-velado truncate">{authorName}</span>
                                        </div>
                                        <h3 className="font-serif font-bold text-lg text-verde-mata dark:text-dourado-suave mb-2 truncate group-hover/card:text-dourado-suave transition-colors">{post.title}</h3>
                                        <p className="font-sans text-sm text-marrom-seiva/80 dark:text-creme-velado/80 line-clamp-3 leading-relaxed">
                                            {post.body}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                         <button 
                            onClick={() => scrollPrayers('right')}
                            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-creme-velado/80 dark:bg-verde-mata/80 rounded-full text-marrom-seiva dark:text-creme-velado opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:scale-110 translate-x-2 sm:translate-x-4 shadow-md"
                            aria-label="Scroll right"
                        >
                            <ChevronRightIcon className="w-5 h-5" />
                        </button>
                    </div>
                </section>
            )}

            {testimonials.length > 0 && (
                <Carousel title="Testemunhos da Comunidade" items={testimonials} onCardClick={handleCardClick} user={user} />
            )}
            
            {podcasts.length > 0 && (
              <Carousel title="Podcasts para Edificar" items={podcasts} onCardClick={handleCardClick} user={user} />
            )}
        </div>
      </div>
    </>
  );
}
