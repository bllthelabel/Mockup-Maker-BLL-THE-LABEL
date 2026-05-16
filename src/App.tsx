import { useState, useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Upload, Shirt, Camera, Sliders, CheckCircle2, ChevronRight, Image as ImageIcon, Wand2 } from 'lucide-react';
import ProductUploader from './components/ProductUploader';
import BaseProductSelector from './components/BaseProductSelector';
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

  useEffect(() => {
    const saved = localStorage.getItem('bll_user_library');
    if (saved) {
      try { setUserLibrary(JSON.parse(saved)); } catch {}
    }
  }, []);

  const saveToLocalStorage = (lib: LibraryProduct[]) => {
    localStorage.setItem('bll_user_library', JSON.stringify(lib));
  };

  const fullLibrary = useMemo(() => [...userLibrary, ...BASE_PRODUCTS], [userLibrary]);
  const bllProducts = useMemo(() => BASE_PRODUCTS, []);
  const customLibrary = useMemo(() => userLibrary, [userLibrary]);

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
      description: 'Zelf geüpload item',
      isCustom: true,
    };
    if (product.file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const persistItem = { ...newItem, imageUrl: reader.result as string };
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
    const next = userLibrary.filter(i => i.id !== id);
    setUserLibrary(next);
    saveToLocalStorage(next);
    if (settings.baseProductId === id) {
      setSettings(s => ({ ...s, baseProductId: undefined }));
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFC] text-[#1A1A1A] font-sans selection:bg-[#D32416]/10 selection:text-[#D32416]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-[1600px] mx-auto px-6 h-12 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#D32416] rounded flex items-center justify-center text-white font-black text-xs">B</div>
            <span className="font-bold tracking-tighter text-xs uppercase">Prompt Studio</span>
          </div>
        </div>
      </header>

      <main className="max-w-[1750px] mx-auto px-4 py-3">
        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr,1fr] gap-4 items-start">
          
          {/* LINKER KOLOM: CONTROLS */}
          <div className="space-y-3">
            
            {/* Sectie 1: Top Input Grid (3 kolommen op XL) */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 items-start">
              <ProductUploader
                product={product}
                onUpload={setProduct}
                customLibrary={customLibrary}
                onSaveToLibrary={handleSaveToLibrary}
                onRemoveFromLibrary={handleRemoveFromLibrary}
                selectedBaseId={settings.baseProductId}
                onSelectCustom={(id) => setSettings(s => ({ ...s, baseProductId: id }))}
              />
              <BaseProductSelector
                items={bllProducts}
                selectedId={settings.baseProductId}
                onSelect={(id) => setSettings(s => ({ ...s, baseProductId: id }))}
              />
              <div className="space-y-1.5 h-full flex flex-col">
                 <div className="flex items-center gap-2">
                    <Camera className="text-[#D32416] w-3 h-3" />
                    <h3 className="font-bold text-[9px] uppercase tracking-[0.2em] text-stone-400">Aspect Ratio</h3>
                 </div>
                 <FormatSelector selectedId={selectedFormatId} onSelect={setSelectedFormatId} />
              </div>
            </div>

            {/* Sectie 2: Prompt Area (Full Width) */}
            <div className="space-y-1.5">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wand2 className="text-[#D32416] w-3 h-3" />
                    <h3 className="font-bold text-[9px] uppercase tracking-[0.2em] text-stone-400">Beschrijf bewerking</h3>
                  </div>
                  <span className="text-[8px] text-stone-300 font-bold uppercase tracking-widest">
                    {prompt.length} / 5k
                  </span>
               </div>
               <div className="relative group">
                  <div className="w-full bg-white border border-stone-100 rounded-[20px] p-3 text-[12px] font-medium text-stone-600 leading-relaxed shadow-sm transition-all focus-within:ring-2 focus-within:ring-[#D32416]/5">
                    <p className="whitespace-pre-wrap">{prompt}</p>
                    {prompt.length === 0 && <p className="text-stone-300 italic">Beschrijf hier je wensen...</p>}
                  </div>
               </div>
            </div>

            {/* Sectie 4: Instellingen */}
            <div className="space-y-1.5">
               <div className="flex items-center gap-2 text-stone-300">
                  <Sliders className="w-3 h-3" />
                  <h3 className="font-bold text-[9px] uppercase tracking-[0.2em]">Instellingen</h3>
               </div>
               <SettingsPanel
                  settings={settings}
                  onUpdate={setSettings}
                  library={fullLibrary}
                  selectedFormatId={selectedFormatId}
                />
            </div>
          </div>

          {/* RECHTER KOLOM: RESULTAAT (Sticky) */}
          <div className="lg:sticky lg:top-16 space-y-3">
            <div className="bg-stone-50 rounded-[32px] border border-stone-200 p-5 min-h-[450px] flex flex-col shadow-xs">
              <div className="flex items-center justify-between mb-3">
                 <h2 className="text-base font-bold tracking-tight">Resultaat</h2>
                 <div className="flex gap-1">
                    {product.previewUrl && (
                      <div className="w-5 h-5 rounded-full bg-white border border-stone-100 overflow-hidden">
                        <img src={product.previewUrl} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="w-5 h-5 rounded-full bg-[#D32416] flex items-center justify-center text-white shadow-sm">
                      <ImageIcon className="w-2.5 h-2.5" />
                    </div>
                 </div>
              </div>

              <div className="flex-1 bg-stone-100 rounded-[24px] overflow-hidden relative shadow-inner border border-stone-200 flex items-center justify-center min-h-[220px]">
                 <PromptPreview
                    prompt={prompt}
                    settings={settings}
                    product={product}
                    library={fullLibrary}
                    format={selectedFormat}
                  />
              </div>

              <div className="mt-3 flex flex-col items-center justify-center text-stone-300">
                 <div className="flex items-center gap-1">
                    <span className="text-[7px] font-black uppercase tracking-widest bg-white/50 px-1 py-0.5 rounded border border-stone-100">{settings.resolution}</span>
                    <span className="text-[7px] font-black uppercase tracking-widest bg-white/50 px-1 py-0.5 rounded border border-stone-100">{settings.modelType}</span>
                 </div>
              </div>
            </div>

            {/* Footer compact */}
            <div className="px-4 flex items-center justify-between text-[9px] font-bold text-stone-300 uppercase tracking-widest">
              <span>BLL Studio</span>
              <span>© {new Date().getFullYear()}</span>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
