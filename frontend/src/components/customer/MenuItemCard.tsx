import { MenuItem } from '@/types/restaurant';
import { Icons } from './Icons';

interface MenuItemCardProps {
  item: MenuItem;
  qtyInCart: number;
  singleCartItem: { cartId: string; quantity: number } | null;
  handleAddClick: (item: MenuItem) => void;
  handleOpenProduct: (item: MenuItem) => void;
  updateQuantity: (cartId: string, quantity: number) => void;
  removeItem: (cartId: string) => void;
}

export function MenuItemCard({
  item,
  qtyInCart,
  singleCartItem,
  handleAddClick,
  handleOpenProduct,
  updateQuantity,
  removeItem,
}: MenuItemCardProps) {
  const hasCustomizations = item.customizationGroups && item.customizationGroups.length > 0;
  
  const discount = item.discountPercent || 0;
  const finalPrice = discount > 0 ? item.price * (1 - discount / 100) : item.price;
  
  const isVegetarian = item.dietaryPreferences?.includes('Vegetarian');
  const isVegan = item.dietaryPreferences?.includes('Vegan');
  const isGF = item.dietaryPreferences?.includes('Gluten-Free');

  // We should pass the discounted price to handleAddClick instead of the original price
  // But wait, the item object itself is passed. To ensure cart gets the right price, we should clone it.
  const handleAddWithDiscount = () => {
    handleAddClick({
      ...item,
      price: finalPrice
    });
  };

  return (
    <div 
      className="bg-white rounded-2xl border border-[#E0E6DF] overflow-hidden flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300 relative group cursor-pointer"
      onClick={() => handleOpenProduct(item)}
    >
      {/* Top: 50% Height Product Image */}
      <div className="relative w-full h-28 flex-shrink-0 bg-[#FAF9F5] border-b border-[#E0E6DF]">
        {item.imageUrl ? (
          <img 
            src={item.imageUrl} 
            alt={item.name} 
            className={`w-full h-full object-cover ${!item.isAvailable && 'grayscale brightness-50'}`} 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[10px] text-[#8A9B86] font-bold">
            No Image
          </div>
        )}
        
        {/* Customizable Tag floating on image */}
        {hasCustomizations && item.isAvailable && (
          <span className="absolute top-2 left-2 text-[8px] font-extrabold uppercase tracking-wider text-[#2E6F40] bg-white border border-[#C8E6C9] px-1.5 py-0.5 rounded shadow-sm">
            Customize
          </span>
        )}

        {/* Sold Out Overlay */}
        {!item.isAvailable && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-[10px] font-black text-white uppercase tracking-widest bg-black/60 px-2 py-0.5 rounded">
              Sold Out
            </span>
          </div>
        )}
      </div>
      
      {/* Bottom: Product Details */}
      <div className="p-3 flex-grow flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start gap-1">
            <h4 className="font-extrabold text-[12px] text-[#1A2F1C] leading-snug group-hover:text-[#2E6F40] transition-colors line-clamp-2">
              {item.name}
            </h4>
            <div className="flex gap-0.5 mt-0.5 shrink-0">
              {(isVegetarian || isVegan) && (
                <span className="text-[#2E6F40]" title={isVegan ? "Vegan" : "Vegetarian"}>
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66l.95-2.3c.48.17.96.3 1.34.3c3.02 0 6-2.58 6-7.5c0-2.31-.69-4.32-2-5.74V4h-1.5c-1.85 0-4.04.43-5.5 1.5c-1.46 1.07-2.5 2.76-2.5 5.5v1.5h1.5v-1.5c0-1.84.71-3.08 1.68-3.79c.97-.71 2.5-1.07 4-1.16C9 7.72 11 11.5 11 15c0 3.73-2.07 5.5-4 5.5c-.32 0-.67-.09-1-.21c1.55-4.14 3.32-8.52 9-10.29H17z"/></svg>
                </span>
              )}
              {isGF && (
                <span className="text-amber-600 text-[8px] font-bold border border-amber-600 rounded px-0.5 tracking-tighter" title="Gluten-Free">
                  GF
                </span>
              )}
            </div>
          </div>
          <p className="text-[#6B7A68] text-[9.5px] line-clamp-2 leading-relaxed font-semibold mt-1">
            {item.description}
          </p>
        </div>

        <div className="mt-3 pt-2.5 border-t border-[#E0E6DF]/60 flex items-center justify-between gap-1.5">
          {/* Price */}
          <div className="flex flex-col">
            <span className="font-black text-xs text-[#2E6F40]">
              ${finalPrice.toFixed(2)}
            </span>
            {discount > 0 && (
              <span className="text-[9px] text-[#8A9B86] line-through font-semibold leading-none">
                ${item.price.toFixed(2)}
              </span>
            )}
          </div>

          {/* Overlapping Add Button / Quantity Controls */}
          <div className="relative min-w-[50px]">
            {item.isAvailable && qtyInCart > 0 ? (
              hasCustomizations ? (
                <div className="flex flex-col items-center w-full relative">
                  {/* Small floating cart count badge */}
                  <span className="absolute -top-3.5 -right-1.5 bg-[#D32F2F] text-white text-[7.5px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white shadow-sm">
                    {qtyInCart}
                  </span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddWithDiscount();
                    }}
                    className="bg-[#2E6F40] hover:bg-[#1D4A2A] text-white text-[8.5px] font-extrabold px-2 py-1 rounded-lg shadow-sm transition-all cursor-pointer text-center uppercase tracking-wide flex items-center justify-center border border-[#2E6F40] h-6"
                  >
                    Add +
                  </button>
                </div>
              ) : (
                singleCartItem && (
                  <div className="flex items-center bg-white border border-[#C8E6C9] rounded-lg p-0.5 justify-between shadow-sm h-6 gap-1">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        singleCartItem.quantity > 1 ? updateQuantity(singleCartItem.cartId, singleCartItem.quantity - 1) : removeItem(singleCartItem.cartId);
                      }} 
                      className="w-5.5 h-5.5 flex items-center justify-center text-[#2E6F40] font-black rounded hover:bg-[#E8F5E9] text-[10px] cursor-pointer"
                    >
                      <Icons.Minus />
                    </button>
                    <span className="font-extrabold text-[10px] text-[#2E6F40] min-w-[8px] text-center">{singleCartItem.quantity}</span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        updateQuantity(singleCartItem.cartId, singleCartItem.quantity + 1);
                      }} 
                      className="w-5.5 h-5.5 flex items-center justify-center text-[#2E6F40] font-black rounded hover:bg-[#E8F5E9] text-[10px] cursor-pointer"
                    >
                      <Icons.Plus />
                    </button>
                  </div>
                )
              )
            ) : item.isAvailable ? (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddWithDiscount();
                }}
                className="bg-white hover:bg-[#E8F5E9] text-[#2E6F40] border border-[#C8E6C9] text-[9.5px] font-black px-2.5 py-1 rounded-lg shadow-sm transition-all active:scale-[0.96] cursor-pointer text-center h-6 flex items-center justify-center uppercase tracking-wide"
              >
                Add
              </button>
            ) : (
              <span className="text-[9px] text-[#8A9B86] font-bold">Offline</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
