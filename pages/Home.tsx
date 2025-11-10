
import React, { useState, useEffect } from 'react';
import { Page, User, ContentItem, GeneratedDevotional, AppearanceSettings, CommunityPost } from '../types';
import { getAllContent, getAppearanceSettings, updateAppearanceSettings, getCommunityPosts } from '../services/api';
import { generateDevotional } from '../services/geminiService';
import Spinner from '../components/Spinner';
import Button from '../components/Button';
import Carousel from '../components/Carousel';
import ProgressBar from '../components/ProgressBar';
import { BookOpenIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { PrayingHandsIcon } from '../components/Icons';


interface HomeProps {
    onNavigate: (page: Page, id?: string) => void;
    user: User | null;
    onViewDetail: (id: string) => void;
}

const levelData: { [key: string]: { nextLevel: string, points: number } } = {
    'Iniciante da Fé': { nextLevel: 'Aprendiz da Palavra', points: 1000 },
    'Aprendiz da Palavra': { nextLevel: 'Guerreira de Oração', points: 2500 },
    'Guerreira de Oração': { nextLevel: 'Mentora de Fé', points: 5000 },
    'Mentora de Fé': { nextLevel: 'Mentora de Fé', points: 5000 }
};

export default function Home({ onNavigate, user, onViewDetail }: HomeProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [dailyDevotional, setDailyDevotional] = useState<GeneratedDevotional | null>(null);
  
  const [continueWatching, setContinueWatching] = useState<ContentItem[]>([]);
  const [latestTestimonial, setLatestTestimonial] = useState<CommunityPost | null>(null);

  // States for category carousels
  const [lives, setLives] = useState<ContentItem[]>([]);
  const [studies, setStudies] = useState<ContentItem[]>([]);
  const [podcasts, setPodcasts] = useState<ContentItem[]>([]);
  const [mentorships, setMentorships] = useState<ContentItem[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
          setIsLoading(false);
          return;
      }
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


        // Daily Devotional Logic
        const today = new Date().toISOString().split('T')[0];
        if (settings?.isAiDevotionalEnabled) {
            if (settings.dailyDevotional?.date === today) {
                setDailyDevotional(settings.dailyDevotional.content);
            } else {
                const newDevotional = await generateDevotional();
                setDailyDevotional(newDevotional);
                await updateAppearanceSettings({
                    dailyDevotional: { date: today, content: newDevotional }
                });
            }
        }
      } catch (error) {
        console.error("Failed to fetch home page data", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen bg-creme-velado dark:bg-verde-escuro-profundo"><Spinner /></div>;
  }

  if (!user) {
    // Should be handled by App.tsx, but as a fallback
    onNavigate('landing');
    return null;
  }
  
  const firstName = user.fullName?.split(' ')[0] || 'Usuária';
  const userLevelInfo = levelData[user.level] || levelData['Mentora de Fé'];
  const progressPercentage = Math.min((user.points / userLevelInfo.points) * 100, 100);

  return (
    <>
      <div className="p-4 sm:p-6 md:p-8 space-y-8">
        {/* Header Greeting */}
        <header>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-verde-mata dark:text-dourado-suave">
            Bem-vinda, {firstName}!
          </h1>
          <p className="font-sans text-marrom-seiva/80 dark:text-creme-velado/80 mt-1">
            "O Senhor te abençoe e te guarde." - Números 6:24
          </p>
        </header>

        {/* Main Grid: Dashboard Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content Area (Left/Top on mobile) */}
          <div className="lg:col-span-2">
            {/* Daily Devotional */}
            {dailyDevotional && (
              <section 
                className="relative p-6 sm:p-8 rounded-2xl text-white flex flex-col justify-end min-h-[300px] bg-cover bg-center overflow-hidden h-full" 
                style={{backgroundImage: `linear-gradient(rgba(0,0,0,0.1), rgba(44,62,42,0.8)), url('https://images.unsplash.com/photo-1518495973542-4543?auto=format&fit=crop&w=1074&q=80')`}}
              >
                  <span className="font-sans font-semibold tracking-wider uppercase text-dourado-suave">Devocional do Dia</span>
                  <h2 className="font-serif text-3xl font-bold mt-1">{dailyDevotional.title}</h2>
                  <p className="font-sans mt-2 text-sm">{dailyDevotional.verseReference}</p>
                  <Button onClick={() => onNavigate('contentDetail', 'daily-devotional')} className="mt-4 self-start !bg-white/90 !text-verde-mata hover:!bg-white">
                      <BookOpenIcon className="w-5 h-5 mr-2" /> Ler Devocional
                  </Button>
              </section>
            )}
          </div>
          
          {/* Sidebar Area (Right/Bottom on mobile) */}
          <div className="space-y-8">
              {/* Profile & Quick Actions */}
              <section className="bg-branco-nevoa dark:bg-verde-mata p-6 rounded-2xl shadow-lg space-y-4">
                  <div>
                      <div className="flex justify-between items-center font-sans text-sm font-semibold text-marrom-seiva/80 dark:text-creme-velado/80">
                          <span>Nível: {user.level}</span>
                          <span>{user.points} / {userLevelInfo.points} pts</span>
                      </div>
                      <div className="mt-2">
                          <ProgressBar current={user.points} max={userLevelInfo.points} />
                      </div>
                  </div>
                  <div className="grid grid-cols-1 gap-3 pt-2">
                       <Button onClick={() => onNavigate('prayers')} variant="secondary" className="!justify-center !px-4 !py-3">
                          <PrayingHandsIcon className="w-5 h-5 mr-2" />
                          Orações
                      </Button>
                  </div>
              </section>

              {/* Latest Testimonial */}
              {latestTestimonial && (
                  <section className="bg-branco-nevoa dark:bg-verde-mata p-6 rounded-2xl shadow-lg">
                       <h3 className="font-serif text-xl font-semibold mb-3 text-verde-mata dark:text-dourado-suave">Comunidade em Ação</h3>
                       <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                              <img src={latestTestimonial.author.avatarUrl} alt={latestTestimonial.author.name} className="w-8 h-8 rounded-full"/>
                              <span className="font-sans text-sm font-semibold">{latestTestimonial.author.name}</span>
                          </div>
                          <p className="font-sans text-sm italic text-marrom-seiva/90 dark:text-creme-velado/90">"{latestTestimonial.body}"</p>
                          <button onClick={() => onNavigate('testimonials', latestTestimonial.id)} className="font-sans text-sm font-bold text-dourado-suave hover:underline flex items-center">
                              Ler mais <ChevronRightIcon className="w-4 h-4 ml-1"/>
                          </button>
                       </div>
                  </section>
              )}
          </div>
        </div>

        {/* Content Discovery Section */}
        <div className="space-y-8">
            {/* Continue Watching */}
            {continueWatching.length > 0 && (
              <Carousel 
                title="Continuar sua Jornada" 
                items={continueWatching} 
                onCardClick={onViewDetail} 
                user={user} 
              />
            )}
            
            {/* Category Carousels */}
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