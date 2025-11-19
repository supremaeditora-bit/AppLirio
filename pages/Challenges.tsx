
import React, { useState, useEffect } from 'react';
import { Challenge, User, UserChallengeCompletion } from '../types';
import { getChallenges, getUserChallengeCompletions, completeChallenge } from '../services/api';
import Spinner from '../components/Spinner';
import Button from '../components/Button';
import { CheckCircleIcon } from '../components/Icons';

interface ChallengeCardProps {
  challenge: Challenge;
  isCompleted: boolean;
  onComplete: () => void;
  isLoading: boolean;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({ challenge, isCompleted, onComplete, isLoading }) => {
  return (
    <div className={`bg-branco-nevoa dark:bg-verde-mata p-6 rounded-2xl shadow-lg flex flex-col justify-between transition-all ${isCompleted ? 'opacity-60' : ''}`}>
      <div>
        <div className="flex justify-between items-start">
            <h2 className="font-serif text-xl font-bold text-verde-mata dark:text-dourado-suave">{challenge.title}</h2>
        </div>
        <p className="font-sans text-marrom-seiva/80 dark:text-creme-velado/80 mt-2 text-sm leading-relaxed">
            {challenge.description}
        </p>
      </div>
      <div className="mt-6">
        {isCompleted ? (
           <div className="flex items-center justify-center font-sans font-bold text-green-600 dark:text-green-400">
               <CheckCircleIcon className="w-5 h-5 mr-2" />
               Concluído
           </div>
        ) : (
            <Button onClick={onComplete} fullWidth disabled={isLoading}>
                {isLoading ? <Spinner variant="button" /> : 'Completar Desafio'}
            </Button>
        )}
      </div>
    </div>
  );
};

interface ChallengesProps {
  user: User | null;
  onUserUpdate: (updatedData: Partial<User>) => Promise<void>;
}

export default function Challenges({ user, onUserUpdate }: ChallengesProps) {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [completions, setCompletions] = useState<UserChallengeCompletion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [completingId, setCompletingId] = useState<string | null>(null);

  const fetchData = async () => {
    if (!user) return;
    setIsLoading(true);
    const [challengeData, completionData] = await Promise.all([
        getChallenges(),
        getUserChallengeCompletions(user.id),
    ]);
    setChallenges(challengeData);
    setCompletions(completionData);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleCompleteChallenge = async (challenge: Challenge) => {
    if (!user) return;
    setCompletingId(challenge.id);
    try {
        await completeChallenge(user.id, challenge.id);
        // Optimistic update
        setCompletions([...completions, { id: '', userId: user.id, challengeId: challenge.id, completedAt: new Date().toISOString() }]);
    } catch (error) {
        console.error("Failed to complete challenge", error);
    } finally {
        setCompletingId(null);
    }
  };

  // FIX: Explicitly type the initial value to ensure correct inference.
  const groupedChallenges = challenges.reduce((acc, challenge) => {
    const theme = challenge.theme || 'Desafios Gerais';
    if (!acc[theme]) {
      acc[theme] = [];
    }
    acc[theme].push(challenge);
    // Sort by sequenceOrder within each theme
    acc[theme].sort((a, b) => (a.sequenceOrder || 0) - (b.sequenceOrder || 0));
    return acc;
  }, {} as Record<string, Challenge[]>);


  if (isLoading) {
    return <div className="flex justify-center items-center h-full"><Spinner /></div>;
  }

  return (
    <div className="container mx-auto p-4 sm:p-8">
      <div className="text-center mb-12">
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-verde-mata dark:text-dourado-suave">Desafios de Fé</h1>
        <p className="font-sans text-lg text-marrom-seiva/80 dark:text-creme-velado/80 mt-2 max-w-2xl mx-auto">
            Participe dos desafios e cresça na sua jornada!
        </p>
      </div>

      <div className="space-y-12">
        {Object.entries(groupedChallenges).map(([theme, themeChallenges]: [string, Challenge[]]) => (
            <section key={theme}>
                <h2 className="font-serif text-3xl font-semibold mb-6 text-verde-mata dark:text-dourado-suave">{theme}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {themeChallenges.map(challenge => (
                        <ChallengeCard
                            key={challenge.id}
                            challenge={challenge}
                            isCompleted={completions.some(c => c.challengeId === challenge.id)}
                            onComplete={() => handleCompleteChallenge(challenge)}
                            isLoading={completingId === challenge.id}
                        />
                    ))}
                </div>
            </section>
        ))}
      </div>

       {challenges.length === 0 && !isLoading && (
          <div className="text-center p-8 bg-branco-nevoa dark:bg-verde-mata rounded-2xl">
              <p className="font-sans text-marrom-seiva/70 dark:text-creme-velado/70">Nenhum desafio disponível no momento. Volte em breve!</p>
          </div>
        )}
    </div>
  );
}
