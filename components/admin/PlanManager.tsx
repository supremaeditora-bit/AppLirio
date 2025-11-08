import React, { useState, useEffect } from 'react';
import { ReadingPlan, User } from '../../types';
import { getReadingPlans, deleteReadingPlan } from '../../services/api';
import Spinner from '../Spinner';
import Button from '../Button';
import ConfirmationModal from '../ConfirmationModal';
import PlanForm from './PlanForm';
import { PencilIcon, TrashIcon, PlusIcon } from '../Icons';
import SearchAndFilter from '../SearchAndFilter';

interface PlanManagerProps {
  user: User;
}

const filterOptions = [{ value: 'all', label: 'Todos os Planos' }];

export default function PlanManager({ user }: PlanManagerProps) {
  const [plans, setPlans] = useState<ReadingPlan[]>([]);
  const [filteredPlans, setFilteredPlans] = useState<ReadingPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ReadingPlan | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const fetchPlans = async () => {
    setIsLoading(true);
    const planList = await getReadingPlans();
    setPlans(planList);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  useEffect(() => {
    let results = [...plans];
    
    if (searchQuery) {
        const lowercasedQuery = searchQuery.toLowerCase();
        results = results.filter(plan => 
            plan.title.toLowerCase().includes(lowercasedQuery)
        );
    }
    
    setFilteredPlans(results);
  }, [searchQuery, activeFilter, plans]);

  const handleOpenForm = (item: ReadingPlan | null) => {
    setSelectedItem(item);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setSelectedItem(null);
    setIsFormOpen(false);
    fetchPlans();
  };

  const handleOpenConfirm = (item: ReadingPlan) => {
    setSelectedItem(item);
    setIsConfirmOpen(true);
  };
  
  const handleDelete = async () => {
    if (selectedItem) {
      await deleteReadingPlan(selectedItem.id);
      setIsConfirmOpen(false);
      setSelectedItem(null);
      fetchPlans();
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-10"><Spinner /></div>;
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-serif text-2xl font-semibold text-verde-mata dark:text-dourado-suave">Gerenciar Planos de Leitura</h2>
        <Button onClick={() => handleOpenForm(null)} variant="primary">
          <PlusIcon className="w-5 h-5 mr-2" />
          Novo Plano
        </Button>
      </div>
      <SearchAndFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        filterOptions={filterOptions}
        searchPlaceholder="Buscar por título..."
      />
      <div className="bg-branco-nevoa dark:bg-verde-mata p-6 rounded-xl shadow-lg overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-marrom-seiva/20 dark:border-creme-velado/20">
              <th className="p-3 font-sans font-semibold text-marrom-seiva dark:text-creme-velado">Título</th>
              <th className="p-3 font-sans font-semibold text-marrom-seiva dark:text-creme-velado">Duração (dias)</th>
              <th className="p-3 font-sans font-semibold text-marrom-seiva dark:text-creme-velado">Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredPlans.map(item => (
              <tr key={item.id} className="border-b border-marrom-seiva/10 dark:border-creme-velado/10 last:border-b-0">
                <td className="p-3 font-sans font-medium text-verde-mata dark:text-creme-velado">{item.title}</td>
                <td className="p-3 font-sans text-sm text-marrom-seiva/80 dark:text-creme-velado/80">{item.durationDays}</td>
                <td className="p-3">
                  <div className="flex space-x-2">
                    <button onClick={() => handleOpenForm(item)} className="p-2 hover:text-dourado-suave"><PencilIcon className="w-5 h-5" /></button>
                    <button onClick={() => handleOpenConfirm(item)} className="p-2 hover:text-red-500"><TrashIcon className="w-5 h-5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <PlanForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        plan={selectedItem}
        user={user}
      />
      
      {selectedItem && (
        <ConfirmationModal
          isOpen={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={handleDelete}
          title="Confirmar Exclusão"
          message={`Tem certeza que deseja excluir o plano "${selectedItem.title}"?`}
          confirmText="Excluir"
        />
      )}
    </>
  );
}