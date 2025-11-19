
import React from 'react';
import { User } from '../types';
import { LEVELS, ACHIEVEMENTS } from '../services/gamificationService';
import ProgressBar from '../components/ProgressBar';
import { SparklesIcon, LockClosedIcon } from '@heroicons/react/24/outline';

interface MyGardenProps {
    user: User;
}

const MyGarden: React.FC<MyGardenProps> = ({ user }) => {
    const nextLevel = LEVELS.find(l => l.nivel === (user.gardenLevel || 0) + 1);
    const currentLevel = LEVELS.find(l => l.nivel === (user.gardenLevel || 0)) || LEVELS[0];
    const progressToNext = nextLevel ? nextLevel.xp - currentLevel.xp : 1;
    const currentProgress = nextLevel ? (user.experience || 0) - currentLevel.xp : 1;
    
    return (
        <div className="container mx-auto p-4 sm:p-8 min-h-full">
            <div className="text-center mb-10">
                <h1 className="font-serif text-4xl font-bold text-verde-mata dark:text-dourado-suave flex items-center justify-center gap-3">
                    <SparklesIcon className="w-8 h-8 text-dourado-suave" />
                    Meu Jardim Secreto
                </h1>
                <p className="font-sans text-marrom-seiva/80 dark:text-creme-velado/80 mt-2 max-w-xl mx-auto">
                    "O orvalho desce sobre Sião todos os dias." Aqui você acompanha o florescer da sua jornada espiritual.
                </p>
            </div>

            {/* Status Card */}
            <div className="bg-branco-nevoa dark:bg-verde-mata p-8 rounded-2xl shadow-lg mb-12 transform transition-all hover:scale-[1.01]">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex-1 text-center md:text-left">
                        <p className="text-sm font-bold uppercase tracking-widest text-marrom-seiva/50 dark:text-creme-velado/50 mb-1">Fase Atual</p>
                        <h2 className="font-serif text-4xl font-bold text-verde-mata dark:text-dourado-suave mb-2">{user.gardenLevelName || "Semente Plantada"}</h2>
                        <p className="text-marrom-seiva/70 dark:text-creme-velado/70 font-sans text-sm">
                            Total de Experiência: <span className="font-bold">{user.experience || 0} XP</span>
                        </p>
                    </div>
                    
                    <div className="w-full md:w-1/2">
                        <div className="flex justify-between text-xs font-bold text-marrom-seiva/60 dark:text-creme-velado/60 mb-2">
                            <span>Nível {currentLevel.nivel}</span>
                            <span>{nextLevel ? `Próximo: ${nextLevel.nome}` : 'Nível Máximo'}</span>
                        </div>
                        <ProgressBar current={nextLevel ? currentProgress : 100} max={nextLevel ? progressToNext : 100} />
                    </div>

                    <div className="text-center bg-creme-velado dark:bg-verde-escuro-profundo p-4 rounded-xl min-w-[120px]">
                        <span className="block text-3xl mb-1">💧</span>
                        <p className="font-bold text-2xl text-verde-mata dark:text-dourado-suave">{user.currentStreak || 0}</p>
                        <p className="text-xs font-bold uppercase text-marrom-seiva/50 dark:text-creme-velado/50">Dias Seguidos</p>
                    </div>
                </div>
            </div>

            {/* Achievements Grid */}
            <h3 className="font-serif text-2xl font-bold text-verde-mata dark:text-dourado-suave mb-6 border-b border-marrom-seiva/10 dark:border-creme-velado/10 pb-2">
                Sementes Plantadas (Conquistas)
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {ACHIEVEMENTS.map(ach => {
                    const isUnlocked = user.unlockedAchievementIds?.includes(ach.id);
                    
                    return (
                        <div key={ach.id} className={`relative p-6 rounded-xl border-2 transition-all duration-300 ${isUnlocked ? 'bg-branco-nevoa dark:bg-verde-mata border-dourado-suave shadow-md' : 'bg-gray-100 dark:bg-white/5 border-transparent opacity-70'}`}>
                            <div className="flex items-start gap-4">
                                <div className={`text-4xl p-3 rounded-full ${isUnlocked ? 'bg-dourado-suave/20' : 'bg-gray-200 dark:bg-white/10 grayscale'}`}>
                                    {isUnlocked ? ach.icone : <LockClosedIcon className="w-8 h-8 p-1 text-gray-400" />}
                                </div>
                                <div>
                                    <h4 className={`font-serif font-bold text-lg ${isUnlocked ? 'text-verde-mata dark:text-creme-velado' : 'text-gray-500 dark:text-gray-400'}`}>
                                        {ach.nome}
                                    </h4>
                                    <p className="font-sans text-sm mt-1 text-marrom-seiva/80 dark:text-creme-velado/70 leading-tight">
                                        {ach.desc}
                                    </p>
                                </div>
                            </div>
                            {isUnlocked && (
                                <div className="mt-4 pt-3 border-t border-marrom-seiva/10 dark:border-creme-velado/10">
                                    <p className="font-serif italic text-xs text-dourado-suave">"{ach.verso}"</p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default MyGarden;
