import { Promotion, MenuItem } from '@/types/restaurant';
import { X, Tag, Info, ListChecks, DollarSign } from 'lucide-react';
import { useEffect, useState } from 'react';

interface PromoViewProps {
  promo: Promotion;
  onClose: () => void;
  menuItems: MenuItem[];
}

export function PromoView({ promo, onClose, menuItems }: PromoViewProps) {
  const [animationClass, setAnimationClass] = useState('translate-y-full');

  useEffect(() => {
    // trigger slide-up
    requestAnimationFrame(() => setAnimationClass('translate-y-0'));
  }, []);

  const handleClose = () => {
    setAnimationClass('translate-y-full');
    setTimeout(onClose, 300);
  };

  const requiredItems = menuItems.filter(i => promo.requiredItemIds?.includes(i._id));
  const applicableItems = menuItems.filter(i => promo.applicableItemIds?.includes(i._id));

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-40 transition-opacity duration-300"
        onClick={handleClose}
      />
      <div className={`fixed inset-x-0 bottom-0 z-50 max-w-md mx-auto bg-[#FAF9F5] rounded-t-3xl overflow-hidden shadow-[0_-10px_40px_rgba(0,0,0,0.15)] flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${animationClass}`} style={{ maxHeight: '92vh' }}>
        
        {/* Header Image */}
        <div className="relative h-48 sm:h-56 shrink-0 bg-zinc-200">
          {promo.imageUrl ? (
            <img src={promo.imageUrl} alt={promo.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#2E6F40]">
              <Tag size={48} className="text-white/30" />
            </div>
          )}
          
          <button 
            onClick={handleClose}
            className="absolute top-4 right-4 w-9 h-9 bg-black/50 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors z-10"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
          
          <div className="absolute inset-0 bg-gradient-to-t from-[#FAF9F5] via-[#FAF9F5]/30 to-transparent" />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin px-5 pb-8 relative -mt-6">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#E0E6DF] mb-5 relative">
            <div className="absolute -top-4 right-4 bg-amber-500 text-white font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-full shadow-sm border border-amber-400">
              {promo.promoType === 'bogo' ? 'Buy 1 Get 1' : promo.promoType === 'combo' ? 'Combo Deal' : promo.promoType === 'spend_more' ? 'Spend More' : 'Discount'}
            </div>
            
            <h2 className="text-2xl font-black text-[#2A3426] leading-tight mb-2 pr-16">{promo.name}</h2>
            {promo.description && (
              <p className="text-sm text-[#6B7A68] leading-relaxed mb-4">{promo.description}</p>
            )}

            {/* Deal Mechanics */}
            <div className="bg-[#FAF9F5] rounded-xl p-4 border border-[#E0E6DF] space-y-3">
              <h3 className="text-[10px] font-black text-[#2E6F40] uppercase tracking-widest flex items-center gap-1.5">
                <Info size={12} /> Deal Details
              </h3>
              
              {promo.promoType === 'spend_more' && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#2E6F40]/10 flex items-center justify-center text-[#2E6F40]">
                    <DollarSign size={16} />
                  </div>
                  <div>
                    <div className="text-xs text-[#6B7A68]">Minimum Spend</div>
                    <div className="font-bold text-[#2A3426]">${promo.minOrderValue?.toFixed(2)}</div>
                  </div>
                </div>
              )}
              
              {(promo.promoType === 'discount' || promo.promoType === 'spend_more') && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600">
                    <Tag size={16} />
                  </div>
                  <div>
                    <div className="text-xs text-[#6B7A68]">Discount</div>
                    <div className="font-bold text-[#2A3426]">
                      {promo.discountType === 'PERCENTAGE' ? `${promo.discountValue}% OFF` : `$${promo.discountValue} OFF`}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Combo Items */}
          {promo.promoType === 'combo' && requiredItems.length > 0 && (
            <div className="mb-5">
              <h3 className="text-[11px] font-black text-[#6B7A68] uppercase tracking-widest mb-3 flex items-center gap-1.5 px-1">
                <ListChecks size={14} /> Required Items
              </h3>
              <div className="space-y-2">
                {requiredItems.map(item => (
                  <div key={item._id} className="flex items-center gap-3 p-3 bg-white border border-[#E0E6DF] rounded-xl">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-zinc-100 flex items-center justify-center">🍽️</div>
                    )}
                    <div className="flex-1">
                      <div className="font-bold text-[#2A3426] text-sm leading-tight">{item.name}</div>
                      <div className="text-[#6B7A68] text-xs">${item.price.toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Applicable Items */}
          {(promo.promoType === 'discount' || promo.promoType === 'bogo') && applicableItems.length > 0 && (
            <div className="mb-5">
              <h3 className="text-[11px] font-black text-[#6B7A68] uppercase tracking-widest mb-3 flex items-center gap-1.5 px-1">
                <Tag size={14} /> Eligible Items
              </h3>
              <div className="space-y-2">
                {applicableItems.map(item => (
                  <div key={item._id} className="flex items-center gap-3 p-3 bg-white border border-[#E0E6DF] rounded-xl">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-zinc-100 flex items-center justify-center">🍽️</div>
                    )}
                    <div className="flex-1">
                      <div className="font-bold text-[#2A3426] text-sm leading-tight">{item.name}</div>
                      <div className="text-[#6B7A68] text-xs">${item.price.toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
