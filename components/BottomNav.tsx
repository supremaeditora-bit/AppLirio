
import React from 'react';
import { Page } from '../types';
import { HomeIcon, BookOpenIcon, HeartIcon, UserCircleIcon, UsersIcon } from './Icons';

interface BottomNavProps {
    onNavigate: (page: Page) => void;
    currentPage: Page;
}

const NavItem: React.FC<{ icon: React.ReactElement<{ className?: string }>, label: string, page: Page, currentPage: Page, onNavigate: (page: Page) => void }> = ({ icon, label, page, currentPage, onNavigate }) => {
    const isActive = currentPage === page;
    return (
        <button
            onClick={() => onNavigate(page)}
            className={`flex flex-col items-center justify-center w-full pt-2 pb-1 transition-colors duration-200 ${
                isActive ? 'text-dourado-suave' : 'text-marrom-seiva/70 dark:text-creme-velado/70'
            }`}
        >
            {React.cloneElement(icon, { className: 'w-6 h-6 mb-1' })}
            <span className="text-xs font-bold">{label}</span>
        </button>
    );
};

export default function BottomNav({ onNavigate, currentPage }: BottomNavProps) {
    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-branco-nevoa dark:bg-verde-mata border-t border-marrom-seiva/10 dark:border-creme-velado/10 flex justify-around z-20">
            <NavItem icon={<HomeIcon />} label="Início" page="home" currentPage={currentPage} onNavigate={onNavigate} />
            <NavItem icon={<BookOpenIcon />} label="Devocionais" page="devotionals" currentPage={currentPage} onNavigate={onNavigate} />
            <NavItem icon={<HeartIcon />} label="Testemunhos" page="testimonials" currentPage={currentPage} onNavigate={onNavigate} />
            <NavItem icon={<UsersIcon />} label="Estudos" page="studies" currentPage={currentPage} onNavigate={onNavigate} />
            <NavItem icon={<UserCircleIcon />} label="Perfil" page="profile" currentPage={currentPage} onNavigate={onNavigate} />
        </div>
    );
}