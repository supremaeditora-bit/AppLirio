import React, { useState, useEffect } from 'react';
import { User, JournalEntry, Page, PageHeaderConfig } from '../types';
import { getJournalEntries, createJournalEntry, updateJournalEntry, deleteJournalEntry, getAppearanceSettings } from '../services/api';
import Spinner from '../components/Spinner';
import Button from '../components/Button';
import { PlusIcon, TrashIcon, BookOpenIcon, SearchIcon, ChevronLeftIcon, CloseIcon, JournalIcon } from '../components/Icons';
import ConfirmationModal from '../components/ConfirmationModal';
import { processActivity } from '../services/gamificationService';

interface JournalProps {
  user: User;
  onNavigate: (page: Page, id?: string) => void;
  onUserUpdate: (updatedData: Partial<User>) => Promise<void>;
}

const formatRelativeDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    const entryDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    if (entryDate.getTime() === today.getTime()) return 'Hoje';
    if (entryDate.getTime() === yesterday.getTime()) return 'Ontem';
    
    if (now.getFullYear() === date.getFullYear()) {
        return date.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' });
    }
    return date.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric', year: 'numeric' });
};


export default function Journal({ user, onUserUpdate }: JournalProps) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'edit' | 'new'>('list');
  const [headerConfig, setHeaderConfig] = useState<PageHeaderConfig | undefined>(undefined);
  
  const [currentEntry, setCurrentEntry] = useState<JournalEntry | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  const [entryToDelete, setEntryToDelete] = useState<JournalEntry | null>(null);
  
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEntries = entries.filter(entry =>
    entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    entry.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const fetchEntries = async () => {
    setIsLoading(true);
    try {
      const [data, settings] = await Promise.all([
          getJournalEntries(user.id),
          getAppearanceSettings()
      ]);
      setEntries(data);
      if (settings.pageHeaders?.journal) {
          setHeaderConfig(settings.pageHeaders.journal);
      }
    } catch (error) {
      console.error("Failed to fetch journal entries:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if(user) {
        fetchEntries();
    }
  }, [user]);

  const handleNewEntryClick = () => {
    setCurrentEntry(null);
    setTitle('');
    setContent('');
    setViewMode('new');
  };

  const handleEditEntryClick = (entry: JournalEntry) => {
    setCurrentEntry(entry);
    setTitle(entry.title);
    setContent(entry.content);
    setViewMode('edit');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setCurrentEntry(null);
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) return;
    setIsSaving(true);
    try {
      if (viewMode === 'new') {
        await createJournalEntry({ userId: user.id, title, content });
        
        // Gamification
        const gamificationUpdate = processActivity(user, 'diario_preenchido');
        onUserUpdate(gamificationUpdate);
        
      } else if (viewMode === 'edit' && currentEntry) {
        await updateJournalEntry(currentEntry.id, content, title);
      }
      await fetchEntries();
      handleBackToList();
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
    try {
      await deleteJournalEntry(entryToDelete.id);
      setEntryToDelete(null);
      await fetchEntries();
      handleBackToList();
    } catch (error) {
      console.error("Failed to delete entry", error);
    }
  };

  if (isLoading && entries.length === 0) {
    return <div className="flex justify-center items-center h-full bg-creme-velado dark:bg-verde-escuro-profundo"><Spinner /></div>;
  }

  if (viewMode === 'edit' || viewMode === 'new') {
    return (
      <div className="flex flex-col h-full bg-branco-nevoa dark:bg-verde-escuro-profundo text-marrom-seiva dark:text-creme-velado animate-fade-in">
        <header className="flex items-center p-4 border-b border-marrom-seiva/10 dark:border-creme-velado/10 flex-shrink-0">
          <button onClick={handleBackToList} className="p-2 rounded-full hover:bg-marrom-seiva/10 dark:hover:bg-creme-velado/10">
            <ChevronLeftIcon className="w-6 h-6" />
          </button>
          <h1 className="font-serif text-xl font-bold text-verde-mata dark:text-dourado-suave mx-auto">
            {viewMode === 'new' ? 'Nova Anotação' : 'Editar Anotação'}
          </h1>
          <div className="w-10"></div>
        </header>
        <main className="flex-1 flex flex-col p-4 sm:p-6 overflow-y-auto">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título"
            className="w-full font-serif text-3xl font-bold bg-transparent focus:outline-none pb-2 text-verde-mata dark:text-dourado-suave placeholder:text-[#7A6C59] dark:placeholder:text-creme-velado/60"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Comece a escrever sua anotação..."
            className="flex-1 w-full pt-4 font-sans text-lg leading-relaxed bg-transparent focus:outline-none resize-none text-marrom-seiva dark:text-creme-velado placeholder:text-[#7A6C59] dark:placeholder:text-creme-velado/60"
          />
        </main>
        <footer className="p-4 border-t border-marrom-seiva/10 dark:border-creme-velado/10 flex items-center justify-between flex-shrink-0">
           <div>
            {viewMode === 'edit' && currentEntry && (
                <Button onClick={() => openDeleteConfirmation(currentEntry)} variant="secondary" className="!p-3 !bg-transparent hover:!bg-red-500/10">
                    <TrashIcon className="w-5 h-5 text-red-500"/>
                </Button>
            )}
           </div>
          <Button onClick={handleSave} disabled={isSaving || !title.trim() || !content.trim()}>
            {isSaving ? <Spinner variant="button" /> : 'Salvar'}
          </Button>
        </footer>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col h-full bg-creme-velado dark:bg-verde-escuro-profundo text-marrom-seiva dark:text-creme-velado relative animate-fade-in">
        {/* Hero Header for Journal */}
        <div className="relative h-[40vh] w-full flex-shrink-0">
            <img 
                src={headerConfig?.imageUrl || "https://images.unsplash.com/photo-1517842645767-c639042777db?q=80&w=1470&auto=format&fit=crop"}
                alt="Meu Diário" 
                className="w-full h-full object-cover" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#D9C7A6] from-20% via-[#D9C7A6]/80 via-60% to-transparent dark:from-[#152218] dark:from-20% dark:via-[#152218]/80 dark:via-60% transition-colors duration-500"></div>
            
            <div className="absolute bottom-0 left-0 w-full p-6 sm:p-12">
                <div className="container mx-auto">
                    <h1 className="font-serif text-4xl sm:text-6xl font-bold text-verde-mata dark:text-dourado-suave drop-shadow-sm">
                        {headerConfig?.title || "Meu Diário"}
                    </h1>
                    <p className="text-marrom-seiva/80 dark:text-creme-velado/90 mt-2 text-lg max-w-xl font-sans font-medium drop-shadow-md">
                        {headerConfig?.subtitle || "Seu jardim secreto de reflexões e gratidão."}
                    </p>
                </div>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
             <div className="mb-6 relative">
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-marrom-seiva/50 dark:text-creme-velado/50" />
                <input
                    type="text"
                    placeholder="Buscar anotações..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-branco-nevoa dark:bg-verde-mata rounded-full font-sans text-sm focus:outline-none focus:ring-2 focus:ring-dourado-suave border border-transparent placeholder:text-[#7A6C59] dark:placeholder:text-creme-velado/60"
                />
             </div>

            <div className="space-y-4">
                {isLoading && entries.length === 0 ? <Spinner /> : 
                filteredEntries.length > 0 ? (
                    filteredEntries.map(entry => (
                    <div
                        key={entry.id}
                        onClick={() => handleEditEntryClick(entry)}
                        className="bg-branco-nevoa dark:bg-verde-mata p-5 rounded-xl cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-sm"
                    >
                        <div className="flex justify-between items-start">
                        <h2 className="font-serif text-xl font-semibold text-verde-mata dark:text-creme-velado">{entry.title}</h2>
                        <span className="text-sm text-marrom-seiva/70 dark:text-creme-velado/70 font-sans flex-shrink-0 ml-4">{formatRelativeDate(entry.updatedAt)}</span>
                        </div>
                        <p className="font-sans text-marrom-seiva/80 dark:text-creme-velado/80 mt-2 line-clamp-2">{entry.content}</p>
                    </div>
                    ))
                ) : (
                    <div className="text-center pt-20">
                    <JournalIcon className="w-24 h-24 text-dourado-suave/30 mx-auto" />
                    <p className="mt-4 text-marrom-seiva/70 dark:text-creme-velado/70 max-w-xs mx-auto">
                        {searchQuery ? `Nenhuma anotação encontrada para "${searchQuery}".` : "Seu jardim secreto espera a primeira semente."}
                    </p>
                    </div>
                )}
            </div>
        </div>
        <button
          onClick={handleNewEntryClick}
          className="absolute bottom-6 right-6 bg-dourado-suave text-verde-mata rounded-full p-4 shadow-lg transition-transform hover:scale-110 active:scale-100 z-20"
          aria-label="Nova Anotação"
        >
          <PlusIcon className="w-8 h-8" />
        </button>
      </div>

      {entryToDelete && (
        <ConfirmationModal
            isOpen={!!entryToDelete}
            onClose={() => setEntryToDelete(null)}
            onConfirm={handleDelete}
            title="Excluir Anotação"
            message={`Tem certeza que deseja excluir a anotação "${entryToDelete.title}"? Esta ação é irreversível.`}
            confirmText="Excluir"
        />
     )}
    </>
  );
}