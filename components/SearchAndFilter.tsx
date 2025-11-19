import React from 'react';
import { SearchIcon } from './Icons';

interface SearchAndFilterProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  activeFilter: string;
  onFilterChange: (value: string) => void;
  filterOptions: { value: string; label: string }[];
  searchPlaceholder: string;
}

export default function SearchAndFilter({
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
  filterOptions,
  searchPlaceholder
}: SearchAndFilterProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 w-full mb-8">
      <div className="relative flex-1">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-marrom-seiva/50 dark:text-creme-velado/50" />
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-branco-nevoa dark:bg-verde-mata rounded-full font-sans text-sm focus:outline-none focus:ring-2 focus:ring-dourado-suave border border-transparent placeholder:text-[#7A6C59] dark:placeholder:text-creme-velado/60"
        />
      </div>
      <div className="flex-shrink-0">
        <select
          value={activeFilter}
          onChange={(e) => onFilterChange(e.target.value)}
          className="w-full sm:w-auto px-4 py-3 bg-branco-nevoa dark:bg-verde-mata rounded-full font-sans text-sm font-semibold text-marrom-seiva dark:text-creme-velado focus:outline-none focus:ring-2 focus:ring-dourado-suave border border-transparent appearance-none"
        >
          {filterOptions.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}