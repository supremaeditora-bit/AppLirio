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
            <div className="text-right flex-shrink-0 ml-4">
                <p className="font-bold text-lg text-dourado-suave">+{challenge.points}</p>
                <p className="text-xs text-marrom-seiva/70 dark:text-creme-velado/70">pontos</p>
            </div>
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
        await completeChallenge(user.id, challenge.id, challenge.points);
        // Optimistic update
        setCompletions([...completions, { id: '', userId: user.id, challengeId: challenge.id, completedAt: new Date().toISOString() }]);
        onUserUpdate({ points: user.points + challenge.points });
    } catch (error) {
        console.error("Failed to complete challenge", error);
    } finally {
        setCompletingId(null);
    }
  };

  // FIX: The original `reduce` was incorrectly typed, leading to `groupedChallenges`
  // having a type that caused a downstream error on `.map()`. This is fixed by
  // correctly typing the initial value of the accumulator. The sorting logic was also
  // moved outside the reduce loop for better performance.
  // FIX: Correctly typed the `reduce` operation for `groupedChallenges` by explicitly typing the variable. This ensures that the accumulator and the final result have the correct type, resolving downstream errors where `.sort()` and `.map()` were called on values inferred as `unknown`.
  const groupedChallenges: Record<string, Challenge[]> = challenges.reduce((acc, challenge) => {
    const theme = challenge.theme || 'Desafios Gerais';
    if (!acc[theme]) {
      acc[theme] = [];
    }
    acc[theme].push(challenge);
    return acc;
  }, {});

  // Sort challenges within each theme after grouping.
  Object.values(groupedChallenges).forEach(group => {
    group.sort((a, b) => (a.sequenceOrder || 0) - (b.sequenceOrder || 0));
  });


  if (isLoading) {
    return <div className="flex justify-center items-center h-full"><Spinner /></div>;
  }

  return (
    <div className="container mx-auto p-4 sm:p-8">
      <div className="text-center mb-12">
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-verde-mata dark:text-dourado-suave">Desafios de Fé</h1>
        <p className="font-sans text-lg text-marrom-seiva/80 dark:text-creme-velado/80 mt-2 max-w-2xl mx-auto">
            Participe dos desafios, cresça na sua jornada e ganhe pontos para avançar de nível!
        </p>
      </div>

      <div className="space-y-12">
        {Object.entries(groupedChallenges).map(([theme, themeChallenges]) => (
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