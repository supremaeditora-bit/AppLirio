
import React from 'react';
import { ChartPieIcon, UsersIcon, BookOpenIcon } from '../Icons';

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
    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard icon={<UsersIcon />} title="Usuárias Ativas" value="1,248" color="bg-blue-500" />
                <StatCard icon={<BookOpenIcon />} title="Conteúdos Publicados" value="152" color="bg-green-500" />
                <StatCard icon={<ChartPieIcon />} title="Engajamento Semanal" value="78%" color="bg-purple-500" />
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