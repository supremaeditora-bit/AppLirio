






import React from 'react';
import { Page, User } from '../types';
import { logout } from '../services/authService';
import { HomeIcon, BookOpenIcon, UsersIcon, MicrophoneIcon, HeartIcon, ChartPieIcon, ShieldCheckIcon, VideoCameraIcon, StarIcon, ChevronLeftIcon, AcademicCapIcon, CalendarDaysIcon, JournalIcon, SparklesIcon, InformationCircleIcon, QuestionMarkCircleIcon, BibleIcon } from './Icons';
import { PrayingHandsIcon } from './Icons';
import { useTheme } from '../hooks/useTheme';

interface SidebarProps {
    isMobileOpen: boolean;
    onMobileClose: () => void;
    isCollapsed: boolean;
    onToggleCollapse: () => void;
    onNavigate: (page: Page) => void;
    user: User | null;
    currentPage: Page;
    isLiveActive: boolean;
    logoLightUrl?: string;
    logoDarkUrl?: string;
    siteTitle?: string;
    logoDisplayMode?: 'image-only' | 'image-and-text';
}

const NavLink: React.FC<{ icon: React.ElementType, label: string, page: Page, currentPage: Page, onNavigate: (page: Page) => void, isCollapsed: boolean, indicator?: React.ReactNode }> = ({ icon: IconComponent, label, page, currentPage, onNavigate, isCollapsed, indicator }) => {
    const isActive = currentPage === page;
    return (
        <button
            onClick={() => onNavigate(page)}
            className={`flex items-center w-full px-4 py-3 text-left rounded-lg transition-all duration-300 ease-out relative overflow-hidden group ${
                isActive
                ? 'bg-dourado-suave/20 text-dourado-suave'
                : 'text-marrom-seiva dark:text-creme-velado hover:bg-marrom-seiva/5 dark:hover:bg-creme-velado/5'
            } ${isCollapsed ? 'md:justify-center md:px-2' : ''}`}
            aria-label={label}
        >
            {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-dourado-suave rounded-r-full"></div>}
            <IconComponent className={`w-6 h-6 shrink-0 transition-all duration-300 ${isCollapsed ? 'md:mr-0' : 'mr-4'} ${isActive ? 'scale-110' : 'group-hover:scale-105'}`} />
            <span className={`font-semibold whitespace-nowrap transition-all duration-300 flex-1 ${isCollapsed ? 'md:opacity-0 md:w-0 md:hidden' : 'opacity-100 w-auto'}`}>{label}</span>
            {!isCollapsed && indicator && (
                <div className="ml-auto">
                    {indicator}
                </div>
            )}
        </button>
    )
}

export default function Sidebar({ isMobileOpen, onMobileClose, isCollapsed, onToggleCollapse, onNavigate, user, currentPage, isLiveActive, logoLightUrl, logoDarkUrl, siteTitle, logoDisplayMode }: SidebarProps) {
    const { theme } = useTheme();
    const logoToDisplay = theme === 'dark' ? logoDarkUrl || logoLightUrl : logoLightUrl;

    const liveIndicator = (
        <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
        </span>
    );

    return (
        <>
            <div className={`fixed inset-0 bg-black/60 z-30 md:hidden transition-opacity duration-300 ${isMobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onMobileClose}></div>
            <aside className={`fixed inset-y-0 left-0 flex flex-col bg-branco-nevoa dark:bg-verde-mata p-4 z-40 shadow-2xl transform transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 ${isCollapsed ? 'md:w-20' : 'md:w-64'}`}>
                {/* Header with Title and Collapse Button */}
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-marrom-seiva/10 dark:border-creme-velado/10">
                    <div className={`flex items-center h-10 overflow-hidden transition-all duration-300 gap-3 ${isCollapsed ? 'w-0 opacity-0' : 'flex-1 opacity-100'}`}>
                       {logoToDisplay && (
                            <img src={logoToDisplay} alt={siteTitle || "Logo do site"} className="h-full object-contain flex-shrink-0" />
                        )}
                        {(!logoToDisplay || logoDisplayMode === 'image-and-text') && siteTitle && (
                            <h1 className="font-serif text-2xl font-bold text-verde-mata dark:text-dourado-suave whitespace-nowrap animate-fade-in">
                                {siteTitle}
                            </h1>
                        )}
                    </div>
                    <button 
                        onClick={onToggleCollapse} 
                        className="hidden md:block p-2 rounded-full text-marrom-seiva dark:text-creme-velado hover:bg-marrom-seiva/10 dark:hover:bg-creme-velado/10 transition-colors duration-200"
                        aria-label={isCollapsed ? "Expandir menu" : "Recolher menu"}
                    >
                        <ChevronLeftIcon className={`w-6 h-6 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
                    </button>
                </div>

                <nav className="flex-1 space-y-1 overflow-y-auto scrollbar-hide">
                    <h2 className={`px-4 pt-4 pb-2 text-xs font-bold uppercase text-marrom-seiva/60 dark:text-creme-velado/60 whitespace-nowrap transition-opacity duration-300 ${isCollapsed ? 'md:opacity-0 md:hidden' : 'opacity-100'}`}>Menu</h2>
                    <NavLink icon={HomeIcon} label="Início" page="home" currentPage={currentPage} onNavigate={onNavigate} isCollapsed={isCollapsed} />
                    <NavLink icon={BookOpenIcon} label="Lançamento" page="bookLaunch" currentPage={currentPage} onNavigate={onNavigate} isCollapsed={isCollapsed} />
                    <NavLink icon={BibleIcon} label="Devocionais" page="devotionals" currentPage={currentPage} onNavigate={onNavigate} isCollapsed={isCollapsed} />
                    <NavLink icon={AcademicCapIcon} label="Mentoria" page="mentorships" currentPage={currentPage} onNavigate={onNavigate} isCollapsed={isCollapsed} />
                    <NavLink icon={PrayingHandsIcon} label="Orações" page="prayers" currentPage={currentPage} onNavigate={onNavigate} isCollapsed={isCollapsed} />
                    <NavLink icon={UsersIcon} label="Estudos" page="studies" currentPage={currentPage} onNavigate={onNavigate} isCollapsed={isCollapsed} />
                    <NavLink icon={VideoCameraIcon} label="Lives" page="lives" currentPage={currentPage} onNavigate={onNavigate} isCollapsed={isCollapsed} indicator={isLiveActive ? liveIndicator : null} />
                    <NavLink icon={HeartIcon} label="Testemunhos" page="testimonials" currentPage={currentPage} onNavigate={onNavigate} isCollapsed={isCollapsed} />
                    <NavLink icon={AcademicCapIcon} label="Planos de Leitura" page="readingPlans" currentPage={currentPage} onNavigate={onNavigate} isCollapsed={isCollapsed} />
                    <NavLink icon={CalendarDaysIcon} label="Eventos" page="events" currentPage={currentPage} onNavigate={onNavigate} isCollapsed={isCollapsed} />
                    <NavLink icon={MicrophoneIcon} label="Podcasts" page="podcasts" currentPage={currentPage} onNavigate={onNavigate} isCollapsed={isCollapsed} />
                    <NavLink icon={JournalIcon} label="Diário" page="journal" currentPage={currentPage} onNavigate={onNavigate} isCollapsed={isCollapsed} />
                    <NavLink icon={SparklesIcon} label="Meu Jardim" page="myGarden" currentPage={currentPage} onNavigate={onNavigate} isCollapsed={isCollapsed} />
                    
                    <div className="my-4 border-t border-marrom-seiva/10 dark:border-creme-velado/10"></div>
                    <h2 className={`px-4 pb-2 text-xs font-bold uppercase text-marrom-seiva/60 dark:text-creme-velado/60 whitespace-nowrap transition-opacity duration-300 ${isCollapsed ? 'md:opacity-0 md:hidden' : 'opacity-100'}`}>Institucional</h2>
                    <NavLink icon={InformationCircleIcon} label="Sobre Nós" page="about" currentPage={currentPage} onNavigate={onNavigate} isCollapsed={isCollapsed} />
                    <NavLink icon={QuestionMarkCircleIcon} label="Dúvidas Frequentes" page="faq" currentPage={currentPage} onNavigate={onNavigate} isCollapsed={isCollapsed} />


                    {user?.role === 'admin' && (
                         <div className="mt-4 pt-4 border-t border-marrom-seiva/10 dark:border-creme-velado/10">
                            <NavLink icon={ShieldCheckIcon} label="Admin" page="admin" currentPage={currentPage} onNavigate={onNavigate} isCollapsed={isCollapsed} />
                         </div>
                    )}
                </nav>

            </aside>
        </>
    );
}