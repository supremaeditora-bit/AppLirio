
import React, { useState } from 'react';
import { User } from '../types';
import UserManager from '../components/admin/UserManager';
import ContentManager from '../components/admin/ContentManager';
import ModerationManager from '../components/admin/ModerationManager';
import AppearanceManager from '../components/admin/AppearanceManager';
import ChallengeManager from '../components/admin/ChallengeManager';
import Insights from '../components/admin/Insights';

interface AdminProps {
    user: User;
}

type AdminTab = 'insights' | 'users' | 'content' | 'moderation' | 'challenges' | 'appearance';

export default function Admin({ user }: AdminProps) {
    const [activeTab, setActiveTab] = useState<AdminTab>('insights');

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
            case 'challenges':
                return <ChallengeManager />;
            case 'appearance':
                return <AppearanceManager />;
            default:
                return null;
        }
    };
    
    const TabButton: React.FC<{tab: AdminTab, label: string}> = ({tab, label}) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`py-2 px-4 font-sans font-semibold text-sm rounded-md transition-colors ${
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
                <TabButton tab="challenges" label="Desafios" />
                <TabButton tab="appearance" label="Aparência" />
            </div>

            <div>
                {renderTabContent()}
            </div>
        </div>
    );
}
