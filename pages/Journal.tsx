import React, { useState, useEffect } from 'react';
import { User, JournalEntry, Page } from '../types';
import { getJournalEntries, createJournalEntry, updateJournalEntry, deleteJournalEntry, getContentItem } from '../services/api';
import Spinner from '../components/Spinner';
import Button from '../components/Button';
import { PlusIcon, TrashIcon, BookOpenIcon, ChevronLeftIcon } from '../components/Icons';
import ConfirmationModal from '../components/ConfirmationModal';

interface JournalProps {
  user: User;
  onNavigate: (page: Page, id?: string) => void;
}

export default function Journal({ user, onNavigate }: JournalProps) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | 'new' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [entryToDelete, setEntryToDelete] = useState<JournalEntry | null>(null);

  const fetchEntries = async () => {
    setIsLoading(true);
    const data = await getJournalEntries(user.id);
    setEntries(data);
    if (data.length > 0) {
        handleSelectEntry(data[0]);
    } else {
        handleNewEntry();
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchEntries();
  }, [user]);
  
  const handleSelectEntry = (entry: JournalEntry | null) => {
    if (entry) {
        setSelectedEntry(entry);
        setTitle(entry.title);
        setContent(entry.content);
    }
  };

  const handleNewEntry = () => {
    setSelectedEntry('new');
    setTitle('');
    setContent('');
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) return;
    setIsSaving(true);
    try {
        if (selectedEntry === 'new') {
            await createJournalEntry({ userId: user.id, title, content });
        } else if (selectedEntry) {
            await updateJournalEntry(selectedEntry.id, content, title);
        }
        await fetchEntries();
    } catch (e) {
        console.error("Failed to save entry", e);
    } finally {
        setIsSaving(false);
    }
  };
  
  const openDeleteConfirmation = (entry: JournalEntry) => {
    setEntryToDelete(entry);
  };
  
  const handleDelete = async () => {
    if (!entryToDelete) return;
    await deleteJournalEntry(entryToDelete.id);
    setEntryToDelete(null);
    if (selectedEntry !== 'new' && selectedEntry?.id === entryToDelete.id) {
        setSelectedEntry(null);
        setTitle('');
        setContent('');
    }
    await fetchEntries();
  };

  const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  return (
    <>
    <div className="flex h-full">
      {/* Sidebar de Entradas */}
      <div className="w-1/3 max-w-sm h-full bg-branco-nevoa dark:bg-verde-mata border-r border-marrom-seiva/10 dark:border-creme-velado/10 flex flex-col">
        <div className="p-4 border-b border-marrom-seiva/10 dark:border-creme-velado/10 flex justify-between items-center">
          <h2 className="font-serif text-xl font-bold text-verde-mata dark:text-dourado-suave">Meu Diário</h2>
          <Button onClick={handleNewEntry} variant="secondary" className="!p-2">
            <PlusIcon className="w-5 h-5" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center"><Spinner /></div>
          ) : (
            entries.map(entry => (
              <button 
                key={entry.id} 
                onClick={() => handleSelectEntry(entry)}
                className={`w-full text-left p-4 border-b border-marrom-seiva/10 dark:border-creme-velado/10 ${selectedEntry !== 'new' && selectedEntry?.id === entry.id ? 'bg-dourado-suave/10' : 'hover:bg-creme-velado dark:hover:bg-verde-escuro-profundo'}`}
              >
                <h3 className="font-serif font-semibold text-verde-mata dark:text-creme-velado truncate">{entry.title}</h3>
                <p className="text-sm text-marrom-seiva/70 dark:text-creme-velado/70 mt-1">{formatDate(entry.updatedAt)}</p>
                 {entry.relatedContentTitle && <p className="text-xs text-dourado-suave mt-1 flex items-center gap-1"><BookOpenIcon className="w-3 h-3"/> {entry.relatedContentTitle}</p>}
              </button>
            ))
          )}
        </div>
      </div>
      {/* Área de Edição */}
      <div className="flex-1 flex flex-col p-4 sm:p-8">
        {selectedEntry ? (
            <>
            <div className="flex justify-between items-center mb-4">
                <input 
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Título da sua anotação"
                    className="w-full font-serif text-3xl font-bold bg-transparent focus:outline-none focus:border-b border-dourado-suave text-verde-mata dark:text-dourado-suave"
                />
                {selectedEntry !== 'new' && (
                    <Button onClick={() => openDeleteConfirmation(selectedEntry)} variant="secondary" className="!p-2 ml-4">
                        <TrashIcon className="w-5 h-5 text-red-500"/>
                    </Button>
                )}
            </div>
             {selectedEntry !== 'new' && selectedEntry.relatedContentTitle && (
                <button onClick={() => onNavigate('contentDetail', selectedEntry.relatedContentId)} className="inline-flex items-center gap-1 text-sm font-semibold text-dourado-suave hover:underline mb-4">
                    <ChevronLeftIcon className="w-4 h-4"/> Ver conteúdo relacionado: {selectedEntry.relatedContentTitle}
                </button>
             )}
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Comece a escrever suas reflexões aqui..."
                className="flex-1 w-full p-4 font-sans text-lg leading-relaxed bg-branco-nevoa dark:bg-verde-mata rounded-lg focus:outline-none focus:ring-2 focus:ring-dourado-suave resize-none"
            />
            <div className="mt-4 flex justify-end">
                <Button onClick={handleSave} disabled={isSaving || !title.trim() || !content.trim()}>
                    {isSaving ? <Spinner variant="button" /> : 'Salvar Anotação'}
                </Button>
            </div>
            </>
        ) : (
            <div className="flex-1 flex items-center justify-center text-center">
                <p className="text-marrom-seiva/70 dark:text-creme-velado/70">
                    {entries.length > 0 ? 'Selecione uma anotação para visualizar ou editar.' : 'Crie sua primeira anotação no diário!'}
                </p>
            </div>
        )}
      </div>
    </div>
     {entryToDelete && (
        <ConfirmationModal
            isOpen={!!entryToDelete}
            onClose={() => setEntryToDelete(null)}
            onConfirm={handleDelete}
            title="Excluir Anotação"
            message={`Tem certeza que deseja excluir a anotação "${entryToDelete.title}"?`}
            confirmText="Excluir"
        />
     )}
    </>
  );
}