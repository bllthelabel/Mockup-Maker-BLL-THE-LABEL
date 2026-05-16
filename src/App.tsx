/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Info } from 'lucide-react';
import ProductUploader from './components/ProductUploader';
import LibrarySelector from './components/LibrarySelector';
import FormatSelector from './components/FormatSelector';
import SettingsPanel from './components/SettingsPanel';
import PromptPreview from './components/PromptPreview';
import { generatePrompt } from './lib/generatePrompt';
import { PHOTOGRAPHY_FORMATS, DEFAULT_SETTINGS, BASE_PRODUCTS } from './lib/constants';
import { UploadedProduct, PromptSettings, LibraryProduct } from './types';

export default function App() {
  const [product, setProduct] = useState<UploadedProduct>({ file: null, previewUrl: null, mimeType: null });
  const [selectedFormatId, setSelectedFormatId] = useState(PHOTOGRAPHY_FORMATS[0].id);
  const [settings, setSettings] = useState<PromptSettings>(DEFAULT_SETTINGS);
  const [userLibrary, setUserLibrary] = useState<LibraryProduct[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('bll_user_library');
    if (saved) {
      try {
        setUserLibrary(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load library", e);
      }
    }
  }, []);

  // Save to localStorage
  const saveToLocalStorage = (lib: LibraryProduct[]) => {
    localStorage.setItem('bll_user_library', JSON.stringify(lib));
  };

  const fullLibrary = useMemo(() => [...userLibrary, ...BASE_PRODUCTS], [userLibrary, BASE_PRODUCTS]);

  const selectedFormat = useMemo(() => 
    PHOTOGRAPHY_FORMATS.find(f => f.id === selectedFormatId) || PHOTOGRAPHY_FORMATS[0],
    [selectedFormatId]
  );

  const prompt = useMemo(() => 
    generatePrompt(selectedFormat, settings, fullLibrary),
    [selectedFormat, settings, fullLibrary]
  );

  const handleSaveToLibrary = () => {
    if (!product.previewUrl) return;
    
    const newId = `custom-${Date.now()}`;
    const newItem: LibraryProduct = {
      id: newId,
      name: `Mijn Item ${userLibrary.length + 1}`,
      imageUrl: product.previewUrl,
      description: "Zelf geüpload item",
      isCustom: true
    };

    if (product.file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        const persistItem = { ...newItem, imageUrl: base64 };
        const next = [persistItem, ...userLibrary];
        setUserLibrary(next);
        saveToLocalStorage(next);
      };
      reader.readAsDataURL(product.file);
    } else {
      const next = [newItem, ...userLibrary];
      setUserLibrary(next);
      saveToLocalStorage(next);
    }
  };

  const handleRemoveFromLibrary = (id: string) => {
    const next = userLibrary.filter(item => item.id !== id);
    setUserLibrary(next);
    saveToLocalStorage(next);
    if (settings.baseProductId === id) {
      setSettings(s => ({ ...s, baseProductId: undefined }));
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFC] text-[#1A1A1A] font-sans selection:bg-[#D32416]/10 selection:text-[#D32416]">
      {/* Header */}
      <header className="border-b border-stone-200 bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex flex-col">
            <h1 className="text-xl font-bold tracking-tight text-[#1A1A1A] flex items-center gap-2">
              BLL Photo Prompt Studio
              <span className="bg-[#D32416]/5 text-[#D32416] text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest border border-[#D32416]/10">
                Beta
              </span>
            </h1>
            <p className="text-xs text-stone-500 font-medium font-sans">
              Genereer consistente productfoto prompts vanuit één productafbeelding
            </p>
          </div>
          <div className="hidden md:flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-stone-400">
            <span>Bribi</span>
            <span className="text-[#D32416]/30">•</span>
            <span>Lobi</span>
            <span className="text-[#D32416]/30">•</span>
            <span>Libi</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-[440px_1fr] gap-16 items-start">
          
          {/* Left Column: Input & Settings */}
          <div className="space-y-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <ProductUploader 
                product={product} 
                onUpload={setProduct} 
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <LibrarySelector 
                library={fullLibrary}
                selectedBaseId={settings.baseProductId}
                currentProduct={product}
                onSelect={(id) => setSettings(s => ({ ...s, baseProductId: id }))}
                onSaveToLibrary={handleSaveToLibrary}
                onRemoveFromLibrary={handleRemoveFromLibrary}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <FormatSelector selectedId={selectedFormatId} onSelect={setSelectedFormatId} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <SettingsPanel 
                settings={settings} 
                onUpdate={setSettings} 
                library={fullLibrary}
                selectedFormatId={selectedFormatId}
              />
            </motion.div>
          </div>

          {/* Right Column: Results & Preview */}
          <div className="space-y-12 sticky top-32">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="text-[#D32416] w-5 h-5" />
                <h2 className="text-2xl font-bold tracking-tight">Output</h2>
              </div>

              <div className="grid md:grid-cols-[1fr_2fr] gap-8">
                {/* Visual Context */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-4">Context</h3>
                  <div className="aspect-[4/5] bg-stone-100 rounded-2xl border border-stone-200 overflow-hidden relative group">
                    {product.previewUrl ? (
                      <img 
                        src={product.previewUrl} 
                        alt="Context product" 
                        className="w-full h-full object-cover grayscale opacity-50 contrast-125"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-400 p-8 text-center bg-stone-50">
                        <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                          Upload product om preview context te zien
                        </p>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                    <div className="absolute bottom-4 left-4">
                      <div className="text-[10px] text-white font-bold uppercase tracking-widest">BLL THE LABEL</div>
                    </div>
                  </div>
                </div>

                {/* Prompt Output */}
                <PromptPreview 
                  prompt={prompt} 
                  settings={settings}
                  product={product}
                  library={fullLibrary}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-100 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-xs text-stone-400 font-medium">
            © {new Date().getFullYear()} BLL THE LABEL • Kleding als reminder, niet als hype
          </p>
        </div>
      </footer>
    </div>
  );
}
