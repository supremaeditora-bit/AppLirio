
import React, { useState, useEffect } from 'react';
import { HeartIcon, SparklesIcon, SpeakerWaveIcon } from '../Icons';
import { getAllUsers, getAllContent, getAllCommunityPostsForAdmin } from '../../services/api';
import Spinner from '../Spinner';

const StatCard: React.FC<{icon: React.ElementType, title: string, value: string}> = ({icon: IconComponent, title, value}) => (
    <div className="bg-branco-nevoa dark:bg-verde-mata p-6 rounded-xl shadow-lg flex items-center space-x-4">
        <IconComponent className="w-8 h-8 text-verde-mata dark:text-dourado-suave flex-shrink-0" />
        <div>
            <p className="font-sans text-sm text-marrom-seiva/80 dark:text-creme-velado/80">{title}</p>
            <p className="font-serif text-3xl font-bold text-verde-mata dark:text-dourado-suave">{value}</p>
        </div>
    </div>
);

export default function Insights() {
    const [stats, setStats] = useState({ users: 0, content: 0, posts: 0 });
    const [chartData, setChartData] = useState<{ label: string; value: number }[]>([]);
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

                const oneWeekAgo = new Date();
                oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                const recentPosts = posts.filter(p => new Date(p.createdAt) > oneWeekAgo).length;

                setStats({
                    users: users.length,
                    content: content.length,
                    posts: recentPosts
                });
                
                // Process data for the chart
                const last7Days = Array.from({ length: 7 }).map((_, i) => {
                    const d = new Date();
                    d.setDate(d.getDate() - i);
                    return d;
                }).reverse();

                const postsPerDay = last7Days.map(day => {
                    const dayString = day.toISOString().split('T')[0];
                    const count = posts.filter(post => post.createdAt.startsWith(dayString)).length;
                    return {
                        label: day.toLocaleDateString('pt-BR', { weekday: 'short' }).slice(0, 3),
                        value: count,
                    };
                });
                setChartData(postsPerDay);

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
    
    const maxChartValue = Math.max(...chartData.map(d => d.value), 1);


    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard icon={HeartIcon} title="Total de Usuárias" value={stats.users.toString()} />
                <StatCard icon={SparklesIcon} title="Conteúdos Publicados" value={stats.content.toString()} />
                <StatCard icon={SpeakerWaveIcon} title="Posts na Última Semana" value={stats.posts.toString()} />
            </div>
            <div className="mt-8 p-6 bg-branco-nevoa dark:bg-verde-mata rounded-xl shadow-lg">
                <h3 className="font-serif text-xl font-semibold text-verde-mata dark:text-dourado-suave mb-4">Atividade de Posts (Últimos 7 dias)</h3>
                <div className="h-64 flex items-end justify-around gap-2 pt-4 border-t border-marrom-seiva/10 dark:border-creme-velado/10">
                   {chartData.map((day, index) => (
                       <div key={index} className="flex-1 flex flex-col items-center justify-end h-full group">
                           <div 
                                className="relative w-3/4 bg-dourado-suave/30 dark:bg-dourado-suave/20 rounded-t-lg transition-all duration-300 hover:bg-dourado-suave/50"
                                style={{ height: `${(day.value / maxChartValue) * 100}%` }}
                           >
                            <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-verde-mata dark:bg-verde-escuro-profundo text-white text-xs font-bold py-1 px-2 rounded-md">
                                {day.value}
                            </div>
                           </div>
                           <span className="mt-2 text-xs font-semibold text-marrom-seiva/70 dark:text-creme-velado/70 capitalize">{day.label}</span>
                       </div>
                   ))}
                </div>
            </div>
        </div>
    );
}
