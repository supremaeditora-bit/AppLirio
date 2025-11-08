import React, { useState, useEffect } from 'react';
import { User, Page, ReadingPlan, UserReadingPlanProgress } from '../types';
import { getReadingPlans, getAllUserReadingProgress } from '../services/api';
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
      <div className="container mx-auto p-4 sm:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div className="text-center sm:text-left mb-4 sm:mb-0">
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-gradient">Planos de Leitura</h1>
            <p className="font-sans text-lg text-marrom-seiva/80 dark:text-creme-velado/80 mt-2 max-w-2xl mx-auto sm:mx-0">
              Escolha um plano de estudo para aprofundar seu conhecimento e fortalecer sua jornada de fé.
            </p>
          </div>
          <div className="flex items-center gap-4 mt-4 sm:mt-0 self-center sm:self-auto">
            {isAdmin && (
              <Button onClick={() => { setPlanToEdit(null); setIsFormOpen(true); }}>
                <PlusIcon className="w-5 h-5 mr-2" />
                Novo Plano
              </Button>
            )}
          </div>
        </div>

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