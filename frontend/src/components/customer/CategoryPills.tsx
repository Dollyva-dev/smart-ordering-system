import { RefObject } from 'react';

interface CategoryPillsProps {
  categories: string[];
  activeCategory: string;
  selectCategory: (categoryName: string) => void;
  categoriesRef: RefObject<HTMLDivElement | null>;
}

export function CategoryPills({ categories, activeCategory, selectCategory, categoriesRef }: CategoryPillsProps) {
  return (
    <div 
      ref={categoriesRef}
      className="bg-[#FAF9F5]/95 backdrop-blur-md border-y border-[#E0E6DF] sticky top-[73px] z-10 flex gap-2.5 overflow-x-auto whitespace-nowrap py-3 px-5 scrollbar-none shrink-0 w-full"
    >
      {categories.map((category) => {
        const isSelected = activeCategory === category;
        return (
          <button
            key={category}
            id={`pill-${category}`}
            onClick={() => selectCategory(category)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
              isSelected
                ? 'bg-[#2E6F40] text-white shadow-sm shadow-[#2E6F40]/20 scale-105 border border-[#2E6F40]'
                : 'bg-white text-[#6B7A68] hover:text-[#2E6F40] border border-[#E0E6DF]'
            }`}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
}
