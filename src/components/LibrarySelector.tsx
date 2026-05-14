import React, { useState } from 'react';
import { LibraryProduct, UploadedProduct } from '../types';
import { Library, Save, Trash2, Check, Shirt, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface Props {
  library: LibraryProduct[];
  selectedBaseId?: string;
  currentProduct: UploadedProduct;
  onSelect: (id: string | undefined) => void;
  onSaveToLibrary: () => void;
  onRemoveFromLibrary: (id: string) => void;
}

export default function LibrarySelector({ 
  library, 
  selectedBaseId, 
  currentProduct,
  onSelect, 
  onSaveToLibrary, 
  onRemoveFromLibrary 
}: Props) {
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  const handleImgError = (id: string) => {
    setImgErrors(prev => ({ ...prev, [id]: true }));
  };

  const standardItems = library.filter(i => !i.isCustom);
  const customItems = library.filter(i => i.isCustom);

const GarmentPlaceholder = ({ item, isSelected }: { item: LibraryProduct; isSelected: boolean }) => {
    const isHoodie = item.id.includes('hoodie');
    const isSweater = item.id.includes('sweater') || item.id.includes('radder') || item.id.includes('matcher');
    const isLongsleeve = item.id.includes('longsleeve');

    return (
      <div className="flex flex-col items-center justify-center gap-2 py-6 px-4">
        <div className="relative">
          {isHoodie && (
            <div className={cn(
              "absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 transition-colors",
              isSelected ? "border-[#D32416]" : "border-stone-300"
            )} />
          )}
          <Shirt className={cn(
            "w-8 h-8 transition-colors",
            isSelected ? "text-[#D32416]" : "text-stone-300",
            isLongsleeve && "scale-x-110"
          )} />
          {isSweater && (
             <div className={cn(
              "absolute top-0 left-1/2 -translate-x-1/2 w-3 h-1.5 border-b-2 transition-colors",
              isSelected ? "border-[#D32416]" : "border-stone-300"
            )} />
          )}
        </div>
        <div className="text-center">
          <p className={cn(
            "text-[9px] font-black uppercase tracking-widest leading-tight transition-colors",
            isSelected ? "text-[#D32416]" : "text-stone-500"
          )}>
            {item.name}
          </p>
          <p className="text-[7px] font-bold text-stone-400 uppercase tracking-tighter mt-0.5">
            {item.category || (isHoodie ? 'Hoodie' : isSweater ? 'Sweater' : 'T-shirt')}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4" id="library-selector">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Shirt className="text-[#D32416] w-5 h-5" />
          <h3 className="font-semibold text-[#1A1A1A]">2. Basis product (vorm)</h3>
        </div>
      </div>

      {currentProduct.file && (
        <motion.button 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={onSaveToLibrary}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-stone-50 font-bold text-[10px] uppercase tracking-widest text-[#D32416] rounded-2xl hover:bg-[#D32416] hover:text-white transition-all border border-[#D32416]/20 border-dashed group mb-6"
        >
          <Save className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
          Ontwerp opslaan in mijn BLL bibliotheek
        </motion.button>
      )}

      <div className="space-y-10">
        {customItems.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-300">Jouw Bibliotheek</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {customItems.map((item) => {
                const isSelected = selectedBaseId === item.id;
                const hasError = imgErrors[item.id];
                return (
                  <div key={item.id} className="relative group">
                    <button
                      onClick={() => onSelect(isSelected ? undefined : item.id)}
                      className={cn(
                        "w-full rounded-2xl overflow-hidden bg-stone-50 border transition-all duration-300",
                        isSelected ? "border-[#D32416] ring-2 ring-[#D32416] bg-[#D32416]/5" : "border-stone-200 hover:border-[#D32416]/50"
                      )}
                    >
                      <div className="w-full relative">
                        {(!hasError && item.imageUrl) ? (
                          <div className="aspect-[4/5] relative">
                            <img 
                              src={item.imageUrl} 
                              alt={item.name} 
                              className={cn("w-full h-full object-cover rounded-xl transition-transform duration-500", !isSelected && "group-hover:scale-105")}
                              onError={() => handleImgError(item.id)}
                            />
                            <div className={cn(
                              "absolute inset-0 bg-gradient-to-t from-[#1A1A1A]/80 via-transparent to-transparent transition-opacity duration-300",
                              isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                            )} />
                            <div className={cn(
                              "absolute bottom-2 left-3 right-3 text-left transition-all duration-300",
                              isSelected ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
                            )}>
                              <p className="text-[10px] font-black text-white uppercase tracking-widest truncate leading-tight">
                                {item.name}
                              </p>
                              <p className="text-[8px] font-bold text-white/60 uppercase tracking-tighter">
                                {item.category || 'Garment'}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <GarmentPlaceholder item={item} isSelected={isSelected} />
                        )}
                        
                        <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
                          {isSelected && (
                            <div className="bg-[#D32416] text-white p-1 rounded-full shadow-lg">
                              <Check className="w-3 h-3" />
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onRemoveFromLibrary(item.id); }}
                      className="absolute -top-1 -right-1 p-2 bg-white text-stone-400 rounded-full shadow-md opacity-0 group-hover:opacity-100 hover:text-red-500 hover:scale-110 transition-all z-10"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="space-y-4">
          <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-300">BLL Basisproducten</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {standardItems.map((item) => {
              const isSelected = selectedBaseId === item.id;
              const hasError = imgErrors[item.id] || !item.imageUrl; 
              
              return (
                <div key={item.id} className="relative group">
                  <button
                    onClick={() => onSelect(isSelected ? undefined : item.id)}
                    className={cn(
                      "w-full rounded-2xl transition-all duration-300",
                      isSelected 
                        ? "bg-[#D32416]/5 border-[#D32416] ring-2 ring-[#D32416]" 
                        : "bg-white border-stone-200 hover:border-[#D32416]/50 shadow-sm hover:shadow-md"
                    )}
                  >
                    <div className="w-full relative border rounded-2xl overflow-hidden min-h-[140px] flex items-center justify-center bg-white">
                      {!hasError ? (
                        <div className="aspect-[1/1] w-full relative">
                          <img 
                            src={item.imageUrl} 
                            alt={item.name} 
                            referrerPolicy="no-referrer"
                            className={cn("w-full h-full object-contain p-2 transition-transform duration-500", !isSelected && "group-hover:scale-110")}
                            onError={() => handleImgError(item.id)}
                          />
                        </div>
                      ) : (
                        <GarmentPlaceholder item={item} isSelected={isSelected} />
                      )}

                      <div className="absolute top-2 right-2">
                        {isSelected && (
                          <div className="bg-[#D32416] text-white p-1 rounded-full shadow-sm">
                            <Check className="w-2.5 h-2.5" />
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
