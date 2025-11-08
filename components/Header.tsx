import React, { useState, useEffect, useRef, useCallback } from 'react';
import { User, Page, Notification } from '../types';
import { SearchIcon, BellIcon, MenuIcon, SunIcon, MoonIcon, UserCircleIcon, LogoutIcon, ShieldCheckIcon } from './Icons';
import { useTheme } from '../hooks/useTheme';
import { getNotifications, markNotificationAsRead } from '../services/api';
import { logout } from '../services/authService';

interface HeaderProps {
    onToggleMobileSidebar: () => void;
    user: User | null;
    onNavigate: (page: Page) => void;
    onToggleSearch: () => void;
}

export default function Header({ onToggleMobileSidebar, user, onNavigate, onToggleSearch }: HeaderProps) {
    const { theme, toggleTheme } = useTheme();
    const [isNotifOpen, setNotifOpen] = useState(false);
    const [isProfileMenuOpen, setProfileMenuOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const notifRef = useRef<HTMLDivElement>(null);
    const profileMenuRef = useRef<HTMLDivElement>(null);

    const fetchNotifications = useCallback(async () => {
        if (!user) return;
        const data = await getNotifications();
        setNotifications(data);
        const unread = data.filter(n => !n.readBy.includes(user.id)).length;
        setUnreadCount(unread);
    }, [user]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
                setNotifOpen(false);
            }
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
                setProfileMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [notifRef, profileMenuRef]);

    useEffect(() => {
        const handleUpdate = () => {
            fetchNotifications();
        };

        document.addEventListener('notificationsUpdated', handleUpdate);

        return () => {
            document.removeEventListener('notificationsUpdated', handleUpdate);
        };
    }, [fetchNotifications]);

    const handleToggleNotif = async () => {
        setProfileMenuOpen(false);
        const nextState = !isNotifOpen;
        setNotifOpen(nextState);
        if (nextState && unreadCount > 0 && user) {
            const unreadNotifications = notifications.filter(n => !n.readBy.includes(user.id));
            await Promise.all(unreadNotifications.map(n => markNotificationAsRead(n.id, user.id!)));
            setUnreadCount(0);
        }
    };
    
    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
        if (seconds < 60) return `agora`;
        const minutes = Math.round(seconds / 60);
        if (minutes < 60) return `há ${minutes}min`;
        const hours = Math.round(minutes / 60);
        if (hours < 24) return `há ${hours}h`;
        const days = Math.round(hours / 24);
        return `há ${days}d`;
    };

    const handleLogout = async () => {
        await logout();
        onNavigate('login');
    };


    return (
        <header className="flex items-center justify-between h-16 px-4 sm:px-8 bg-creme-velado dark:bg-verde-escuro-profundo border-b border-marrom-seiva/10 dark:border-creme-velado/10 flex-shrink-0">
            <div className="flex items-center">
                <button onClick={onToggleMobileSidebar} className="mr-4 text-marrom-seiva dark:text-creme-velado md:hidden">
                    <MenuIcon className="w-6 h-6" />
                </button>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
                 <button 
                    onClick={onToggleSearch}
                    className="p-2 rounded-full text-marrom-seiva dark:text-creme-velado hover:bg-marrom-seiva/10 dark:hover:bg-creme-velado/10"
                 >
                    <SearchIcon className="w-6 h-6" />
                </button>
                 <button 
                    onClick={toggleTheme}
                    className="p-2 rounded-full text-marrom-seiva dark:text-creme-velado hover:bg-marrom-seiva/10 dark:hover:bg-creme-velado/10"
                 >
                    {theme === 'light' ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
                </button>
                <div className="relative" ref={notifRef}>
                    <button 
                        onClick={handleToggleNotif}
                        className="relative p-2 rounded-full text-marrom-seiva dark:text-creme-velado hover:bg-marrom-seiva/10 dark:hover:bg-creme-velado/10"
                    >
                        <BellIcon className="w-6 h-6"/>
                        {unreadCount > 0 && (
                             <span className="absolute top-1.5 right-1.5 block h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-creme-velado dark:border-verde-escuro-profundo" />
                        )}
                    </button>
                    {isNotifOpen && (
                        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-branco-nevoa dark:bg-verde-mata rounded-lg shadow-2xl z-50 overflow-hidden border border-marrom-seiva/10 dark:border-creme-velado/10">
                            <div className="p-4 border-b border-marrom-seiva/10 dark:border-creme-velado/10">
                                <h3 className="font-serif font-semibold text-verde-mata dark:text-dourado-suave">Notificações</h3>
                            </div>
                            <div className="max-h-96 overflow-y-auto">
                                {notifications.length > 0 ? (
                                    notifications.map(notif => (
                                        <div key={notif.id} className="p-4 border-b border-marrom-seiva/10 dark:border-creme-velado/10 last:border-b-0 hover:bg-creme-velado dark:hover:bg-verde-escuro-profundo">
                                            <p className={`font-sans font-semibold text-sm ${!notif.readBy.includes(user!.id) ? 'text-verde-mata dark:text-creme-velado' : 'text-marrom-seiva/80 dark:text-creme-velado/80'}`}>{notif.title}</p>
                                            <p className="font-sans text-sm text-marrom-seiva/80 dark:text-creme-velado/80">{notif.body}</p>
                                            <p className="text-xs text-marrom-seiva/60 dark:text-creme-velado/60 mt-1">{formatTimeAgo(notif.createdAt)}</p>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center p-8 text-sm font-sans text-marrom-seiva/70 dark:text-creme-velado/70">Nenhuma notificação.</p>
                                )}
                            </div>
                            <div className="p-2 bg-creme-velado dark:bg-verde-escuro-profundo/50 text-center border-t border-marrom-seiva/10 dark:border-creme-velado/10">
                                <button onClick={() => { onNavigate('profile'); setNotifOpen(false); }} className="font-sans text-sm font-semibold text-dourado-suave hover:underline">
                                    Ver todas no Perfil
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                {/* Profile Dropdown */}
                <div className="relative" ref={profileMenuRef}>
                    <button onClick={() => {setProfileMenuOpen(!isProfileMenuOpen); setNotifOpen(false);}} className="flex items-center space-x-2 rounded-full p-1 hover:bg-marrom-seiva/10 dark:hover:bg-creme-velado/10">
                        <img src={user?.avatarUrl} alt={user?.displayName} className="w-9 h-9 rounded-full object-cover" />
                        <span className="hidden lg:inline font-sans font-semibold text-marrom-seiva dark:text-creme-velado">{user?.displayName}</span>
                    </button>
                    {isProfileMenuOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-branco-nevoa dark:bg-verde-mata rounded-lg shadow-2xl z-50 overflow-hidden border border-marrom-seiva/10 dark:border-creme-velado/10">
                            <div>
                                <button 
                                    onClick={() => { onNavigate('profile'); setProfileMenuOpen(false); }} 
                                    className="w-full text-left flex items-center px-4 py-3 text-sm font-sans text-marrom-seiva dark:text-creme-velado hover:bg-marrom-seiva/5 dark:hover:bg-creme-velado/5"
                                >
                                    <UserCircleIcon className="w-5 h-5 mr-3" />
                                    Meu Perfil
                                </button>
                                {user?.role === 'admin' && (
                                    <button 
                                        onClick={() => { onNavigate('admin'); setProfileMenuOpen(false); }} 
                                        className="w-full text-left flex items-center px-4 py-3 text-sm font-sans text-marrom-seiva dark:text-creme-velado hover:bg-marrom-seiva/5 dark:hover:bg-creme-velado/5"
                                    >
                                        <ShieldCheckIcon className="w-5 h-5 mr-3" />
                                        Administração
                                    </button>
                                )}
                            </div>
                            <div className="border-t border-marrom-seiva/10 dark:border-creme-velado/10">
                                <button 
                                    onClick={handleLogout} 
                                    className="w-full text-left flex items-center px-4 py-3 text-sm font-sans text-marrom-seiva dark:text-creme-velado hover:bg-marrom-seiva/5 dark:hover:bg-creme-velado/5"
                                >
                                    <LogoutIcon className="w-5 h-5 mr-3" />
                                    Sair
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}