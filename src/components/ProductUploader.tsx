import React, { useState } from 'react';
import { Upload, Save, Trash2, Check, ImageIcon, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { UploadedProduct, LibraryProduct } from '../types';
import { Button } from './ui';

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
  const [activeTab, setActiveTab] = useState<Tab>('upload');

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
        "flex items-center gap-2 px-3 py-2 text-xs font-medium transition-all border-b-2",
        activeTab === id
          ? "border-accent text-text-primary"
          : "border-transparent text-text-tertiary hover:text-text-secondary hover:border-border"
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </button>
  );

  return (
    <div className="space-y-4">
      <div className="flex border-b border-border bg-surface-raised/50 -mx-5 -mt-4 px-5">
        <TabButton id="upload" label="Nieuw" icon={Upload} />
        <TabButton id="mine" label="Bibliotheek" icon={Plus} />
      </div>

      <div className="pt-2">
        <AnimatePresence mode="wait">
          {activeTab === 'upload' && (
            <motion.div key="upload" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}>
              {product.file && !product.isLibraryImage ? (
                <div className="space-y-3">
                  <div
                    className="relative aspect-square rounded-xl overflow-hidden bg-background border border-border group shadow-inset"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                  >
                    <img src={product.previewUrl!} className="w-full h-full object-contain p-4" alt="Upload preview" />
                    <div className="absolute inset-0 bg-zinc-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <label className="cursor-pointer bg-surface text-text-primary px-3 py-1.5 rounded-md font-semibold text-[10px] uppercase tracking-wider shadow-md hover:bg-zinc-50 transition-colors">
                        Wijzig
                        <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                      </label>
                    </div>
                  </div>
                  <Button variant="secondary" size="sm" className="w-full" onClick={onSaveToLibrary}>
                    <Plus className="w-3.5 h-3.5" />
                    Opslaan in bibliotheek
                  </Button>
                </div>
              ) : (
                <label
                  className="flex flex-col items-center justify-center aspect-square rounded-xl border-2 border-dashed border-border bg-surface-raised/50 cursor-pointer hover:bg-accent-muted/30 hover:border-accent/40 transition-all group"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                >
                  <Upload className="w-5 h-5 text-text-tertiary group-hover:text-accent transition-all mb-2" />
                  <span className="text-xs font-semibold text-text-tertiary group-hover:text-text-secondary">Klik of sleep hier</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                </label>
              )}
            </motion.div>
          )}
          {activeTab === 'mine' && (
            <motion.div key="mine" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}>
              {customLibrary.length === 0 ? (
                <div className="aspect-square flex flex-col items-center justify-center text-center p-3 bg-surface-raised/50 rounded-xl border border-dashed border-border">
                  <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center mb-3">
                    <ImageIcon className="w-5 h-5 text-text-tertiary" />
                  </div>
                  <p className="text-xs font-semibold text-text-tertiary">Geen opgeslagen items</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
                  {customLibrary.map((item) => (
                    <div key={item.id} className="relative group">
                      <button
                        onClick={() => onSelectCustom(selectedBaseId === item.id ? undefined : item.id)}
                        className={cn(
                          "w-full aspect-[4/5] rounded-lg overflow-hidden border transition-all p-1 flex flex-col",
                          selectedBaseId === item.id
                            ? "border-accent bg-accent-muted/50 ring-2 ring-accent/10"
                            : "border-border bg-surface hover:border-border-strong shadow-xs"
                        )}
                      >
                        <div className="flex-1 w-full relative">
                          <img src={item.imageUrl} className="w-full h-full object-contain" alt={item.name} />
                        </div>
                        <div className="mt-1 text-center">
                          <p className={cn("text-[9px] font-bold truncate", selectedBaseId === item.id ? "text-accent" : "text-text-primary")}>
                            {item.name}
                          </p>
                        </div>
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); onRemoveFromLibrary(item.id); }}
                        className="absolute -top-1 -right-1 p-1 bg-surface text-text-tertiary rounded-full shadow-sm opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-red-50 transition-all z-10 border border-border"
                      >
                        <Trash2 className="w-3 h-3" />
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
  );
}

