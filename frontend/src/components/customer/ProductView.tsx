import { MenuItem, CustomizationGroup, CustomizationOption, SelectedCustomizationOption } from '@/types/restaurant';

interface ProductViewProps {
  item: MenuItem;
  onClose: () => void;
  selectedOptions: { [groupName: string]: SelectedCustomizationOption[] };
  handleOptionToggle: (group: CustomizationGroup, option: CustomizationOption) => void;
  isAddDisabled: () => boolean;
  handleConfirmAdd: () => void;
  getCustomizationPrice: () => number;
}

export function ProductView({
  item,
  onClose,
  selectedOptions,
  handleOptionToggle,
  isAddDisabled,
  handleConfirmAdd,
  getCustomizationPrice,
}: ProductViewProps) {
  
  const discount = item.discountPercent || 0;
  const basePrice = discount > 0 ? item.price * (1 - discount / 100) : item.price;
  const total = basePrice + getCustomizationPrice();

  const isVegetarian = item.dietaryPreferences?.includes('Vegetarian');
  const isVegan = item.dietaryPreferences?.includes('Vegan');
  const isGF = item.dietaryPreferences?.includes('Gluten-Free');

  return (
    <div className="fixed inset-x-0 top-0 bottom-16 z-[45] bg-white flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.1)] animate-in slide-in-from-bottom-8 fade-in duration-300 overflow-hidden md:bottom-0 md:rounded-b-2xl">
      
      {/* Hero Image Section */}
      <div className="relative w-full h-[35vh] flex-shrink-0 bg-zinc-100">
        {item.imageUrl ? (
          <img 
            src={item.imageUrl} 
            alt={item.name} 
            className="w-full h-full object-cover" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#2E6F40]/10 text-[#2E6F40] font-bold">
            No Image
          </div>
        )}
        
        {/* Close Button - Floating */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center bg-white/90 backdrop-blur-sm text-[#1A2F1C] hover:bg-white rounded-full shadow-lg transition-transform active:scale-95 z-10"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        {/* Gradient Overlay for Text Readability */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />
      </div>

      {/* Product Details & Scrollable Customizations */}
      <div className="flex-1 overflow-y-auto px-5 pb-24 scrollbar-none bg-white -mt-6 rounded-t-2xl relative z-10">
        
        <div className="pt-6 pb-5 border-b border-[#E0E6DF]">
          <div className="flex justify-between items-start gap-4">
            <h1 className="text-2xl font-black text-[#1A2F1C] leading-tight">{item.name}</h1>
            <div className="text-right shrink-0 flex flex-col items-end">
              <span className="text-xl font-black text-[#2E6F40]">${basePrice.toFixed(2)}</span>
              {discount > 0 && (
                <span className="text-sm font-bold text-[#8A9B86] line-through">${item.price.toFixed(2)}</span>
              )}
            </div>
          </div>
          
          <p className="text-sm text-[#6B7A68] font-medium leading-relaxed mt-2">{item.description}</p>
          
          {/* Dietary Badges */}
          {(isVegetarian || isVegan || isGF) && (
            <div className="flex gap-2 mt-3">
              {(isVegetarian || isVegan) && (
                <span className="inline-flex items-center gap-1 bg-[#E8F5E9] text-[#2E6F40] text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md border border-[#C8E6C9]">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66l.95-2.3c.48.17.96.3 1.34.3c3.02 0 6-2.58 6-7.5c0-2.31-.69-4.32-2-5.74V4h-1.5c-1.85 0-4.04.43-5.5 1.5c-1.46 1.07-2.5 2.76-2.5 5.5v1.5h1.5v-1.5c0-1.84.71-3.08 1.68-3.79c.97-.71 2.5-1.07 4-1.16C9 7.72 11 11.5 11 15c0 3.73-2.07 5.5-4 5.5c-.32 0-.67-.09-1-.21c1.55-4.14 3.32-8.52 9-10.29H17z"/></svg>
                  {isVegan ? 'Vegan' : 'Vegetarian'}
                </span>
              )}
              {isGF && (
                <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md border border-amber-200">
                  GF
                </span>
              )}
            </div>
          )}
        </div>

        {/* Customization Options */}
        <div className="py-5 space-y-6">
          {(item.customizationGroups || []).map(group => {
            const selections = selectedOptions[group.name] || [];
            return (
              <div key={group.name} className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both" style={{animationDelay: '100ms'}}>
                <div className="flex justify-between items-center mb-1">
                  <h3 className="text-sm font-black uppercase tracking-wider text-[#1A2F1C]">{group.name}</h3>
                  {group.required ? (
                    <span className="text-[9px] font-extrabold text-[#D32F2F] bg-red-50 border border-red-100 px-2 py-0.5 rounded uppercase tracking-wide">Required</span>
                  ) : (
                    <span className="text-[9px] font-bold text-[#6B7A68] bg-[#FAF9F5] border border-[#E0E6DF] px-2 py-0.5 rounded uppercase tracking-wide">Optional</span>
                  )}
                </div>
                <p className="text-[11px] text-[#6B7A68] font-semibold mb-3">
                  {group.maxSelect === 1 ? 'Select 1 option' : `Select up to ${group.maxSelect} options`}
                </p>
                
                <div className="space-y-2.5">
                  {group.options.map(option => {
                    const isChecked = selections.some(o => o.optionName === option.name);
                    return (
                      <label 
                        key={option.name} 
                        onClick={() => handleOptionToggle(group, option)}
                        className={`flex justify-between items-center p-3.5 border-2 rounded-xl cursor-pointer text-sm transition-all duration-200 font-bold shadow-sm ${
                          isChecked 
                            ? 'border-[#2E6F40] bg-[#F2F8F3] text-[#2E6F40]' 
                            : 'border-[#E0E6DF] bg-white text-[#6B7A68] hover:border-[#C8E6C9]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`flex items-center justify-center w-5 h-5 rounded-full border-2 transition-colors ${
                            isChecked ? 'border-[#2E6F40] bg-[#2E6F40]' : 'border-zinc-300 bg-transparent'
                          }`}>
                            {isChecked && (
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                            )}
                          </div>
                          <span className={isChecked ? 'text-[#2E6F40]' : 'text-[#1A2F1C]'}>{option.name}</span>
                        </div>
                        {option.price > 0 && (
                          <span className={isChecked ? 'text-[#2E6F40] font-black' : 'text-[#6B7A68]'}>
                            +${option.price.toFixed(2)}
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fixed Bottom Action Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-[#E0E6DF] p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-[0_-10px_20px_rgba(0,0,0,0.05)] z-20">
        <button
          disabled={isAddDisabled()}
          onClick={() => {
            handleConfirmAdd();
            onClose();
          }}
          className={`w-full py-4 rounded-xl text-base font-black uppercase tracking-wider flex justify-between items-center px-6 transition-all shadow-md active:scale-[0.98] ${
            isAddDisabled() 
              ? 'bg-zinc-200 text-zinc-400 border border-zinc-200 cursor-not-allowed shadow-none' 
              : 'bg-[#2E6F40] text-white border border-[#1D4A2A] hover:bg-[#1D4A2A] hover:shadow-lg'
          }`}
        >
          <span>Add to Tray</span>
          <span>${total.toFixed(2)}</span>
        </button>
      </div>

    </div>
  );
}
