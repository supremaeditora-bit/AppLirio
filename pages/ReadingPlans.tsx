
import React, { useState, useEffect } from 'react';
import { User, Page, ReadingPlan, UserReadingPlanProgress } from '../types';
import { getReadingPlans, getAllUserReadingProgress } from '../services/api';
import Spinner from '../components/Spinner';
import PlanCard from '../components/PlanCard';

interface ReadingPlansProps {
  user: User | null;
  onNavigate: (page: Page, id?: string) => void;
}

export default function ReadingPlans({ user, onNavigate }: ReadingPlansProps) {
  const [plans, setPlans] = useState<ReadingPlan[]>([]);
  const [progress, setProgress] = useState<UserReadingPlanProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const [plansData, progressData] = await Promise.all([
          getReadingPlans(),
          getAllUserReadingProgress(user.id),
        ]);
        setPlans(plansData);
        setProgress(progressData);
      } catch (error) {
        console.error("Failed to fetch reading plans data", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-full"><Spinner /></div>;
  }

  return (
    <div className="container mx-auto p-4 sm:p-8">
      <div className="text-center mb-12">
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-verde-mata dark:text-dourado-suave">Planos de Leitura</h1>
        <p className="font-sans text-lg text-marrom-seiva/80 dark:text-creme-velado/80 mt-2 max-w-2xl mx-auto">
          Escolha um plano de estudo para aprofundar seu conhecimento e fortalecer sua jornada de fé.
        </p>
      </div>

      {plans.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {plans.map(plan => {
            const planProgress = progress.find(p => p.planId === plan.id);
            return (
              <PlanCard
                key={plan.id}
                plan={plan}
                progress={planProgress}
                onClick={() => onNavigate('planDetail', plan.id)}
              />
            );
          })}
        </div>
      ) : (
        <div className="text-center p-8 bg-branco-nevoa dark:bg-verde-mata rounded-2xl">
          <p className="font-sans text-marrom-seiva/70 dark:text-creme-velado/70">
            Nenhum plano de leitura disponível no momento. Volte em breve!
          </p>
        </div>
      )}
    </div>
  );
}