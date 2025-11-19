
import React, { useState, useEffect } from 'react';
import { User, Page, ReadingPlan, UserReadingPlanProgress } from '../types';
import { getReadingPlanById, getUserReadingPlanProgressForPlan, updateUserReadingPlanProgress } from '../services/api';
import Spinner from '../components/Spinner';
import { ChevronLeftIcon, CheckCircleIcon, ChevronRightIcon } from '../components/Icons';
import Button from '../components/Button';
import DayStepper from '../components/DayStepper';

interface PlanDetailProps {
  id: string;
  user: User | null;
  onNavigate: (page: Page) => void;
}

const renderMarkdown = (text: string) => {
    // A simple markdown renderer for bold text and paragraphs
    return text
        .split('\n')
        .map(paragraph => paragraph.trim())
        .filter(paragraph => paragraph)
        .map((paragraph, index) => (
            <p key={index} className="mb-4" dangerouslySetInnerHTML={{ __html: paragraph.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
        ));
};

export default function PlanDetail({ id, user, onNavigate }: PlanDetailProps) {
  const [plan, setPlan] = useState<ReadingPlan | null>(null);
  const [progress, setProgress] = useState<UserReadingPlanProgress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDay, setCurrentDay] = useState(1);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchPlanData = async () => {
    if (!user) {
        setIsLoading(false);
        return;
    };
    setIsLoading(true);
    try {
        const [planData, progressData] = await Promise.all([
            getReadingPlanById(id),
            getUserReadingPlanProgressForPlan(user.id, id)
        ]);
        setPlan(planData || null);
        const initialProgress = progressData || { userId: user.id, planId: id, completedDays: [] };
        setProgress(initialProgress);

        // Set initial day to the first uncompleted day
        if (planData) {
            const firstUncompleted = planData.days.find(d => !initialProgress.completedDays.includes(d.day));
            setCurrentDay(firstUncompleted ? firstUncompleted.day : 1);
        }

    } catch (error) {
        console.error("Failed to fetch plan details", error);
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlanData();
  }, [id, user]);

  const handleCompleteDay = async () => {
      if (!user || !plan || !progress) return;
      
      const isAlreadyCompleted = progress.completedDays.includes(currentDay);
      if (isAlreadyCompleted) return;

      setIsUpdating(true);
      const newCompletedDays = [...progress.completedDays, currentDay].sort((a,b) => a-b);
      await updateUserReadingPlanProgress(user.id, plan.id, newCompletedDays);
      setProgress({ ...progress, completedDays: newCompletedDays });

      // Advance to the next uncompleted day
      const nextDay = plan.days.find(d => !newCompletedDays.includes(d.day));
      if (nextDay) {
          setCurrentDay(nextDay.day);
      }
      setIsUpdating(false);
  };
  
  if (isLoading) {
    return <div className="flex items-center justify-center h-full"><Spinner /></div>;
  }

  if (!plan) {
    return <div className="text-center p-8">Plano de leitura não encontrado.</div>;
  }
  
  const dayData = plan.days.find(d => d.day === currentDay);
  const isDayCompleted = progress?.completedDays.includes(currentDay) || false;

  return (
    <div className="relative">
       {/* Top Navigation Back Button (Overlay) */}
        <div className="absolute top-4 left-4 z-30">
             <button 
                onClick={() => onNavigate('readingPlans')} 
                className="p-2 bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full text-white transition-all"
            >
                <ChevronLeftIcon className="w-6 h-6" />
            </button>
        </div>
      
       <div 
            className="relative flex flex-col justify-end min-h-[50vh] sm:min-h-[60vh] w-full bg-cover bg-center" 
            style={{backgroundImage: `url('${plan.imageUrl}')`}}
        >
             {/* Gradiente adaptativo: Bege Dourado no Claro (#D9C7A6) e Verde Mata no Escuro (com !important) */}
             <div className="absolute inset-0 bg-gradient-to-t from-[#D9C7A6] via-[#D9C7A6]/80 to-transparent dark:!from-verde-mata dark:!via-verde-mata/80 transition-colors duration-500"></div>
             
             <div className="relative z-10 p-6 sm:p-8 md:p-12 w-full max-w-5xl mx-auto">
                <span className="font-sans font-semibold tracking-wider uppercase text-xs sm:text-sm text-marrom-seiva/80 dark:text-dourado-suave">Plano de Leitura</span>
                <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold mt-2 leading-tight text-verde-mata dark:text-creme-velado">
                    {plan.title}
                </h1>
                <p className="font-sans text-base leading-relaxed mt-4 text-marrom-seiva dark:text-creme-velado/90 max-w-2xl line-clamp-3 sm:line-clamp-none">
                    {plan.description}
                </p>
             </div>
        </div>

      <div className="container mx-auto p-4 sm:p-8">
        <div className="bg-branco-nevoa dark:bg-verde-mata p-6 sm:p-8 rounded-2xl shadow-lg -mt-8 relative z-10">
        
          <DayStepper
              totalDays={plan.durationDays}
              completedDays={progress?.completedDays || []}
              currentDay={currentDay}
              onSelectDay={setCurrentDay}
          />

          {dayData && (
              <div className="mt-8 pt-6 border-t border-marrom-seiva/10 dark:border-creme-velado/10">
                  <span className="font-sans font-bold uppercase text-sm text-dourado-suave">Dia {dayData.day}</span>
                  <h2 className="font-serif text-2xl font-semibold text-verde-mata dark:text-creme-velado mt-1">{dayData.title}</h2>
                  
                  <div className="mt-6 bg-creme-velado dark:bg-verde-escuro-profundo p-4 rounded-lg">
                      <h3 className="font-serif font-bold text-lg text-verde-mata dark:text-dourado-suave">{dayData.passage}</h3>
                  </div>

                  <div className="mt-6 font-sans text-marrom-seiva dark:text-creme-velado/90 leading-relaxed prose dark:prose-invert">
                      {renderMarkdown(dayData.content)}
                  </div>

                  <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                      <Button 
                          variant="secondary" 
                          onClick={() => setCurrentDay(d => Math.max(1, d - 1))}
                          disabled={currentDay === 1}
                          className="!px-4 !py-2"
                      >
                          <ChevronLeftIcon className="w-5 h-5" />
                          <span className="sm:hidden ml-2">Anterior</span>
                      </Button>
                      
                      <Button onClick={handleCompleteDay} disabled={isUpdating || isDayCompleted} className={isDayCompleted ? '!bg-green-600 !text-white' : ''}>
                          {isDayCompleted ? (
                              <>
                                  <CheckCircleIcon className="w-5 h-5 mr-2" />
                                  Concluído!
                              </>
                          ) : isUpdating ? (
                              <Spinner variant="button" />
                          ) : (
                            plan.days.every(d => progress?.completedDays.includes(d.day) || d.day === currentDay) 
                            ? 'Concluir Plano' 
                            : 'Concluir e Avançar'
                          )}
                      </Button>

                      <Button 
                          variant="secondary" 
                          onClick={() => setCurrentDay(d => Math.min(plan.durationDays, d + 1))}
                          disabled={currentDay === plan.durationDays}
                          className="!px-4 !py-2"
                      >
                          <span className="sm:hidden mr-2">Próximo</span>
                          <ChevronRightIcon className="w-5 h-5" />
                      </Button>
                  </div>
              </div>
          )}
        </div>
      </div>
    </div>
  );
}
