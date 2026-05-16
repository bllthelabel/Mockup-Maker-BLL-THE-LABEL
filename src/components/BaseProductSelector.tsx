import { useState } from 'react';
import { Shirt, Check } from 'lucide-react';
import { cn } from '../lib/utils';
import { LibraryProduct } from '../types';

interface Props {
  items: LibraryProduct[];
  selectedId?: string;
  onSelect: (id: string | undefined) => void;
}

export default function BaseProductSelector({ items, selectedId, onSelect }: Props) {
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="p-1.5 bg-stone-100 rounded-lg">
          <Shirt className="text-[#D32416] w-3.5 h-3.5" />
        </div>
        <h3 className="font-bold text-xs uppercase tracking-[0.2em] text-[#1A1A1A]">2. Basis Product</h3>
      </div>

      <div className="bg-white rounded-3xl border border-stone-100 shadow-sm p-3">
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
          {items.map((item) => {
            const isSelected = selectedId === item.id;
            const hasError = imgErrors[item.id];
            return (
              <button
                key={item.id}
                onClick={() => onSelect(isSelected ? undefined : item.id)}
                className={cn(
                  "relative aspect-[4/5] rounded-xl overflow-hidden border transition-all p-1.5 bg-white flex flex-col group",
                  isSelected
                    ? "border-[#D32416] ring-1 ring-[#D32416]/50 bg-[#D32416]/5"
                    : "border-stone-100 hover:border-stone-200"
                )}
              >
                <div className="flex-1 w-full relative">
                  {!hasError && item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      className={cn("w-full h-full object-contain transition-transform duration-500", !isSelected && "group-hover:scale-110")}
                      alt={item.name}
                      onError={() => setImgErrors(prev => ({ ...prev, [item.id]: true }))}
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Shirt className={cn("w-6 h-6", isSelected ? "text-[#D32416]" : "text-stone-200")} />
                    </div>
                  )}
                  {isSelected && (
                    <div className="absolute top-0 right-0 bg-[#D32416] text-white p-1 rounded-full shadow-lg">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </div>
                <div className="mt-2 text-left">
                  <p className={cn("text-[9px] font-black uppercase tracking-tight truncate", isSelected ? "text-[#D32416]" : "text-[#1A1A1A]")}>
                    {item.name}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
