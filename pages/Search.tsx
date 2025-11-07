
import React, { useState, useEffect } from 'react';
import { ContentItem, User } from '../types';
import { getAllContent } from '../services/api';
import Spinner from '../components/Spinner';
import { SearchIcon } from '../components/Icons';

interface SearchProps {
  onViewDetail: (id: string) => void;
  user: User | null;
}

const SearchResultCard: React.FC<{ item: ContentItem; onClick: () => void }> = ({ item, onClick }) => (
    <div
        onClick={onClick}
        className="flex items-center gap-4 p-4 bg-branco-nevoa dark:bg-verde-mata rounded-xl shadow-md cursor-pointer hover:bg-creme-velado dark:hover:bg-verde-escuro-profundo transition-colors"
    >
        <img src={item.imageUrl} alt={item.title} className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg flex-shrink-0" />
        <div className="flex-1">
            <p className="font-sans text-xs font-semibold uppercase text-marrom-seiva/70 dark:text-creme-velado/70">{item.type}</p>
            <h3 className="font-serif font-semibold text-lg leading-tight mt-1 text-verde-mata dark:text-creme-velado">{item.title}</h3>
            <p className="font-sans text-sm text-marrom-seiva/80 dark:text-creme-velado/80 mt-1 line-clamp-2">{item.description}</p>
        </div>
    </div>
);

export default function Search({ onViewDetail, user }: SearchProps) {
  const [query, setQuery] = useState('');
  const [allContent, setAllContent] = useState<ContentItem[]>([]);
  const [results, setResults] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Loading all content initially
  const [isSearching, setIsSearching] = useState(false); // For subsequent searches
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const content = await getAllContent();
        setAllContent(content);
      } catch (error) {
        console.error("Failed to fetch content for search", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchContent();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setIsSearching(true);
    setHasSearched(true);

    const lowerCaseQuery = query.toLowerCase();
    const filteredResults = allContent.filter(item => 
        item.title.toLowerCase().includes(lowerCaseQuery) ||
        item.subtitle.toLowerCase().includes(lowerCaseQuery) ||
        item.description.toLowerCase().includes(lowerCaseQuery) ||
        item.type.toLowerCase().includes(lowerCaseQuery)
    );

    setResults(filteredResults);
    setIsSearching(false);
  };

  return (
    <div className="container mx-auto p-4 sm:p-8">
      <h1 className="font-serif text-4xl font-bold text-verde-mata dark:text-dourado-suave mb-4">Pesquisar</h1>
      
      <form onSubmit={handleSearch} className="relative mb-8">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-marrom-seiva/50 dark:text-creme-velado/50"/>
          <input 
              type="text" 
              placeholder="Pesquisar por devocionais, estudos e mais..." 
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full pl-14 pr-6 py-4 bg-branco-nevoa dark:bg-verde-mata rounded-full font-sans text-lg focus:outline-none focus:ring-2 focus:ring-dourado-suave"
              autoFocus
          />
      </form>
      
      {isLoading ? (
        <div className="flex justify-center py-10"><Spinner /></div>
      ) : isSearching ? (
        <div className="flex justify-center py-10"><Spinner /></div>
      ) : !hasSearched ? (
        <div className="text-center p-8 bg-branco-nevoa dark:bg-verde-mata rounded-2xl">
            <p className="font-sans text-marrom-seiva/70 dark:text-creme-velado/70">
                Use a barra de pesquisa para encontrar conteúdos.
            </p>
        </div>
      ) : results.length > 0 ? (
        <div>
          <h2 className="font-serif text-2xl font-semibold mb-6 text-verde-mata dark:text-dourado-suave">
            Resultados para "{query}"
          </h2>
          <div className="space-y-4">
            {results.map(item => (
              <SearchResultCard key={item.id} item={item} onClick={() => onViewDetail(item.id)} />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center p-8 bg-branco-nevoa dark:bg-verde-mata rounded-2xl">
            <p className="font-sans text-marrom-seiva/70 dark:text-creme-velado/70">
                Nenhum resultado encontrado para "{query}". Tente outras palavras.
            </p>
        </div>
      )}
    </div>
  );
}
