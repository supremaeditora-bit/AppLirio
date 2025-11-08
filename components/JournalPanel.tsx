import React, { useState, useEffect } from 'react';
import { User, JournalEntry } from '../types';
import { getJournalEntries, createJournalEntry, updateJournalEntry, deleteJournalEntry } from '../services/api';
import Spinner from './Spinner';
import Button from './Button';
import { PlusIcon, TrashIcon, BookOpenIcon, ChevronLeftIcon, CloseIcon, SearchIcon } from './Icons';
import ConfirmationModal from './ConfirmationModal';

interface JournalPanelProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  relatedContent: {
    id: string;
    title: string;
  };
  onUserUpdate: (updatedData: Partial<User>) => Promise<void>;
}

export default function JournalPanel({ isOpen, onClose, user, relatedContent, onUserUpdate }: JournalPanelProps) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | 'new' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [entryToDelete, setEntryToDelete] = useState<JournalEntry | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const fetchEntries = async () => {
    setIsLoading(true);
    const data = await getJournalEntries(user.id);
    setEntries(data);
    setIsLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      fetchEntries();
      // Reset view to list when opening
      setSelectedEntry(null);
      setSearchQuery('');
    }
  }, [isOpen, user]);

  const handleSelectEntry = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setTitle(entry.title);
    setContent(entry.content);
  };

  const handleNewEntry = () => {
    setSelectedEntry('new');
    // Pre-fill with related content title
    setTitle(relatedContent.title);
    setContent('');
  };
  
  const handleBackToList = () => {
      setSelectedEntry(null);
      setTitle('');
      setContent('');
  }

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) return;
    setIsSaving(true);
    try {
        if (selectedEntry === 'new') {
            const { newEntry, updatedUser } = await createJournalEntry({ 
                userId: user.id, 
                title, 
                content,
                relatedContentId: relatedContent.id,
                relatedContentTitle: relatedContent.title,
            });
            if(updatedUser) onUserUpdate(updatedUser);
            setSelectedEntry(newEntry);
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
    handleBackToList();
    await fetchEntries();
  };

  const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' });
  }
  
  const filteredEntries = entries.filter(entry =>
    entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (entry.relatedContentTitle && entry.relatedContentTitle.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (!isOpen) return null;

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/60 z-40 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={onClose}
      ></div>
      <div className={`fixed top-0 right-0 h-full w-full max-w-md bg-branco-nevoa dark:bg-verde-mata shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}>
        {/* Header */}
        <div className="p-4 border-b border-marrom-seiva/10 dark:border-creme-velado/10 flex justify-between items-center flex-shrink-0">
          <div className="flex items-center">
            {selectedEntry && (
                <button onClick={handleBackToList} className="p-2 mr-2 rounded-full hover:bg-marrom-seiva/5 dark:hover:bg-creme-velado/5">
                    <ChevronLeftIcon className="w-5 h-5" />
                </button>
            )}
            <h2 className="font-serif text-xl font-bold text-verde-mata dark:text-dourado-suave">
              {selectedEntry ? 'Anotação' : 'Meu Diário'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-marrom-seiva/5 dark:hover:bg-creme-velado/5">
              <CloseIcon className="w-5 h-5"/>
          </button>
        </div>

        {/* Content */}
        {selectedEntry ? (
            // Editor View
            <div className="flex-1 flex flex-col p-4 overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <input 
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Título da sua anotação"
                        className="w-full font-serif text-2xl font-bold bg-transparent focus:outline-none text-verde-mata dark:text-dourado-suave"
                    />
                    {selectedEntry !== 'new' && (
                        <Button onClick={() => openDeleteConfirmation(selectedEntry)} variant="secondary" className="!p-2 ml-4">
                            <TrashIcon className="w-5 h-5 text-red-500"/>
                        </Button>
                    )}
                </div>
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Comece a escrever suas reflexões aqui..."
                    className="flex-1 w-full p-2 font-sans text-base leading-relaxed bg-transparent focus:outline-none resize-none"
                    autoFocus
                />
                <div className="mt-4 flex justify-end">
                    <Button onClick={handleSave} disabled={isSaving || !title.trim() || !content.trim()}>
                        {isSaving ? <Spinner variant="button" /> : 'Salvar'}
                    </Button>
                </div>
            </div>
        ) : (
            // List View
            <div className="flex-1 flex flex-col">
                <div className="p-4 space-y-4">
                     <Button onClick={handleNewEntry} variant="primary" fullWidth>
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Nova Anotação sobre "{relatedContent.title}"
                    </Button>
                     <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-marrom-seiva/50 dark:text-creme-velado/50"/>
                        <input
                            type="text"
                            placeholder="Buscar anotações..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-creme-velado dark:bg-verde-escuro-profundo rounded-full font-sans text-sm focus:outline-none focus:ring-2 focus:ring-dourado-suave border border-marrom-seiva/10 dark:border-creme-velado/10"
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                    <div className="p-4 text-center"><Spinner /></div>
                ) : (
                    filteredEntries.map(entry => {
                    const isRelated = entry.relatedContentId === relatedContent.id;
                    return (
                        <button 
                        key={entry.id} 
                        onClick={() => handleSelectEntry(entry)}
                        className={`w-full text-left p-4 border-b border-marrom-seiva/10 dark:border-creme-velado/10 ${isRelated ? 'bg-dourado-suave/10' : 'hover:bg-creme-velado dark:hover:bg-verde-escuro-profundo'}`}
                        >
                        <h3 className="font-serif font-semibold text-verde-mata dark:text-creme-velado truncate">{entry.title}</h3>
                        <p className="text-sm text-marrom-seiva/70 dark:text-creme-velado/70 mt-1">{formatDate(entry.updatedAt)}</p>
                        {entry.relatedContentTitle && <p className="text-xs text-dourado-suave mt-1 flex items-center gap-1"><BookOpenIcon className="w-3 h-3"/> {entry.relatedContentTitle}</p>}
                        </button>
                    )
                    })
                )}
                 {filteredEntries.length === 0 && !isLoading && (
                     <p className="text-center p-8 text-marrom-seiva/70 dark:text-creme-velado/70">
                        {entries.length === 0 ? 'Nenhuma anotação encontrada.' : 'Nenhum resultado para sua busca.'}
                    </p>
                 )}
                </div>
            </div>
        )}
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