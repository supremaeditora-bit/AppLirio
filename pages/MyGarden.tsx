import React, { useState, useEffect } from 'react';
import { User, Achievement, Mission } from '../types';
import { getAchievements, getMissions } from '../services/api';
import Spinner from '../components/Spinner';
import ProgressBar from '../components/ProgressBar';
import { LEVELS, GARDEN_IMAGES } from '../services/gamificationConstants';
import { CheckCircleIcon } from '../components/Icons';

interface MyGardenProps {
  user: User;
}

const AchievementCard: React.FC<{ achievement: Achievement, isUnlocked: boolean }> = ({ achievement, isUnlocked }) => (
    <div className={`p-4 rounded-xl flex items-center gap-4 transition-all duration-300 ${isUnlocked ? 'bg-dourado-suave/10 shadow-lg shadow-dourado-suave/10' : 'bg-marrom-seiva/5 dark:bg-creme-velado/5 filter grayscale opacity-60'}`}>
        <div className={`w-14 h-14 rounded-full flex items-center justify-center text-3xl flex-shrink-0 ${isUnlocked ? 'bg-dourado-suave/20' : 'bg-marrom-seiva/10 dark:bg-creme-velado/10'}`}>
            {achievement.icon}
        </div>
        <div>
            <h3 className={`font-serif font-semibold ${isUnlocked ? 'text-dourado-suave' : 'text-marrom-seiva/80 dark:text-creme-velado/80'}`}>{achievement.title}</h3>
            <p className="text-sm font-sans text-marrom-seiva/70 dark:text-creme-velado/70">{achievement.description}</p>
        </div>
    </div>
);

export default function MyGarden({ user }: MyGardenProps) {
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [missions, setMissions] = useState<Mission[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const [achievementsData, missionsData] = await Promise.all([
                getAchievements(),
                getMissions()
            ]);
            setAchievements(achievementsData);
            setMissions(missionsData);
            setIsLoading(false);
        };
        fetchData();
    }, []);

    const userLevelInfo = LEVELS[user.level] || LEVELS['Árvore Frutífera'];
    const gardenImage = GARDEN_IMAGES[user.level] || GARDEN_IMAGES['Árvore Frutífera'];
    
    if (isLoading) {
        return <div className="flex justify-center items-center h-full"><Spinner /></div>;
    }

    return (
        <div className="container mx-auto p-4 sm:p-6 md:p-8 space-y-12">
            <header className="text-center">
                <h1 className="font-serif text-4xl sm:text-5xl font-bold text-verde-mata dark:text-dourado-suave">Meu Jardim da Alma</h1>
                <p className="font-sans text-lg text-marrom-seiva/80 dark:text-creme-velado/80 mt-2 max-w-2xl mx-auto">
                    Acompanhe seu crescimento espiritual e veja seu jardim florescer a cada passo da jornada.
                </p>
            </header>

            <section className="relative bg-branco-nevoa dark:bg-verde-mata rounded-2xl shadow-lg overflow-hidden min-h-[300px] flex flex-col justify-end text-white p-6 sm:p-8">
                <img src={gardenImage} alt={`Jardim no nível ${user.level}`} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-verde-escuro-profundo/80 via-verde-escuro-profundo/40 to-transparent"></div>
                <div className="relative z-10">
                    <p className="font-sans text-sm font-bold uppercase tracking-wider text-dourado-suave">Seu Nível Atual</p>
                    <h2 className="font-serif text-4xl sm:text-5xl font-bold text-white mt-1 drop-shadow-md">{user.level}</h2>
                    <div className="mt-4">
                        <div className="flex justify-between items-center font-sans text-sm font-semibold text-white/90">
                            <span>💧 {user.points} Gotas de Graça</span>
                            <span>Próximo Nível: {userLevelInfo.points} 💧</span>
                        </div>
                        <div className="mt-2">
                            <ProgressBar current={user.points} max={userLevelInfo.points} />
                        </div>
                    </div>
                    {user.level !== 'Árvore Frutífera' && 
                        <p className="text-sm font-sans mt-2 text-white/80">
                            Faltam {Math.max(0, userLevelInfo.points - user.points)} gotas para alcançar o nível "{userLevelInfo.nextLevel}"
                        </p>
                    }
                </div>
            </section>
            
            <section>
                <h2 className="font-serif text-3xl font-semibold mb-6 text-verde-mata dark:text-dourado-suave">Missões da Semana</h2>
                <div className="space-y-4">
                    {missions.map(mission => (
                        <div key={mission.id} className="bg-branco-nevoa dark:bg-verde-mata p-4 rounded-xl shadow flex justify-between items-center">
                            <div className="flex items-center gap-4">
                               <CheckCircleIcon className="w-6 h-6 text-dourado-suave/50" />
                               <p className="font-sans font-medium text-marrom-seiva dark:text-creme-velado">{mission.title}</p>
                            </div>
                            <span className="font-bold text-dourado-suave text-sm whitespace-nowrap bg-dourado-suave/10 py-1 px-3 rounded-full">+ {mission.points} 💧</span>
                        </div>
                    ))}
                </div>
            </section>

            <section>
                <h2 className="font-serif text-3xl font-semibold mb-6 text-verde-mata dark:text-dourado-suave">Flores Raras (Conquistas)</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {achievements.map(ach => (
                        <AchievementCard key={ach.id} achievement={ach} isUnlocked={user.achievements.includes(ach.id)} />
                    ))}
                </div>
            </section>
        </div>
    );
}