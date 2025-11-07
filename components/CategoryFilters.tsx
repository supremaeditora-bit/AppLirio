import React, { useState } from 'react';
import { Category } from '../types';

interface CategoryFiltersProps {
  categories: Category[];
}

export default function CategoryFilters({ categories }: CategoryFiltersProps) {
  const [activeCategory, setActiveCategory] = useState(categories[0]?.name || '');

  return (
    <div className="flex items-center space-x-2 overflow-x-auto scrollbar-hide pb-2 -mx-4 sm:-mx-8 md:-mx-12 px-4 sm:px-8 md:px-12">
      {categories.map(category => (
        <button
          key={category.name}
          onClick={() => setActiveCategory(category.name)}
          className={`flex-shrink-0 font-sans font-semibold py-2 px-5 rounded-full text-base transition-colors duration-200 ${
            activeCategory === category.name
              ? 'bg-verde-mata text-creme-velado dark:bg-dourado-suave dark:text-verde-mata'
              : 'bg-marrom-seiva/10 text-marrom-seiva dark:bg-creme-velado/10 dark:text-creme-velado/80 hover:bg-marrom-seiva/20 dark:hover:bg-creme-velado/20'
          }`}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}
