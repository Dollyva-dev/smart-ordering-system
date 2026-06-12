import { MenuItem, CustomizationGroup, CustomizationOption, SelectedCustomizationOption } from '@/types/restaurant';

interface CustomizationModalProps {
  activeCustomizationItem: MenuItem;
  setActiveCustomizationItem: (item: MenuItem | null) => void;
  selectedOptions: { [groupName: string]: SelectedCustomizationOption[] };
  handleOptionToggle: (group: CustomizationGroup, option: CustomizationOption) => void;
  isAddDisabled: () => boolean;
  handleConfirmAdd: () => void;
  getCustomizationPrice: () => number;
}

export function CustomizationModal({
  activeCustomizationItem,
  setActiveCustomizationItem,
  selectedOptions,
  handleOptionToggle,
  isAddDisabled,
  handleConfirmAdd,
  getCustomizationPrice,
}: CustomizationModalProps) {
  return (
    <div className="absolute inset-0 bg-[#1A2F1C]/45 backdrop-blur-sm flex items-end justify-center z-50 transition-all duration-300">
      <div className="bg-white w-full rounded-t-3xl p-6 max-h-[80%] flex flex-col shadow-2xl border-t border-[#E0E6DF] animate-slide-up">
        
        {/* Modal Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-sm.5 font-black text-[#1A2F1C]">{activeCustomizationItem.name}</h3>
            <p className="text-[11px] text-[#6B7A68] mt-0.5 leading-relaxed font-semibold">{activeCustomizationItem.description}</p>
          </div>
          <button 
            onClick={() => setActiveCustomizationItem(null)} 
            className="w-7 h-7 flex items-center justify-center bg-[#FAF9F5] hover:bg-[#E8F5E9] border border-[#E0E6DF] text-[#6B7A68] hover:text-[#2E6F40] rounded-full text-xs font-bold transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {activeCustomizationItem.imageUrl && (
          <img 
            src={activeCustomizationItem.imageUrl} 
            alt={activeCustomizationItem.name} 
            className="w-full h-28 object-cover rounded-2xl border border-[#E0E6DF] mb-4 flex-shrink-0" 
          />
        )}

        {/* Scrollable Customizations Group */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 py-1 scrollbar-thin">
          {(activeCustomizationItem.customizationGroups || []).map(group => {
            const selections = selectedOptions[group.name] || [];
            return (
              <div key={group.name} className="bg-[#FAF9F5] border border-[#E0E6DF] rounded-2xl p-4">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs font-black uppercase tracking-wider text-[#1A2F1C]">{group.name}</span>
                  {group.required ? (
                    <span className="text-[8.5px] font-extrabold text-[#D32F2F] bg-red-50 border border-red-100 px-2 py-0.5 rounded uppercase">Required</span>
                  ) : (
                    <span className="text-[8.5px] font-bold text-[#6B7A68] bg-[#FAF9F5] border border-[#E0E6DF] px-2 py-0.5 rounded uppercase">Optional</span>
                  )}
                </div>
                <p className="text-[10px] text-[#6B7A68] font-semibold mb-3">
                  {group.maxSelect === 1 ? 'Select 1 option' : `Select up to ${group.maxSelect} options`}
                </p>
                
                <div className="space-y-2">
                  {group.options.map(option => {
                    const isChecked = selections.some(o => o.optionName === option.name);
                    return (
                      <label 
                        key={option.name} 
                        onClick={() => handleOptionToggle(group, option)}
                        className={`flex justify-between items-center py-2.5 px-3.5 border rounded-xl cursor-pointer text-xs transition-colors font-semibold ${
                          isChecked 
                            ? 'border-[#2E6F40] bg-[#E8F5E9]/50 text-[#2E6F40]' 
                            : 'border-[#E0E6DF] bg-white text-[#6B7A68] hover:border-[#C8E6C9]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <input 
                            type={group.maxSelect === 1 ? "radio" : "checkbox"} 
                            name={group.name} 
                            checked={isChecked}
                            onChange={() => {}} // Handle dynamically in label onClick
                            className="accent-[#2E6F40] border-zinc-300 w-4 h-4 cursor-pointer"
                          />
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

        {/* Add Button Action */}
        <div className="pt-4 border-t border-[#E0E6DF] mt-4 flex flex-col gap-2">
          <button 
            onClick={handleConfirmAdd}
            disabled={isAddDisabled()}
            className="w-full bg-[#2E6F40] hover:bg-[#1D4A2A] disabled:bg-zinc-350 text-white text-xs.5 font-bold py-3.5 rounded-2xl transition-all shadow-md shadow-[#2E6F40]/25 cursor-pointer disabled:cursor-not-allowed text-center uppercase tracking-wide"
          >
            Confirm Addition — ${(activeCustomizationItem.price + getCustomizationPrice()).toFixed(2)}
          </button>
        </div>
      </div>
    </div>
  );
}
