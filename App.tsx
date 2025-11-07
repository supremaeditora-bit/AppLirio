

import React, { useState, useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { onAuthUserChanged } from './services/authService';
import { getUserProfile } from './services/api';
import { Page, User } from './types';

import Sidebar from './components/Sidebar';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import Spinner from './components/Spinner';
import SearchModal from './components/SearchModal';

// Pages
import LandingPage from './pages/Landing';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Devotionals from './pages/Devotionals';
import Studies from './pages/Studies';
import Mentorship from './pages/Mentorship';
import Lives from './pages/Lives';
import Podcasts from './pages/Podcasts';
import Prayers from './pages/Prayers';
import Challenges from './pages/Challenges';
import ContentDetail from './pages/ContentDetail';
import Testimonials from './pages/Testimonials';
import TestimonialDetail from './pages/TestimonialDetail';
import PublishTestimonial from './pages/PublishTestimonial';
import Admin from './pages/Admin';
import ReadingPlans from './pages/ReadingPlans';
import PlanDetail from './pages/PlanDetail';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const [isMobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isDesktopSidebarCollapsed, setDesktopSidebarCollapsed] = useState(false);
  const [isSearchModalOpen, setSearchModalOpen] = useState(false);
  
  // State for detail pages
  const [detailId, setDetailId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthUserChanged(async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        const userProfile = await getUserProfile(firebaseUser.uid);
        setUser(userProfile);
        if (['login', 'signup', 'landing'].includes(currentPage)) {
            setCurrentPage('home');
        }
      } else {
        setUser(null);
        setCurrentPage('login');
      }
      setAuthChecked(true);
    });

    return () => unsubscribe();
  }, [currentPage]);

  const handleNavigate = (page: Page, id: string | null = null) => {
    setCurrentPage(page);
    setDetailId(id);
    setMobileSidebarOpen(false);
    setSearchModalOpen(false); // Fecha o pop-up de busca em qualquer navegação
    window.scrollTo(0, 0);
  };
  
  const handleUserUpdate = async (updatedData: Partial<User>) => {
      if (user) {
          const updatedUser = { ...user, ...updatedData };
          setUser(updatedUser);
      }
  };

  const handleViewDetail = (id: string) => {
    handleNavigate('contentDetail', id);
  }

  const handleViewTestimonial = (id: string) => {
    handleNavigate('testimonialDetail', id);
  }

  const renderPage = () => {
    if (!authChecked) {
      return <div className="flex items-center justify-center h-screen bg-creme-velado dark:bg-verde-escuro-profundo"><Spinner /></div>;
    }

    if (!user) {
      switch (currentPage) {
        case 'signup':
          return <SignUp onNavigate={handleNavigate} />;
        case 'landing':
          return <LandingPage onNavigate={handleNavigate} />;
        case 'login':
        default:
          return <Login onNavigate={handleNavigate} />;
      }
    }

    switch (currentPage) {
      case 'home':
        return <Home onNavigate={handleNavigate} user={user} onViewDetail={handleViewDetail} />;
      case 'profile':
        return <Profile user={user} onUserUpdate={handleUserUpdate} onNavigate={handleNavigate} onViewTestimonial={handleViewTestimonial} />;
      case 'devotionals':
        return <Devotionals onViewDetail={handleViewDetail} user={user} onUserUpdate={handleUserUpdate} />;
      case 'studies':
        return <Studies user={user} onUserUpdate={handleUserUpdate} setHasNotifications={() => {}} />;
      case 'mentorship':
        return <Mentorship onViewDetail={handleViewDetail} user={user} />;
      case 'lives':
        return <Lives user={user} />;
      case 'podcasts':
        return <Podcasts user={user} />;
      case 'prayers':
        return <Prayers user={user} onUserUpdate={handleUserUpdate} />;
      case 'challenges':
        return <Challenges user={user} onUserUpdate={handleUserUpdate} />;
      case 'contentDetail':
        return detailId ? <ContentDetail id={detailId} user={user} onNavigateBack={() => handleNavigate('home')} onUserUpdate={handleUserUpdate} /> : null;
      case 'testimonials':
        return <Testimonials onViewTestimonial={handleViewTestimonial} onNavigate={handleNavigate} user={user} />;
      case 'testimonialDetail':
        return detailId ? <TestimonialDetail id={detailId} user={user} onNavigate={handleNavigate} /> : null;
      case 'publishTestimonial':
        return <PublishTestimonial user={user} onNavigate={handleNavigate} />;
      case 'readingPlans':
        return <ReadingPlans user={user} onNavigate={handleNavigate} />;
      case 'planDetail':
        return detailId ? <PlanDetail id={detailId} user={user} onNavigate={handleNavigate} /> : null;
      case 'admin':
        return user.role === 'admin' ? <Admin user={user} /> : <Home onNavigate={handleNavigate} user={user} onViewDetail={handleViewDetail} />;
      default:
        return <Home onNavigate={handleNavigate} user={user} onViewDetail={handleViewDetail} />;
    }
  };

  if (!user) {
    return (
      <>
        {renderPage()}
      </>
    );
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
      />
      <div className={`flex-1 flex flex-col h-full overflow-hidden transition-all duration-300 ease-in-out md:pl-64 ${isDesktopSidebarCollapsed ? 'md:!pl-20' : ''}`}>
        <Header 
          onToggleMobileSidebar={() => setMobileSidebarOpen(!isMobileSidebarOpen)}
          user={user} 
          onNavigate={handleNavigate}
          onToggleSearch={() => setSearchModalOpen(true)}
        />
        <main className="flex-1 overflow-x-hidden overflow-y-auto pb-16 md:pb-0">
          {renderPage()}
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