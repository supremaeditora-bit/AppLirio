import React, { useState } from 'react';
import { User } from '../types';
import UserManager from '../components/admin/UserManager';
import ContentManager from '../components/admin/ContentManager';
import ModerationManager from '../components/admin/ModerationManager';
import AppearanceManager from '../components/admin/AppearanceManager';
import Insights from '../components/admin/Insights';
import EventManager from '../components/admin/EventManager';
import PlanManager from '../components/admin/PlanManager';
import AnnouncementManager from '../components/admin/AnnouncementManager';
import { clearAppCacheAndReload } from '../services/cacheService';
import ConfirmationModal from '../components/ConfirmationModal';
import Button from '../components/Button';
import { TrashIcon } from '../components/Icons';

interface AdminProps {
    user: User;
}

type AdminTab = 'insights' | 'users' | 'content' | 'moderation' | 'appearance' | 'events' | 'plans' | 'announcements' | 'system';

export default function Admin({ user }: AdminProps) {
    const [activeTab, setActiveTab] = useState<AdminTab>('insights');
    
    const [isCacheClearConfirmOpen, setIsCacheClearConfirmOpen] = useState(false);
    const [isClearingCache, setIsClearingCache] = useState(false);

    const handleClearCache = async () => {
        setIsClearingCache(true);
        await clearAppCacheAndReload();
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'insights':
                return <Insights />;
            case 'users':
                return <UserManager />;
            case 'content':
                return <ContentManager user={user} />;
            case 'moderation':
                return <ModerationManager />;
            case 'events':
                return <EventManager user={user} />;
            case 'plans':
                return <PlanManager user={user} />;
            case 'announcements':
                return <AnnouncementManager />;
            case 'appearance':
                return <AppearanceManager />;
            case 'system':
                return (
                    <div className="bg-branco-nevoa dark:bg-verde-mata p-6 rounded-xl shadow-lg">
                        <h2 className="font-serif text-2xl font-semibold text-verde-mata dark:text-dourado-suave mb-6">Manutenção do Sistema</h2>
                        
                        <div className="p-6 border border-marrom-seiva/10 dark:border-creme-velado/10 rounded-lg bg-creme-velado/50 dark:bg-verde-escuro-profundo/50">
                            <h3 className="font-sans font-bold text-lg text-marrom-seiva dark:text-creme-velado mb-2">Gerenciamento de Cache</h3>
                            <p className="font-sans text-sm text-marrom-seiva/80 dark:text-creme-velado/80 mb-4">
                                Limpar o cache pode resolver problemas de exibição ou dados desatualizados. Isso forçará o aplicativo a recarregar e baixar os dados mais recentes do servidor.
                            </p>
                            <Button variant="secondary" onClick={() => setIsCacheClearConfirmOpen(true)} className="!bg-red-100 hover:!bg-red-200 text-red-800 border-red-200">
                                <TrashIcon className="w-5 h-5 mr-2" /> Esvaziar Cache do Aplicativo
                            </Button>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };
    
    const TabButton: React.FC<{tab: AdminTab, label: string}> = ({tab, label}) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`py-2 px-4 font-sans font-semibold text-sm rounded-md transition-colors whitespace-nowrap ${
                activeTab === tab 
                ? 'bg-dourado-suave text-verde-mata'
                : 'text-marrom-seiva/70 dark:text-creme-velado/70 hover:bg-marrom-seiva/5 dark:hover:bg-creme-velado/5'
            }`}
        >
            {label}
        </button>
    )

    return (
        <div className="container mx-auto p-4 sm:p-8">
            <h1 className="font-serif text-4xl font-bold text-verde-mata dark:text-dourado-suave mb-8">Painel de Administração</h1>
            
            <div className="mb-6 flex items-center space-x-2 border-b border-marrom-seiva/10 dark:border-creme-velado/10 overflow-x-auto scrollbar-hide pb-2">
                <TabButton tab="insights" label="Insights" />
                <TabButton tab="users" label="Usuárias" />
                <TabButton tab="content" label="Conteúdo" />
                <TabButton tab="moderation" label="Moderação" />
                <TabButton tab="events" label="Eventos" />
                <TabButton tab="plans" label="Planos" />
                <TabButton tab="announcements" label="Anúncios" />
                <TabButton tab="appearance" label="Aparência" />
                <TabButton tab="system" label="Sistema" />
            </div>

            <div>
                {renderTabContent()}
            </div>

            <ConfirmationModal
                isOpen={isCacheClearConfirmOpen}
                onClose={() => setIsCacheClearConfirmOpen(false)}
                onConfirm={handleClearCache}
                title="Esvaziar Cache do Aplicativo"
                message="Isso removerá todos os dados salvos offline (cache) e recarregará o aplicativo com os dados mais recentes. Deseja continuar?"
                confirmText="Sim, esvaziar"
                isLoading={isClearingCache}
            />
        </div>
    );
}