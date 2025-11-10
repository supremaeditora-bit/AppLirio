
import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { onAuthUserChanged } from './services/authService';
import { getLiveSessions, getAnnouncements, getAppearanceSettings } from './services/api';
import { Page, User, Announcement, AppearanceSettings } from './types';

import Sidebar from './components/Sidebar';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import Spinner from './components/Spinner';
import SearchModal from './components/SearchModal';
import AnnouncementBanner from './components/AnnouncementBanner';

// Pages (lazy loaded for performance)
const LandingPage = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const SignUp = lazy(() => import('./pages/SignUp'));
const Home = lazy(() => import('./pages/Home'));
const Profile = lazy(() => import('./pages/Profile'));
const Devotionals = lazy(() => import('./pages/Devotionals'));
const Studies = lazy(() => import('./pages/Studies'));
const Lives = lazy(() => import('./pages/Lives'));
const Podcasts = lazy(() => import('./pages/Podcasts'));
const Prayers = lazy(() => import('./pages/Prayers'));
const Challenges = lazy(() => import('./pages/Challenges'));
const ContentDetail = lazy(() => import('./pages/ContentDetail'));
const Testimonials = lazy(() => import('./pages/Testimonials'));
const TestimonialDetail = lazy(() => import('./pages/TestimonialDetail'));
const PublishTestimonial = lazy(() => import('./pages/PublishTestimonial'));
const Admin = lazy(() => import('./pages/Admin'));
const ReadingPlans = lazy(() => import('./pages/ReadingPlans'));
const PlanDetail = lazy(() => import('./pages/PlanDetail'));
const Events = lazy(() => import('./pages/Events'));
const EventDetail = lazy(() => import('./pages/EventDetail'));
const Mentorships = lazy(() => import('./pages/Mentorships'));
const MyGarden = lazy(() => import('./pages/MyGarden'));
const Journal = lazy(() => import('./pages/Journal'));

const hexToRgb = (hex: string): string => {
  if (!hex || !hex.startsWith('#')) return '0 0 0';
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? `${parseInt(result[1], 16)} ${parseInt(result[2], 16)} ${parseInt(result[3], 16)}` : '0 0 0';
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isDesktopSidebarCollapsed, setDesktopSidebarCollapsed] = useState(false);
  const [isSearchModalOpen, setSearchModalOpen] = useState(false);
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [appearanceSettings, setAppearanceSettings] = useState<AppearanceSettings | null>(null);
  
  const [detailId, setDetailId] = useState<string | null>(null);
  const [eventDetailId, setEventDetailId] = useState<string | null>(null);
  const [pageKey, setPageKey] = useState(Date.now());

  useEffect(() => {
    // onAuthUserChanged agora retorna nosso perfil de usuário completo ou nulo, e lida com o login diário
    const { data: authListener } = onAuthUserChanged((sessionUser) => {
        setUser(sessionUser);
        if (sessionUser) {
            // Se o usuário estiver logado, navegue para home se ele estiver em uma página pública.
            // Usar a forma de atualização funcional para evitar problemas com closures obsoletas.
            setCurrentPage(prevPage => 
                ['login', 'signup', 'landing'].includes(prevPage) ? 'home' : prevPage
            );
        } else {
             // Se o usuário não estiver logado, force a navegação para a página de login.
            setCurrentPage('login');
        }
        setAuthChecked(true);
    });

    return () => {
        authListener.subscription.unsubscribe();
    };
  }, []); // O array de dependências vazio garante que isso rode apenas uma vez.
  
  const fetchAnnouncements = useCallback(async () => {
    const activeAnnouncements = await getAnnouncements();
    setAnnouncements(activeAnnouncements);
  }, []);

  const applyAppearanceSettings = useCallback((settings: AppearanceSettings) => {
    if (settings.logoSettings?.siteTitle) {
      document.title = settings.logoSettings.siteTitle;
    }
    if (settings.faviconUrl) {
      const faviconLink = document.getElementById('favicon-link') as HTMLLinkElement;
      if (faviconLink) faviconLink.href = settings.faviconUrl;
    }
    if (settings.themeColors) {
      const styleTag = document.getElementById('dynamic-theme-vars');
      if (styleTag) {
        styleTag.innerHTML = `
          :root {
            --color-creme-velado: ${hexToRgb(settings.themeColors.lightBg)};
            --color-branco-nevoa: ${hexToRgb(settings.themeColors.lightComponentBg)};
            --color-marrom-seiva: ${hexToRgb(settings.themeColors.lightText)};
            --color-verde-mata: ${hexToRgb(settings.themeColors.darkComponentBg)};
            --color-verde-escuro-profundo: ${hexToRgb(settings.themeColors.darkBg)};
            --color-dourado-suave: ${hexToRgb(settings.themeColors.accent)};
          }
        `;
      }
    }
    if (settings.fontSettings) {
      const fontStyleTag = document.getElementById('dynamic-font-vars');
      if (fontStyleTag) {
          fontStyleTag.innerHTML = `
          :root {
              --font-heading: '${settings.fontSettings.headingFont}', serif;
              --font-body: '${settings.fontSettings.bodyFont}', sans-serif;
          }
          `;
      }
    }
    if (settings.useBackgroundImage && settings.backgroundImageUrl) {
      document.body.style.backgroundImage = `url(${settings.backgroundImageUrl})`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundPosition = 'center';
      document.body.style.backgroundAttachment = 'fixed';
    } else {
      document.body.style.backgroundImage = '';
    }
  }, []);

  const fetchAndApplySettings = useCallback(async () => {
    try {
      const settings = await getAppearanceSettings();
      setAppearanceSettings(settings);
      applyAppearanceSettings(settings);
    } catch (error) {
      console.error("Failed to fetch or apply appearance settings:", error);
    }
  }, [applyAppearanceSettings]);

  useEffect(() => {
    const checkLiveStatus = async () => {
      try {
        const sessions = await getLiveSessions();
        const isCurrentlyLive = sessions.some(s => s.status === 'live');
        setIsLiveActive(isCurrentlyLive);
      } catch (error) {
        console.error("Failed to check live status:", error);
      }
    };
    
    checkLiveStatus();
    const interval = setInterval(checkLiveStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchAnnouncements();
    fetchAndApplySettings();

    const handleSettingsUpdate = () => fetchAndApplySettings();
    const handleAnnouncementsUpdate = () => fetchAnnouncements();

    document.addEventListener('settingsUpdated', handleSettingsUpdate);
    document.addEventListener('announcementsUpdated', handleAnnouncementsUpdate);

    return () => {
        document.removeEventListener('settingsUpdated', handleSettingsUpdate);
        document.removeEventListener('announcementsUpdated', handleAnnouncementsUpdate);
    };
  }, [fetchAnnouncements, fetchAndApplySettings]);

  const handleNavigate = useCallback((page: Page, id: string | null = null) => {
    setCurrentPage(page);
    setPageKey(Date.now());
    if (page === 'contentDetail' || page === 'testimonialDetail' || page === 'planDetail') {
        setDetailId(id);
        setEventDetailId(null);
    } else if (page === 'eventDetail') {
        setEventDetailId(id);
        setDetailId(null);
    } else {
        setDetailId(null);
        setEventDetailId(null);
    }
    setMobileSidebarOpen(false);
    setSearchModalOpen(false);
    window.scrollTo(0, 0);
  }, []);
  
  const handleUserUpdate = useCallback(async (updatedData: Partial<User>) => {
      if (user) {
          const updatedUser = { ...user, ...updatedData };
          setUser(updatedUser);
      }
  }, [user]);

  const handleViewDetail = useCallback((id: string) => {
    handleNavigate('contentDetail', id);
  }, [handleNavigate]);

  const handleViewTestimonial = useCallback((id: string) => {
    handleNavigate('testimonialDetail', id);
  }, [handleNavigate]);

  const renderPage = () => {
    if (!authChecked) {
      return <div className="flex items-center justify-center h-screen bg-creme-velado dark:bg-verde-escuro-profundo"><Spinner /></div>;
    }

    if (!user) {
      switch (currentPage) {
        case 'signup': return <SignUp onNavigate={handleNavigate} />;
        case 'landing': return <LandingPage onNavigate={handleNavigate} />;
        case 'login': default: return <Login onNavigate={handleNavigate} />;
      }
    }

    switch (currentPage) {
      case 'home': return <Home onNavigate={handleNavigate} user={user} onViewDetail={handleViewDetail} />;
      case 'profile': return <Profile user={user} onUserUpdate={handleUserUpdate} onNavigate={handleNavigate} onViewTestimonial={handleViewTestimonial} />;
      case 'devotionals': return <Devotionals onViewDetail={handleViewDetail} user={user} onUserUpdate={handleUserUpdate} />;
      case 'studies': return <Studies user={user} onUserUpdate={handleUserUpdate} setHasNotifications={() => {}} />;
      case 'lives': return <Lives user={user} />;
      case 'podcasts': return <Podcasts user={user} />;
      case 'prayers': return <Prayers user={user} onUserUpdate={handleUserUpdate} />;
      case 'challenges': return <Challenges user={user} onUserUpdate={handleUserUpdate} />;
      case 'mentorships': return <Mentorships onViewDetail={handleViewDetail} user={user} />;
      case 'myGarden': return <MyGarden user={user} />;
      case 'journal': return <Journal user={user} onNavigate={handleNavigate} />;
      case 'contentDetail': return detailId ? <ContentDetail id={detailId} user={user} onUserUpdate={handleUserUpdate} /> : null;
      case 'testimonials': return <Testimonials onViewTestimonial={handleViewTestimonial} onNavigate={handleNavigate} user={user} />;
      case 'testimonialDetail': return detailId ? <TestimonialDetail id={detailId} user={user} onNavigate={handleNavigate} /> : null;
      case 'publishTestimonial': return <PublishTestimonial user={user} onNavigate={handleNavigate} onUserUpdate={handleUserUpdate} />;
      case 'readingPlans': return <ReadingPlans user={user} onNavigate={handleNavigate} />;
      case 'planDetail': return detailId ? <PlanDetail id={detailId} user={user} onNavigate={handleNavigate} /> : null;
      case 'events': return <Events user={user} onNavigate={handleNavigate} />;
      case 'eventDetail': return eventDetailId ? <EventDetail id={eventDetailId} user={user} onNavigate={handleNavigate} /> : null;
      case 'admin': return user.role === 'admin' ? <Admin user={user} /> : <Home onNavigate={handleNavigate} user={user} onViewDetail={handleViewDetail} />;
      default: return <Home onNavigate={handleNavigate} user={user} onViewDetail={handleViewDetail} />;
    }
  };

  const PageSuspense: React.FC = () => (
    <Suspense fallback={<div className="flex items-center justify-center h-full w-full"><Spinner /></div>}>
      <div key={pageKey} className="animate-fade-in">
        {renderPage()}
      </div>
    </Suspense>
  );

  if (!user) {
    return <PageSuspense />;
  }

  return (
    <div className="relative h-screen bg-creme-velado dark:bg-verde-escuro-profundo text-marrom-seiva dark:text-creme-velado">
      <Sidebar 
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
        isCollapsed={isDesktopSidebarCollapsed}
        onToggleCollapse={() => setDesktopSidebarCollapsed(!isDesktopSidebarCollapsed)}
        onNavigate={handleNavigate}
        user={user}
        currentPage={currentPage}
        isLiveActive={isLiveActive}
        logoUrl={appearanceSettings?.logoUrl}
      />
      <div className={`flex-1 flex flex-col h-full overflow-hidden transition-all duration-300 ease-in-out md:pl-64 ${isDesktopSidebarCollapsed ? 'md:!pl-20' : ''}`}>
        <Header 
          onToggleMobileSidebar={() => setMobileSidebarOpen(!isMobileSidebarOpen)}
          user={user} 
          onNavigate={handleNavigate}
          onToggleSearch={() => setSearchModalOpen(true)}
        />
         {announcements.map(ann => (
            <AnnouncementBanner key={ann.id} announcement={ann} />
         ))}
        <main className="flex-1 overflow-x-hidden overflow-y-auto pb-16 md:pb-0">
           <PageSuspense />
        </main>
        <BottomNav 
          onNavigate={handleNavigate}
          currentPage={currentPage}
        />
      </div>
       <SearchModal 
        isOpen={isSearchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onViewDetail={handleViewDetail}
        user={user}
      />
    </div>
  );
}

const style = document.createElement('style');
style.innerHTML = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fade-in {
    animation: fadeIn 0.5s ease-out forwards;
  }
`;
document.head.appendChild(style);