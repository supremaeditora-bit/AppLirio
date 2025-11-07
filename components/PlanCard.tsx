
import React from 'react';
import { ReadingPlan, UserReadingPlanProgress } from '../types';
import ProgressBar from './ProgressBar';
import { PlayCircleIcon } from './Icons';

interface PlanCardProps {
  plan: ReadingPlan;
  progress?: UserReadingPlanProgress;
  onClick: () => void;
}

const PlanCard: React.FC<PlanCardProps> = ({ plan, progress, onClick }) => {
  const completedDays = progress?.completedDays.length || 0;
  
  return (
    <div onClick={onClick} className="group cursor-pointer">
      <div className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-lg bg-creme-velado dark:bg-verde-mata">
        <img src={plan.imageUrl} alt={plan.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <PlayCircleIcon className="w-20 h-20 text-white/80" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <h3 className="font-serif text-xl font-bold">{plan.title}</h3>
        </div>
      </div>
      <div className="mt-3 px-1">
        <div className="flex justify-between items-center mb-2 font-sans text-sm font-semibold text-marrom-seiva/80 dark:text-creme-velado/80">
            <span>{plan.durationDays} dias</span>
            <span>{completedDays} / {plan.durationDays} concluídos</span>
        </div>
        <ProgressBar current={completedDays} max={plan.durationDays} />
      </div>
    </div>
  );
};

export default PlanCard;