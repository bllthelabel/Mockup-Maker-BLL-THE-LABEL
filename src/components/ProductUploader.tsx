import React, { useState } from 'react';
import { Upload, Save, Trash2, Check, ImageIcon, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { UploadedProduct, LibraryProduct } from '../types';

interface Props {
  product: UploadedProduct;
  onUpload: (product: UploadedProduct) => void;
  customLibrary: LibraryProduct[];
  onSaveToLibrary: () => void;
  onRemoveFromLibrary: (id: string) => void;
  selectedBaseId?: string;
  onSelectCustom: (id: string | undefined) => void;
}

type Tab = 'upload' | 'mine';

export default function ProductUploader({
  product, onUpload, customLibrary,
  onSaveToLibrary, onRemoveFromLibrary,
  selectedBaseId, onSelectCustom
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>(product.file ? 'upload' : 'upload');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUpload({ file, previewUrl: URL.createObjectURL(file), mimeType: file.type, isLibraryImage: false });
      setActiveTab('upload');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onUpload({ file, previewUrl: URL.createObjectURL(file), mimeType: file.type, isLibraryImage: false });
      setActiveTab('upload');
    }
  };

  const TabButton = ({ id, label, icon: Icon }: { id: Tab; label: string; icon: any }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={cn(
        "flex items-center gap-2 px-3 py-2 text-[9px] font-black uppercase tracking-widest transition-all border-b-2",
        activeTab === id
          ? "border-[#D32416] text-[#1A1A1A]"
          : "border-transparent text-stone-400 hover:text-stone-600 hover:border-stone-200"
      )}
    >
      <Icon className="w-3 h-3" />
      {label}
    </button>
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="p-1.5 bg-stone-100 rounded-lg">
          <ImageIcon className="text-[#D32416] w-3.5 h-3.5" />
        </div>
        <h3 className="font-bold text-xs uppercase tracking-[0.2em] text-[#1A1A1A]">1. Upload Ontwerp</h3>
      </div>

      <div className="bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden">
        <div className="flex border-b border-stone-100 px-3 bg-stone-50/30">
          <TabButton id="upload" label="Upload" icon={Upload} />
          <TabButton id="mine" label="Mijn Items" icon={Plus} />
        </div>

        <div className="p-3">
          <AnimatePresence mode="wait">
            {activeTab === 'upload' && (
              <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {product.file && !product.isLibraryImage ? (
                  <div className="space-y-2">
                    <div
                      className="relative aspect-square rounded-2xl overflow-hidden bg-stone-50 border border-stone-100 group shadow-inner"
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={handleDrop}
                    >
                      <img src={product.previewUrl!} className="w-full h-full object-contain p-2" alt="Upload preview" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <label className="cursor-pointer bg-white text-[#1A1A1A] px-2 py-1 rounded-lg font-bold text-[9px] uppercase shadow-lg">
                          Wijzig
                          <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                        </label>
                      </div>
                    </div>
                  </div>
                ) : (
                  <label
                    className="flex flex-col items-center justify-center aspect-square rounded-2xl border-2 border-dashed border-stone-200 bg-stone-50/50 cursor-pointer hover:bg-white hover:border-[#D32416]/30 transition-all group"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                  >
                    <Upload className="w-4 h-4 text-stone-300 group-hover:text-[#D32416] transition-all mb-1" />
                    <span className="text-[9px] font-bold text-stone-400 group-hover:text-[#1A1A1A] uppercase tracking-[0.1em]">Upload</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                  </label>
                )}
              </motion.div>
            )}
            {activeTab === 'mine' && (
              <motion.div key="mine" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {customLibrary.length === 0 ? (
                  <div className="aspect-square flex flex-col items-center justify-center text-center p-3 bg-stone-50/50 rounded-2xl border border-dashed border-stone-200">
                    <Save className="w-4 h-4 text-stone-200 mb-1" />
                    <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Leeg</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2 max-h-[250px] overflow-y-auto pr-1 scrollbar-thin">
                    {customLibrary.map((item) => (
                      <div key={item.id} className="relative group">
                        <button
                          onClick={() => onSelectCustom(selectedBaseId === item.id ? undefined : item.id)}
                          className={cn(
                            "w-full aspect-[4/5] rounded-xl overflow-hidden border transition-all p-1.5 bg-white flex flex-col",
                            selectedBaseId === item.id
                              ? "border-[#D32416] ring-1 ring-[#D32416]/50 bg-[#D32416]/5"
                              : "border-stone-100 hover:border-stone-200"
                          )}
                        >
                          <div className="flex-1 w-full relative">
                            <img src={item.imageUrl} className="w-full h-full object-contain" alt={item.name} />
                          </div>
                          <div className="mt-1 text-left">
                            <p className={cn("text-[8px] font-black uppercase tracking-tight truncate", selectedBaseId === item.id ? "text-[#D32416]" : "text-[#1A1A1A]")}>
                              {item.name}
                            </p>
                          </div>
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); onRemoveFromLibrary(item.id); }}
                          className="absolute -top-1 -right-1 p-1 bg-white text-stone-300 rounded-full shadow-sm opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all z-10"
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
