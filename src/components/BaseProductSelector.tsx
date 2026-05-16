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
    <div className="grid grid-cols-2 gap-3">
      {items.map((item) => {
        const isSelected = selectedId === item.id;
        const hasError = imgErrors[item.id];
        return (
          <button
            key={item.id}
            onClick={() => onSelect(isSelected ? undefined : item.id)}
            className={cn(
              "relative aspect-[4/5] rounded-lg overflow-hidden border transition-all p-1.5 flex flex-col group",
              isSelected
                ? "border-accent bg-accent-muted ring-2 ring-accent/10"
                : "border-border bg-surface hover:border-border-strong shadow-xs"
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
                  <Shirt className={cn("w-4 h-4", isSelected ? "text-accent" : "text-text-tertiary")} />
                </div>
              )}
            </div>
            <div className="mt-1.5 text-center">
              <p className={cn("text-[8px] font-bold uppercase tracking-tight truncate", isSelected ? "text-accent" : "text-text-primary")}>
                {item.name}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

