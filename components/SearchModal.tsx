
import React, { useState, useEffect, useRef } from 'react';
import { ContentItem, User } from '../types';
import { getAllContent } from '../services/api';
import Spinner from './Spinner';
import { SearchIcon, CloseIcon } from './Icons';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewDetail: (id: string) => void;
  user: User | null;
}

const SearchResultCard: React.FC<{ item: ContentItem; onClick: () => void }> = ({ item, onClick }) => (
    <div
        onClick={onClick}
        className="flex items-center gap-4 p-3 bg-branco-nevoa dark:bg-verde-mata rounded-xl shadow-md cursor-pointer hover:bg-creme-velado dark:hover:bg-verde-escuro-profundo transition-colors"
    >
        <img src={item.imageUrl} alt={item.title} className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg flex-shrink-0" />
        <div className="flex-1 overflow-hidden">
            <p className="font-sans text-xs font-semibold uppercase text-marrom-seiva/70 dark:text-creme-velado/70">{item.type}</p>
            <h3 className="font-serif font-semibold text-lg leading-tight mt-1 text-verde-mata dark:text-creme-velado truncate">{item.title}</h3>
            <p className="font-sans text-sm text-marrom-seiva/80 dark:text-creme-velado/80 mt-1 line-clamp-2">{item.description}</p>
        </div>
    </div>
);

export default function SearchModal({ isOpen, onClose, onViewDetail, user }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [allContent, setAllContent] = useState<ContentItem[]>([]);
  const [results, setResults] = useState<ContentItem[]>([]);
  const [isLoadingContent, setIsLoadingContent] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Fetch content only once when modal is first opened
      if (allContent.length === 0) {
        setIsLoadingContent(true);
        getAllContent()
          .then(content => {
            setAllContent(content);
            setIsLoadingContent(false);
          })
          .catch(error => {
            console.error("Failed to fetch content for search", error);
            setIsLoadingContent(false);
          });
      }
      // Reset state and focus input when opened
      setQuery('');
      setResults([]);
      document.body.style.overflow = 'hidden'; // Prevent background scroll
      setTimeout(() => inputRef.current?.focus(), 100); // Focus after transition
    } else {
      document.body.style.overflow = ''; // Restore scroll
    }
    
    // Cleanup function
    return () => {
        document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
          if (event.key === 'Escape') {
              onClose();
          }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  useEffect(() => {
    if (query.trim() === '') {
      setResults([]);
      setIsSearching(false);
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      return;
    }

    setIsSearching(true);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    searchTimeoutRef.current = window.setTimeout(() => {
      const lowerCaseQuery = query.toLowerCase();
      const filteredResults = allContent.filter(item =>
        item.title.toLowerCase().includes(lowerCaseQuery) ||
        item.subtitle.toLowerCase().includes(lowerCaseQuery) ||
        item.description.toLowerCase().includes(lowerCaseQuery) ||
        item.type.toLowerCase().includes(lowerCaseQuery)
      );
      setResults(filteredResults);
      setIsSearching(false);
    }, 300); // 300ms debounce
  }, [query, allContent]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex justify-center items-start p-4 sm:p-6 md:p-10 transition-opacity duration-300"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-2xl bg-creme-velado dark:bg-verde-escuro-profundo rounded-2xl shadow-2xl flex flex-col overflow-hidden transform transition-all duration-300"
        onClick={e => e.stopPropagation()}
        style={{ maxHeight: '85vh' }}
      >
        <header className="flex items-center justify-between p-4 border-b border-marrom-seiva/10 dark:border-creme-velado/10 flex-shrink-0">
            <form className="relative flex-1" onSubmit={e => e.preventDefault()}>
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-marrom-seiva/50 dark:text-creme-velado/50"/>
              <input
                  ref={inputRef}
                  type="text"
                  placeholder="Pesquisar por devocionais, estudos..."
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-2 bg-transparent border-none font-sans text-lg focus:outline-none focus:ring-0 text-marrom-seiva dark:text-creme-velado placeholder:text-[#7A6C59] dark:placeholder:text-creme-velado/60"
              />
            </form>
            <button
                onClick={onClose}
                className="p-2 ml-2 rounded-full text-marrom-seiva dark:text-creme-velado hover:bg-marrom-seiva/10 dark:hover:bg-creme-velado/10"
                aria-label="Fechar pesquisa"
            >
                <CloseIcon className="w-6 h-6" />
            </button>
        </header>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {isLoadingContent ? (
            <div className="flex justify-center py-10"><Spinner /></div>
          ) : isSearching ? (
             <div className="flex justify-center py-10"><Spinner /></div>
          ) : query.trim() === '' ? (
            <div className="text-center p-8">
                <p className="font-sans text-marrom-seiva/70 dark:text-creme-velado/70">
                    Comece a digitar para encontrar conteúdos.
                </p>
            </div>
          ) : results.length > 0 ? (
            results.map(item => (
              <SearchResultCard key={item.id} item={item} onClick={() => onViewDetail(item.id)} />
            ))
          ) : (
            <div className="text-center p-8">
                <p className="font-sans text-marrom-seiva/70 dark:text-creme-velado/70">
                    Nenhum resultado encontrado para "{query}".
                </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
