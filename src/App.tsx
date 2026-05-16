/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Info, Shirt, Camera, Sliders, Image as ImageIcon, CheckCircle2, ChevronRight } from 'lucide-react';
import UnifiedProductSelector from './components/UnifiedProductSelector';
import FormatSelector from './components/FormatSelector';
import SettingsPanel from './components/SettingsPanel';
import PromptPreview from './components/PromptPreview';
import { generatePrompt } from './lib/generatePrompt';
import { PHOTOGRAPHY_FORMATS, DEFAULT_SETTINGS, BASE_PRODUCTS } from './lib/constants';
import { UploadedProduct, PromptSettings, LibraryProduct } from './types';
import { cn } from './lib/utils';

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
      name: `Design ${userLibrary.length + 1}`,
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

  // Workflow steps logic
  const steps = [
    { id: 1, label: 'Product', icon: Shirt, active: true, completed: !!(product.previewUrl || settings.baseProductId) },
    { id: 2, label: 'Format', icon: Camera, active: !!(product.previewUrl || settings.baseProductId), completed: !!selectedFormatId },
    { id: 3, label: 'Instellingen', icon: Sliders, active: !!selectedFormatId, completed: true },
    { id: 4, label: 'Genereren', icon: Sparkles, active: !!(product.previewUrl || settings.baseProductId), completed: false },
  ];

  const currentStep = steps.find(s => !s.completed)?.id || 4;

  return (
    <div className="min-h-screen bg-[#FDFDFC] text-[#1A1A1A] font-sans selection:bg-[#D32416]/10 selection:text-[#D32416]">
      {/* Step Indicator Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 overflow-x-auto scrollbar-none">
          <div className="h-16 flex items-center justify-between min-w-[500px]">
            <div className="flex items-center gap-1.5 mr-8">
              <div className="w-8 h-8 bg-[#D32416] rounded-lg flex items-center justify-center text-white font-black text-sm shadow-sm ring-4 ring-[#D32416]/5">B</div>
              <span className="font-bold tracking-tighter text-sm">PROMPT STUDIO</span>
            </div>

            <div className="flex items-center gap-8 flex-1 justify-center">
              {steps.map((step, idx) => {
                const Icon = step.icon;
                const isCurrent = currentStep === step.id;
                return (
                  <div key={step.id} className="flex items-center gap-3">
                    <div className={cn(
                      "flex items-center gap-2 group transition-all",
                      isCurrent ? "text-[#1A1A1A]" : (step.completed ? "text-[#D32416]" : "text-stone-300")
                    )}>
                      <div className={cn(
                        "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black transition-all",
                        isCurrent ? "bg-[#1A1A1A] text-white" : (step.completed ? "bg-[#D32416] text-white" : "bg-stone-100 text-stone-400 group-hover:bg-stone-200")
                      )}>
                        {step.completed && !isCurrent ? <CheckCircle2 className="w-3.5 h-3.5" /> : step.id}
                      </div>
                      <span className={cn(
                        "text-[10px] font-black uppercase tracking-widest whitespace-nowrap",
                        isCurrent ? "opacity-100" : "opacity-60"
                      )}>{step.label}</span>
                    </div>
                    {idx < steps.length - 1 && <ChevronRight className="w-3 h-3 text-stone-200" />}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-3 ml-8">
              <span className="bg-[#D32416]/5 text-[#D32416] text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest border border-[#D32416]/10">
                Beta v2.0
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,400px] xl:grid-cols-[1fr,440px] gap-8 xl:gap-16 items-start">
          
          {/* Main Content Area */}
          <div className="space-y-12 min-w-0">
            {/* Step 1 & 2: Content Selection */}
            <div className="grid md:grid-cols-2 gap-8 md:gap-12">
              <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn("transition-all duration-500", currentStep === 1 ? "opacity-100 scale-100" : "opacity-40 grayscale-[0.5]")}
              >
                <UnifiedProductSelector 
                  product={product} 
                  onUpload={setProduct} 
                  library={fullLibrary}
                  selectedBaseId={settings.baseProductId}
                  onSelect={(id) => setSettings(s => ({ ...s, baseProductId: id }))}
                  onSaveToLibrary={handleSaveToLibrary}
                  onRemoveFromLibrary={handleRemoveFromLibrary}
                />
              </motion.section>

              <motion.section
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className={cn("transition-all duration-500", currentStep === 2 ? "opacity-100 scale-100" : "opacity-40 grayscale-[0.5]")}
              >
                <FormatSelector selectedId={selectedFormatId} onSelect={setSelectedFormatId} />
              </motion.section>
            </div>

            {/* Step 4 Preview: Final Results */}
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-6 pt-8 border-t border-stone-100"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="text-[#D32416] w-5 h-5" />
                  <h2 className="text-xl font-bold tracking-tight">4. Studio Resultaten</h2>
                </div>
              </div>

              <PromptPreview 
                prompt={prompt} 
                settings={settings}
                product={product}
                library={fullLibrary}
                format={selectedFormat}
              />
            </motion.section>
          </div>

          {/* Right Sidebar: Settings (Always accessible) */}
          <aside className="lg:sticky lg:top-28 space-y-8">
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <SettingsPanel 
                settings={settings} 
                onUpdate={setSettings} 
                library={fullLibrary}
                selectedFormatId={selectedFormatId}
              />
            </motion.div>

            {/* Mini Context Widget */}
            <div className="bg-stone-50 p-6 rounded-3xl border border-stone-100 space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-stone-400">Design Context</h4>
              <div className="aspect-square bg-white rounded-2xl border border-stone-200 overflow-hidden relative shadow-inner">
                {product.previewUrl ? (
                  <img 
                    src={product.previewUrl} 
                    alt="Current design" 
                    className="w-full h-full object-contain p-4 grayscale opacity-30 group-hover:opacity-100 transition-opacity"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-300 p-8 text-center">
                    <ImageIcon className="w-8 h-8 opacity-20" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-50/50 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#D32416]" />
                  <span className="text-[8px] font-black text-[#D32416] uppercase tracking-tighter">BLL THE LABEL</span>
                </div>
              </div>
              <p className="text-[10px] text-stone-500 leading-relaxed italic">
                Dit is de basisafbeelding die gebruikt wordt om het ontwerp over te nemen naar de AI generatie.
              </p>
            </div>
          </aside>
        </div>
      </main>

      <footer className="border-t border-stone-100 py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">
            <a href="#" className="hover:text-[#D32416] transition-colors">Bribi</a>
            <a href="#" className="hover:text-[#D32416] transition-colors">Lobi</a>
            <a href="#" className="hover:text-[#D32416] transition-colors">Libi</a>
          </div>
          <p className="text-xs text-stone-400 font-medium font-sans">
            © {new Date().getFullYear()} BLL THE LABEL • Kleding als reminder, niet als hype
          </p>
        </div>
      </footer>
    </div>
  );
}
