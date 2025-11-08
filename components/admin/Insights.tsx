

import React, { useState, useEffect } from 'react';
import { ChartPieIcon, UsersIcon, BookOpenIcon } from '../Icons';
import { getAllUsers, getAllContent, getAllCommunityPostsForAdmin } from '../../services/api';
import Spinner from '../Spinner';

// FIX: Changed icon type from JSX.Element to React.ReactElement to fix namespace error.
// FIX: Specified the props type for the `icon` React.ReactElement to allow passing `className`.
const StatCard: React.FC<{icon: React.ReactElement<{ className?: string }>, title: string, value: string, color: string}> = ({icon, title, value, color}) => (
    <div className="bg-branco-nevoa dark:bg-verde-mata p-6 rounded-xl shadow-lg flex items-center space-x-4">
        <div className={`p-3 rounded-full ${color}`}>
            {React.cloneElement(icon, { className: 'w-7 h-7 text-white' })}
        </div>
        <div>
            <p className="font-sans text-sm text-marrom-seiva/80 dark:text-creme-velado/80">{title}</p>
            <p className="font-serif text-3xl font-bold text-verde-mata dark:text-dourado-suave">{value}</p>
        </div>
    </div>
);

export default function Insights() {
    const [stats, setStats] = useState({ users: 0, content: 0, posts: 0 });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            setIsLoading(true);
            try {
                const [users, content, posts] = await Promise.all([
                    getAllUsers(),
                    getAllContent(),
                    getAllCommunityPostsForAdmin()
                ]);

                // Exemplo de uma métrica de engajamento: posts na última semana
                const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                const recentPosts = posts.filter(p => new Date(p.createdAt) > oneWeekAgo).length;

                setStats({
                    users: users.length,
                    content: content.length,
                    posts: recentPosts
                });

            } catch (error) {
                console.error("Failed to fetch insights:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, []);


    if (isLoading) {
        return <div className="flex justify-center py-10"><Spinner /></div>
    }

    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard icon={<UsersIcon />} title="Total de Usuárias" value={stats.users.toString()} color="bg-blue-500" />
                <StatCard icon={<BookOpenIcon />} title="Conteúdos Publicados" value={stats.content.toString()} color="bg-green-500" />
                <StatCard icon={<ChartPieIcon />} title="Posts na Última Semana" value={stats.posts.toString()} color="bg-purple-500" />
            </div>
            <div className="mt-8 p-6 bg-branco-nevoa dark:bg-verde-mata rounded-xl shadow-lg">
                <h3 className="font-serif text-xl font-semibold text-verde-mata dark:text-dourado-suave mb-4">Gráfico de Atividade (Placeholder)</h3>
                <div className="h-64 bg-creme-velado dark:bg-verde-escuro-profundo rounded-lg flex items-center justify-center">
                    <p className="font-sans text-marrom-seiva/70 dark:text-creme-velado/70">Visualização de dados virá aqui.</p>
                </div>
            </div>
        </div>
    );
}