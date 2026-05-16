import React, { useState } from 'react';
import { ImageIcon, Upload, Library, Save, Trash2, Check, Shirt, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { UploadedProduct, LibraryProduct } from '../types';

interface Props {
  product: UploadedProduct;
  onUpload: (product: UploadedProduct) => void;
  library: LibraryProduct[];
  selectedBaseId?: string;
  onSelect: (id: string | undefined) => void;
  onSaveToLibrary: () => void;
  onRemoveFromLibrary: (id: string) => void;
}

type Tab = 'upload' | 'mine' | 'bll';

export default function UnifiedProductSelector({ 
  product, 
  onUpload, 
  library, 
  selectedBaseId, 
  onSelect, 
  onSaveToLibrary, 
  onRemoveFromLibrary 
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>(product.file ? 'upload' : 'bll');
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      onUpload({ file, previewUrl, mimeType: file.type, isLibraryImage: false });
      setActiveTab('upload');
    }
  };

  const handleImgError = (id: string) => {
    setImgErrors(prev => ({ ...prev, [id]: true }));
  };

  const standardItems = library.filter(i => !i.isCustom);
  const customItems = library.filter(i => i.isCustom);

  const TabButton = ({ id, label, icon: Icon }: { id: Tab; label: string; icon: any }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={cn(
        "flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all border-b-2",
        activeTab === id 
          ? "border-[#D32416] text-[#1A1A1A]" 
          : "border-transparent text-stone-400 hover:text-stone-600 hover:border-stone-200"
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </button>
  );

  return (
    <div className="space-y-6" id="unified-product-selector">
      <div className="flex items-center gap-2 mb-2">
        <ImageIcon className="text-[#D32416] w-5 h-5" />
        <h3 className="font-semibold text-[#1A1A1A]">1. Product & Ontwerp</h3>
      </div>

      <div className="bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden">
        <div className="flex border-b border-stone-50 px-4 bg-stone-50/30">
          <TabButton id="upload" label="Upload Nieuw" icon={Upload} />
          <TabButton id="mine" label="Mijn Bibliotheek" icon={Plus} />
          <TabButton id="bll" label="BLL Collectie" icon={Shirt} />
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'upload' && (
              <motion.div
                key="upload-tab"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="space-y-4"
              >
                {product.file && !product.isLibraryImage ? (
                  <div className="space-y-4">
                    <div className="relative aspect-square rounded-2xl overflow-hidden bg-stone-50 border border-stone-100 group">
                      <img 
                        src={product.previewUrl!} 
                        className="w-full h-full object-contain"
                        alt="Upload preview"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <label className="cursor-pointer bg-white text-[#1A1A1A] px-4 py-2 rounded-xl font-bold text-xs shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all">
                          Wijzig afbeelding
                          <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                        </label>
                      </div>
                    </div>
                    <button 
                      onClick={onSaveToLibrary}
                      className="w-full py-3 bg-[#D32416]/5 text-[#D32416] font-bold text-[10px] uppercase tracking-widest rounded-xl border border-[#D32416]/10 hover:bg-[#D32416] hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                      <Save className="w-3.5 h-3.5" />
                      Opslaan in mijn BLL bibliotheek
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center aspect-square rounded-2xl border-2 border-dashed border-stone-200 bg-stone-50/50 cursor-pointer hover:bg-white hover:border-[#D32416]/30 transition-all group">
                    <Upload className="w-8 h-8 text-stone-300 group-hover:text-[#D32416] transition-all mb-3" />
                    <span className="text-xs font-bold text-stone-500 group-hover:text-[#1A1A1A] uppercase tracking-widest">Kies een afbeelding</span>
                    <span className="text-[10px] text-stone-400 mt-1 uppercase tracking-tighter">Drag & Drop of klik</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                  </label>
                )}
              </motion.div>
            )}

            {activeTab === 'mine' && (
              <motion.div
                key="mine-tab"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="space-y-4"
              >
                {customItems.length === 0 ? (
                  <div className="aspect-square flex flex-col items-center justify-center text-center p-8 bg-stone-50/50 rounded-2xl border border-dashed border-stone-200">
                    <Save className="w-8 h-8 text-stone-200 mb-3" />
                    <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Geen opgeslagen items</p>
                    <p className="text-[10px] text-stone-300 mt-1 max-w-[150px]">Upload eerst een ontwerp om het hier op te slaan.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-1">
                    {customItems.map((item) => (
                      <ProductCard 
                        key={item.id} 
                        item={item} 
                        isSelected={selectedBaseId === item.id} 
                        onSelect={() => onSelect(selectedBaseId === item.id ? undefined : item.id)}
                        onRemove={() => onRemoveFromLibrary(item.id)}
                        hasError={imgErrors[item.id]}
                        onError={() => handleImgError(item.id)}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'bll' && ( activeTab === 'bll' || true ) && (
              <motion.div
                key="bll-tab"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-1"
              >
                {standardItems.map((item) => (
                  <ProductCard 
                    key={item.id} 
                    item={item} 
                    isSelected={selectedBaseId === item.id} 
                    onSelect={() => onSelect(selectedBaseId === item.id ? undefined : item.id)}
                    hasError={imgErrors[item.id]}
                    onError={() => handleImgError(item.id)}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function ProductCard({ item, isSelected, onSelect, onRemove, hasError, onError }: { item: LibraryProduct; isSelected: boolean; onSelect: () => void; onRemove?: () => void; hasError?: boolean; onError: () => void; key?: React.Key }) {
  return (
    <div className="relative group">
      <button
        onClick={onSelect}
        className={cn(
          "w-full aspect-[4/5] rounded-2xl overflow-hidden border-2 transition-all p-2 bg-white flex flex-col",
          isSelected ? "border-[#D32416] shadow-md scale-[1.02] bg-[#D32416]/5" : "border-stone-100 hover:border-stone-200"
        )}
      >
        <div className="flex-1 w-full relative">
          {!hasError && item.imageUrl ? (
            <img 
              src={item.imageUrl} 
              className={cn("w-full h-full object-contain transition-transform duration-500", !isSelected && "group-hover:scale-110")}
              alt={item.name}
              onError={onError}
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2">
              <Shirt className={cn("w-8 h-8", isSelected ? "text-[#D32416]" : "text-stone-200")} />
              <p className="text-[7px] font-bold text-stone-300 uppercase">Geen preview</p>
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
          <p className="text-[7px] font-bold text-stone-400 uppercase tracking-tighter mt-0.5">
            {item.category || 'Garment'}
          </p>
        </div>
      </button>
      {onRemove && (
        <button 
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="absolute -top-1 -right-1 p-2 bg-white text-stone-300 rounded-full shadow-sm opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all z-10"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}
