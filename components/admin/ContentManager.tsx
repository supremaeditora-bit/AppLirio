import React, { useState, useEffect } from 'react';
import { ContentItem, User } from '../../types';
import { getAllContent, deleteContentItem } from '../../services/api';
import Spinner from '../Spinner';
import Button from '../Button';
import ConfirmationModal from '../ConfirmationModal';
import ContentForm from './ContentForm';
import { PencilIcon, TrashIcon, PlusIcon } from '../Icons';

interface ContentManagerProps {
  user: User;
}

export default function ContentManager({ user }: ContentManagerProps) {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);

  const fetchContent = async () => {
    setIsLoading(true);
    const contentList = await getAllContent();
    setContent(contentList);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const handleOpenForm = (item: ContentItem | null) => {
    setSelectedItem(item);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setSelectedItem(null);
    setIsFormOpen(false);
    fetchContent(); // Refresh list after add/edit
  };

  const handleOpenConfirm = (item: ContentItem) => {
    setSelectedItem(item);
    setIsConfirmOpen(true);
  };
  
  const handleDelete = async () => {
    if (selectedItem) {
      await deleteContentItem(selectedItem.id); // No longer need .toString()
      setIsConfirmOpen(false);
      setSelectedItem(null);
      fetchContent();
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-10"><Spinner /></div>;
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-serif text-2xl font-semibold text-verde-mata dark:text-dourado-suave">Gerenciar Conteúdo</h2>
        <Button onClick={() => handleOpenForm(null)} variant="primary">
          <PlusIcon className="w-5 h-5 mr-2" />
          Adicionar Conteúdo
        </Button>
      </div>
      <div className="bg-branco-nevoa dark:bg-verde-mata p-6 rounded-xl shadow-lg overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-marrom-seiva/20 dark:border-creme-velado/20">
              <th className="p-3 font-sans font-semibold text-marrom-seiva dark:text-creme-velado">Título</th>
              <th className="p-3 font-sans font-semibold text-marrom-seiva dark:text-creme-velado">Tipo</th>
              <th className="p-3 font-sans font-semibold text-marrom-seiva dark:text-creme-velado">Ações</th>
            </tr>
          </thead>
          <tbody>
            {content.map(item => (
              <tr key={item.id} className="border-b border-marrom-seiva/10 dark:border-creme-velado/10 last:border-b-0">
                <td className="p-3 font-sans font-medium text-verde-mata dark:text-creme-velado">{item.title}</td>
                <td className="p-3 font-sans text-sm text-marrom-seiva/80 dark:text-creme-velado/80">{item.type}</td>
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
      
      <ContentForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        item={selectedItem}
        user={user}
      />
      
      {selectedItem && (
        <ConfirmationModal
          isOpen={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={handleDelete}
          title="Confirmar Exclusão"
          message={`Tem certeza que deseja excluir o conteúdo "${selectedItem.title}"?`}
          confirmText="Excluir"
        />
      )}
    </>
  );
}