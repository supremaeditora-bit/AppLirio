import React, { useState, useEffect } from 'react';
import { User, Page, ReadingPlan, UserReadingPlanProgress, PageHeaderConfig } from '../types';
import { getReadingPlans, getAllUserReadingProgress, getAppearanceSettings } from '../services/api';
import Spinner from '../components/Spinner';
import PlanCard from '../components/PlanCard';
import Button from '../components/Button';
import { PlusIcon } from '../components/Icons';
import PlanForm from '../components/admin/PlanForm';
import SearchAndFilter from '../components/SearchAndFilter';

interface ReadingPlansProps {
  user: User | null;
  onNavigate: (page: Page, id?: string) => void;
}

const filterOptions = [
    { value: 'todos', label: 'Todos os Planos' },
];

export default function ReadingPlans({ user, onNavigate }: ReadingPlansProps) {
  const [plans, setPlans] = useState<ReadingPlan[]>([]);
  const [filteredPlans, setFilteredPlans] = useState<ReadingPlan[]>([]);
  const [progress, setProgress] = useState<UserReadingPlanProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [planToEdit, setPlanToEdit] = useState<ReadingPlan | null>(null);
  const [headerConfig, setHeaderConfig] = useState<PageHeaderConfig | undefined>(undefined);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('todos');

  const isAdmin = user && user.role === 'admin';

  const fetchPlans = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const [plansData, progressData, settings] = await Promise.all([
        getReadingPlans(),
        getAllUserReadingProgress(user.id),
        getAppearanceSettings()
      ]);
      setPlans(plansData);
      setProgress(progressData);
      if (settings.pageHeaders?.readingPlans) {
          setHeaderConfig(settings.pageHeaders.readingPlans);
      }
    } catch (error) {
      console.error("Failed to fetch reading plans data", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, [user]);

  useEffect(() => {
    let results = [...plans];
    
    if (searchQuery) {
        const lowercasedQuery = searchQuery.toLowerCase();
        results = results.filter(plan => 
            plan.title.toLowerCase().includes(lowercasedQuery) ||
            plan.description.toLowerCase().includes(lowercasedQuery)
        );
    }
    
    setFilteredPlans(results);
  }, [searchQuery, activeFilter, plans]);

  const handleFormClose = () => {
    setIsFormOpen(false);
    setPlanToEdit(null);
    fetchPlans();
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-full"><Spinner /></div>;
  }

  return (
    <>
      <div className="min-h-full bg-creme-velado dark:bg-verde-escuro-profundo">
         {/* Hero Header */}
        <div className="relative h-[40vh] sm:h-[50vh] w-full">
            <img 
                src={headerConfig?.imageUrl || "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=1473&auto=format&fit=crop"}
                alt="Planos de Leitura" 
                className="w-full h-full object-cover" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#D9C7A6] from-20% via-[#D9C7A6]/80 via-60% to-transparent dark:from-[#152218] dark:from-20% dark:via-[#152218]/80 dark:via-60% transition-colors duration-500"></div>
            
            {isAdmin && (
                <button 
                    onClick={() => { setPlanToEdit(null); setIsFormOpen(true); }}
                    className="absolute top-4 right-4 bg-white/90 dark:bg-verde-mata/90 p-3 rounded-full shadow-lg hover:scale-110 transition-transform z-20 text-verde-mata dark:text-dourado-suave flex items-center gap-2 font-semibold text-sm"
                >
                    <PlusIcon className="w-5 h-5" />
                    <span className="hidden sm:inline">Novo Plano</span>
                </button>
            )}

            <div className="absolute bottom-0 left-0 w-full p-6 sm:p-12">
                <div className="container mx-auto">
                    <h1 className="font-serif text-4xl sm:text-6xl font-bold text-verde-mata dark:text-dourado-suave drop-shadow-sm">
                        {headerConfig?.title || "Planos de Leitura"}
                    </h1>
                    <p className="text-marrom-seiva/80 dark:text-creme-velado/90 mt-2 text-lg max-w-xl font-sans font-medium drop-shadow-md">
                        {headerConfig?.subtitle || "Aprofunde-se nas Escrituras com roteiros guiados para fortalecer sua fé diariamente."}
                    </p>
                </div>
            </div>
        </div>

        <div className="container mx-auto p-4 sm:p-8">
            <SearchAndFilter
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
                filterOptions={filterOptions}
                searchPlaceholder="Buscar por planos..."
            />

            {filteredPlans.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPlans.map(plan => {
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
                Nenhum plano de leitura encontrado.
                </p>
            </div>
            )}
        </div>
      </div>
      {isAdmin && user && (
          <PlanForm
            isOpen={isFormOpen}
            onClose={handleFormClose}
            plan={planToEdit}
            user={user}
          />
      )}
    </>
  );
}