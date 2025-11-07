
import React from 'react';

interface DayStepperProps {
  totalDays: number;
  completedDays: number[];
  currentDay: number;
  onSelectDay: (day: number) => void;
}

const DayStepper: React.FC<DayStepperProps> = ({ totalDays, completedDays, currentDay, onSelectDay }) => {
  const days = Array.from({ length: totalDays }, (_, i) => i + 1);

  return (
    <div className="mt-8">
        <div className="flex items-center space-x-2 overflow-x-auto scrollbar-hide pb-2 -mx-4 sm:-mx-6 px-4 sm:px-6">
            {days.map(day => {
                const isCompleted = completedDays.includes(day);
                const isActive = day === currentDay;
                return (
                    <button
                        key={day}
                        onClick={() => onSelectDay(day)}
                        className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full font-bold text-sm transition-all duration-200 border-2
                            ${isActive 
                                ? 'bg-dourado-suave border-dourado-suave text-verde-mata scale-110' 
                                : isCompleted 
                                ? 'bg-green-600/30 border-green-600/50 text-green-800 dark:text-green-200'
                                : 'bg-marrom-seiva/10 border-transparent text-marrom-seiva/70 dark:bg-creme-velado/10 dark:text-creme-velado/70 hover:border-dourado-suave/50'
                            }
                        `}
                        aria-label={`Dia ${day}`}
                    >
                        {day}
                    </button>
                );
            })}
        </div>
    </div>
  );
};

export default DayStepper;