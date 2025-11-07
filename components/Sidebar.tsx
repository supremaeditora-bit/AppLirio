import React from 'react';
import { Page, User } from '../types';
import { logout } from '../services/authService';
import { HomeIcon, BookOpenIcon, UsersIcon, MicrophoneIcon, HeartIcon, ChartPieIcon, ShieldCheckIcon, VideoCameraIcon, StarIcon, ChevronLeftIcon, AcademicCapIcon } from './Icons';
import { PrayingHandsIcon } from './Icons';

interface SidebarProps {
    isMobileOpen: boolean;
    onMobileClose: () => void;
    isCollapsed: boolean;
    onToggleCollapse: () => void;
    onNavigate: (page: Page) => void;
    user: User | null;
    currentPage: Page;
}

// FIX: Specified the props type for the `icon` React.ReactElement to allow passing `className`.
const NavLink: React.FC<{ icon: React.ReactElement<{ className?: string }>, label: string, page: Page, currentPage: Page, onNavigate: (page: Page) => void, isCollapsed: boolean }> = ({ icon, label, page, currentPage, onNavigate, isCollapsed }) => {
    const isActive = currentPage === page;
    return (
        <button
            onClick={() => onNavigate(page)}
            className={`flex items-center w-full px-4 py-3 text-left rounded-lg transition-colors duration-200 ${
                isActive
                ? 'bg-dourado-suave/20 text-dourado-suave'
                : 'hover:bg-marrom-seiva/5 dark:hover:bg-creme-velado/5'
            } ${isCollapsed ? 'md:justify-center md:px-2' : ''}`}
            aria-label={label}
        >
            {React.cloneElement(icon, { className: `w-6 h-6 shrink-0 transition-all ${isCollapsed ? 'md:mr-0' : 'mr-4'}` })}
            <span className={`font-semibold whitespace-nowrap transition-opacity ${isCollapsed ? 'md:opacity-0 md:hidden' : 'opacity-100'}`}>{label}</span>
        </button>
    )
}

export default function Sidebar({ isMobileOpen, onMobileClose, isCollapsed, onToggleCollapse, onNavigate, user, currentPage }: SidebarProps) {

    return (
        <>
            <div className={`fixed inset-0 bg-black/60 z-30 md:hidden transition-opacity ${isMobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onMobileClose}></div>
            <aside className={`fixed inset-y-0 left-0 flex flex-col bg-branco-nevoa dark:bg-verde-mata p-4 z-40 transform transition-all duration-300 ease-in-out ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 ${isCollapsed ? 'md:w-20' : 'md:w-64'}`}>
                {/* Header with Title and Collapse Button */}
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-marrom-seiva/10 dark:border-creme-velado/10">
                    <div className={`overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0' : 'flex-1'}`}>
                        <h1 className="font-serif text-3xl font-bold text-verde-mata dark:text-dourado-suave whitespace-nowrap">
                            Lírios do Vale
                        </h1>
                    </div>
                    <button 
                        onClick={onToggleCollapse} 
                        className="hidden md:block p-1 rounded-full text-marrom-seiva dark:text-creme-velado hover:bg-marrom-seiva/10 dark:hover:bg-creme-velado/10"
                        aria-label={isCollapsed ? "Expandir menu" : "Recolher menu"}
                    >
                        <ChevronLeftIcon className={`w-6 h-6 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
                    </button>
                </div>

                <nav className="flex-1 space-y-2 overflow-y-auto scrollbar-hide">
                    <h2 className={`px-4 pt-4 pb-2 text-xs font-bold uppercase text-marrom-seiva/60 dark:text-creme-velado/60 whitespace-nowrap ${isCollapsed ? 'md:hidden' : ''}`}>Menu</h2>
                    <NavLink icon={<HomeIcon />} label="Início" page="home" currentPage={currentPage} onNavigate={onNavigate} isCollapsed={isCollapsed} />
                    <NavLink icon={<BookOpenIcon />} label="Devocionais" page="devotionals" currentPage={currentPage} onNavigate={onNavigate} isCollapsed={isCollapsed} />
                    <NavLink icon={<PrayingHandsIcon />} label="Orações" page="prayers" currentPage={currentPage} onNavigate={onNavigate} isCollapsed={isCollapsed} />
                    <NavLink icon={<UsersIcon />} label="Estudos" page="studies" currentPage={currentPage} onNavigate={onNavigate} isCollapsed={isCollapsed} />
                    
                    <h2 className={`px-4 pt-4 pb-2 text-xs font-bold uppercase text-marrom-seiva/60 dark:text-creme-velado/60 whitespace-nowrap ${isCollapsed ? 'md:hidden' : ''}`}>Recursos</h2>
                    <NavLink icon={<HeartIcon />} label="Testemunhos" page="testimonials" currentPage={currentPage} onNavigate={onNavigate} isCollapsed={isCollapsed} />
                    <NavLink icon={<AcademicCapIcon />} label="Planos de Leitura" page="readingPlans" currentPage={currentPage} onNavigate={onNavigate} isCollapsed={isCollapsed} />
                    <NavLink icon={<ChartPieIcon />} label="Mentoria" page="mentorship" currentPage={currentPage} onNavigate={onNavigate} isCollapsed={isCollapsed} />
                    <NavLink icon={<MicrophoneIcon />} label="Podcasts" page="podcasts" currentPage={currentPage} onNavigate={onNavigate} isCollapsed={isCollapsed} />
                    <NavLink icon={<VideoCameraIcon />} label="Lives" page="lives" currentPage={currentPage} onNavigate={onNavigate} isCollapsed={isCollapsed} />
                    
                    {user?.role === 'admin' && (
                         <NavLink icon={<ShieldCheckIcon />} label="Admin" page="admin" currentPage={currentPage} onNavigate={onNavigate} isCollapsed={isCollapsed} />
                    )}
                </nav>

            </aside>
        </>
    );
}