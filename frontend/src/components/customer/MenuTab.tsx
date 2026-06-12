import { useState, useEffect, useRef } from 'react';
import { MenuItem } from '@/types/restaurant';
import { Icons } from './Icons';
import { MenuItemCard } from './MenuItemCard';
import { CategoryPills } from './CategoryPills';

interface MenuTabProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeCategory: string;
  displayItems: MenuItem[];
  featuredItems: MenuItem[];
  getCartItemQuantity: (itemId: string) => number;
  getSingleCartItem: (itemId: string) => { cartId: string; quantity: number } | null;
  handleAddClick: (item: MenuItem) => void;
  handleOpenProduct: (item: MenuItem) => void;
  updateQuantity: (cartId: string, quantity: number) => void;
  removeItem: (cartId: string) => void;
  
  categories: string[];
  selectCategory: (cat: string) => void;
  categoriesRef: React.RefObject<HTMLDivElement | null>;
  
  sortBy: string;
  setSortBy: (val: string) => void;
  priceRange: string;
  setPriceRange: (val: string) => void;
  dietaryFilter: string[];
  setDietaryFilter: (val: string[]) => void;
}

export function MenuTab({
  searchQuery,
  setSearchQuery,
  activeCategory,
  displayItems,
  featuredItems,
  getCartItemQuantity,
  getSingleCartItem,
  handleAddClick,
  handleOpenProduct,
  updateQuantity,
  removeItem,
  
  categories,
  selectCategory,
  categoriesRef,
  
  sortBy,
  setSortBy,
  priceRange,
  setPriceRange,
  dietaryFilter,
  setDietaryFilter
}: MenuTabProps) {
  
  const sortedFeatured = [...featuredItems].sort((a, b) => 
    (a.featuredPosition || 99) - (b.featuredPosition || 99)
  );

  const [activeSlide, setActiveSlide] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const scrollToIndex = (index: number) => {
    if (sliderRef.current) {
      sliderRef.current.scrollTo({
        left: index * sliderRef.current.offsetWidth,
        behavior: 'smooth'
      });
    }
  };

  // Auto-advance slider
  useEffect(() => {
    if (sortedFeatured.length <= 1 || searchQuery) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => {
        const next = (prev + 1) % sortedFeatured.length;
        scrollToIndex(next);
        return next;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [sortedFeatured.length, searchQuery]);

  const handleScroll = () => {
    if (!sliderRef.current) return;
    const scrollLeft = sliderRef.current.scrollLeft;
    const width = sliderRef.current.offsetWidth;
    // Prevent division by zero
    if (width === 0) return;
    
    const newIndex = Math.round(scrollLeft / width);
    if (newIndex !== activeSlide && newIndex >= 0 && newIndex < sortedFeatured.length) {
      setActiveSlide(newIndex);
    }
  };
  
  const toggleDietaryFilter = (diet: string) => {
    if (dietaryFilter.includes(diet)) {
      setDietaryFilter(dietaryFilter.filter(d => d !== diet));
    } else {
      setDietaryFilter([...dietaryFilter, diet]);
    }
  };

  const clearFilters = () => {
    setSortBy('Recommended');
    setPriceRange('All');
    setDietaryFilter([]);
    setIsFilterModalOpen(false);
  };
  
  const handleAddWithDiscount = (item: MenuItem) => {
    const discount = item.discountPercent || 0;
    const finalPrice = discount > 0 ? item.price * (1 - discount / 100) : item.price;
    handleAddClick({ ...item, price: finalPrice });
  };

  return (
    <div className="pb-5">
      
      {/* Search Bar & Filter Button - Sticky Header */}
      <div className="bg-[#FAF9F5] md:bg-zinc-100 z-20 px-5 pt-5 pb-3 sticky top-0 md:static">
        <div className="flex gap-2.5">
          <div className="flex-1 bg-white border border-[#E0E6DF] rounded-2xl px-4 py-3 flex items-center gap-2.5 shadow-sm transition-all focus-within:border-[#2E6F40] focus-within:ring-1 focus-within:ring-[#2E6F40]/20">
            <span className="text-[#6B7A68]"><Icons.Search /></span>
            <input 
              type="text" 
              placeholder="Search dishes, drinks, desserts..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs text-[#1A2F1C] focus:outline-none placeholder-[#8A9B86] font-medium"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-[#8A9B86] font-bold text-xs">✕</button>
            )}
          </div>
          <button 
            onClick={() => setIsFilterModalOpen(true)}
            className="bg-white border border-[#E0E6DF] rounded-2xl px-3.5 flex items-center justify-center text-[#2E6F40] shadow-sm hover:bg-[#F2F6F3] transition-colors relative"
          >
            <Icons.Filter />
            {(priceRange !== 'All' || dietaryFilter.length > 0 || sortBy !== 'Recommended') && (
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-[#D32F2F] rounded-full"></span>
            )}
          </button>
        </div>
      </div>

      <div className="px-5">
        {/* Featured Ads Slider */}
        {!searchQuery && sortedFeatured.length > 0 && (
          <div className="mb-6 relative">
            <div 
              ref={sliderRef}
              onScroll={handleScroll}
              className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none rounded-3xl shadow-md bg-zinc-200"
            >
              {sortedFeatured.map((item) => {
                const discount = item.discountPercent || 0;
                const finalPrice = discount > 0 ? item.price * (1 - discount / 100) : item.price;
                return (
                  <div 
                    key={item._id} 
                    className="min-w-full flex-[0_0_100%] snap-center relative aspect-[16/9]"
                  >
                    {/* Background Image */}
                    <div 
                      className="absolute inset-0 cursor-pointer"
                      onClick={() => handleOpenProduct(item)}
                    >
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-[#2E6F40]" />
                      )}
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10" />
                    </div>
                    
                    {/* Content */}
                    <div className="absolute inset-0 p-5 flex flex-col justify-end text-white pointer-events-none">
                      {item.featuredBadge && (
                        <span className="bg-amber-500 text-white font-black text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-full w-max mb-2 shadow-sm border border-amber-400 pointer-events-auto">
                          {item.featuredBadge}
                        </span>
                      )}
                      <div className="flex justify-between items-end gap-2 pointer-events-auto">
                        <div className="flex-1 cursor-pointer" onClick={() => handleOpenProduct(item)}>
                          <h2 className="text-xl font-extrabold leading-tight shadow-sm drop-shadow-md">{item.name}</h2>
                          <p className="text-white/90 text-xs mt-1 font-medium line-clamp-1 drop-shadow-sm">{item.description}</p>
                        </div>
                        <button 
                          onClick={() => handleAddWithDiscount(item)}
                          className="bg-white text-[#2E6F40] text-sm font-black px-4 py-2 rounded-xl shadow-lg shrink-0 hover:scale-105 transition-transform"
                        >
                          + ${finalPrice.toFixed(2)}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Dots Indicator */}
            {sortedFeatured.length > 1 && (
              <div className="flex justify-center gap-1.5 mt-3">
                {sortedFeatured.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setActiveSlide(idx);
                      scrollToIndex(idx);
                    }}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      idx === activeSlide ? 'w-4 bg-[#2E6F40]' : 'w-1.5 bg-[#C8E6C9]'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Category Filters (Now rendered here!) */}
        {categories.length > 0 && !searchQuery && (
          <div className="mb-6 -mx-5">
            <CategoryPills 
              categories={['All', ...categories]}
              activeCategory={activeCategory}
              selectCategory={selectCategory}
              categoriesRef={categoriesRef as any}
            />
          </div>
        )}

        {/* Search Header / Active Category Header */}
        <div className="mb-4 flex justify-between items-center">
          <h3 className="text-xs font-black text-[#6B7A68] uppercase tracking-widest">
            {searchQuery ? `Search Results (${displayItems.length})` : activeCategory === 'All' ? 'Menu Items' : activeCategory}
          </h3>
          {!searchQuery && (
            <span className="bg-white text-[10px] text-[#6B7A68] px-2 py-0.5 rounded-md border border-[#E0E6DF] font-bold">
              {displayItems.length} {displayItems.length === 1 ? 'item' : 'items'}
            </span>
          )}
        </div>

        {/* Product Card Grid */}
        {displayItems.length === 0 ? (
          <div className="py-12 text-center bg-white border border-[#E0E6DF] rounded-2xl">
            <p className="text-[#6B7A68] text-xs font-semibold">No dishes found matching your criteria.</p>
            {(searchQuery || priceRange !== 'All' || dietaryFilter.length > 0) && (
              <button 
                onClick={() => {
                  setSearchQuery('');
                  clearFilters();
                }}
                className="mt-2 text-xs font-bold text-[#2E6F40] underline"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3.5">
            {displayItems.map((item) => (
              <MenuItemCard 
                key={item._id}
                item={item}
                qtyInCart={getCartItemQuantity(item._id)}
                singleCartItem={getSingleCartItem(item._id)}
                handleAddClick={handleAddClick}
                handleOpenProduct={handleOpenProduct}
                updateQuantity={updateQuantity}
                removeItem={removeItem}
              />
            ))}
          </div>
        )}
      </div>

      {/* Filter Bottom Sheet Modal */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsFilterModalOpen(false)}></div>
          <div className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-full duration-300">
            <div className="p-5 border-b border-[#E0E6DF] flex justify-between items-center bg-[#FAF9F5] rounded-t-3xl sm:rounded-t-3xl">
              <h2 className="text-lg font-black text-[#1A2F1C]">Filters & Sorting</h2>
              <button onClick={() => setIsFilterModalOpen(false)} className="w-8 h-8 flex items-center justify-center bg-white rounded-full text-[#6B7A68] shadow-sm font-bold">
                ✕
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto space-y-6">
              
              {/* Sort Options */}
              <div>
                <h3 className="text-xs font-black text-[#6B7A68] uppercase tracking-widest mb-3">Sort By</h3>
                <div className="flex flex-col gap-2">
                  {['Recommended', 'Popular', 'Price: Low to High', 'Price: High to Low'].map(sort => (
                    <label key={sort} className="flex items-center justify-between p-3 rounded-xl border border-[#E0E6DF] cursor-pointer hover:bg-[#F2F6F3] transition-colors">
                      <span className="text-sm font-semibold text-[#1A2F1C]">{sort}</span>
                      <div className="relative flex items-center justify-center w-5 h-5 rounded-full border border-[#2E6F40]">
                        {sortBy === sort && <div className="w-3 h-3 bg-[#2E6F40] rounded-full"></div>}
                      </div>
                      <input type="radio" className="hidden" checked={sortBy === sort} onChange={() => setSortBy(sort)} />
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="text-xs font-black text-[#6B7A68] uppercase tracking-widest mb-3">Price Range</h3>
                <div className="grid grid-cols-4 gap-2">
                  {['All', 'Under $10', '$10 - $20', 'Over $20'].map(range => (
                    <button
                      key={range}
                      onClick={() => setPriceRange(range)}
                      className={`py-2 px-1 text-xs font-bold rounded-xl transition-colors border text-center ${
                        priceRange === range 
                          ? 'bg-[#2E6F40] text-white border-[#2E6F40]' 
                          : 'bg-white text-[#6B7A68] border-[#E0E6DF] hover:border-[#2E6F40]/50'
                      }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dietary Preferences */}
              <div>
                <h3 className="text-xs font-black text-[#6B7A68] uppercase tracking-widest mb-3">Dietary</h3>
                <div className="flex flex-wrap gap-2">
                  {['Vegetarian', 'Vegan', 'Gluten-Free', 'Pescatarian'].map(diet => (
                    <button
                      key={diet}
                      onClick={() => toggleDietaryFilter(diet)}
                      className={`py-2 px-4 text-xs font-bold rounded-xl transition-colors border flex items-center gap-1.5 ${
                        dietaryFilter.includes(diet)
                          ? 'bg-[#E8F5E9] text-[#2E6F40] border-[#2E6F40]' 
                          : 'bg-white text-[#6B7A68] border-[#E0E6DF] hover:border-[#2E6F40]/50'
                      }`}
                    >
                      {dietaryFilter.includes(diet) && <Icons.Check />}
                      {diet}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-[#E0E6DF] bg-white flex gap-3 rounded-b-3xl">
              <button 
                onClick={clearFilters}
                className="flex-1 py-3.5 rounded-xl text-[#1A2F1C] font-bold text-sm bg-zinc-100 hover:bg-zinc-200 transition-colors"
              >
                Clear All
              </button>
              <button 
                onClick={() => setIsFilterModalOpen(false)}
                className="flex-[2] py-3.5 rounded-xl text-white font-black text-sm bg-[#2E6F40] hover:bg-[#1D4A2A] transition-colors shadow-md"
              >
                Show Results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
