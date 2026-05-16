import { useState, useMemo, useEffect } from 'react';
import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Upload, Shirt, Camera, Sliders, CheckCircle2, ChevronRight, Image as ImageIcon, Wand2, ArrowRight } from 'lucide-react';
import ProductUploader from './components/ProductUploader';
import BaseProductSelector from './components/BaseProductSelector';
import FormatSelector from './components/FormatSelector';
import SettingsPanel from './components/SettingsPanel';
import PromptPreview from './components/PromptPreview';
import { generatePrompt } from './lib/generatePrompt';
import { PHOTOGRAPHY_FORMATS, DEFAULT_SETTINGS, BASE_PRODUCTS } from './lib/constants';
import { UploadedProduct, PromptSettings, LibraryProduct } from './types';
import { cn } from './lib/utils';
import { Card, CardHeader, CardContent, SectionHeader, Badge, Button } from './components/ui';

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

  const steps = [
    { id: 1, label: 'Ontwerp', done: product.previewUrl !== null },
    { id: 2, label: 'Product', done: settings.baseProductId !== undefined },
    { id: 3, label: 'Format', done: true },
    { id: 4, label: 'Details', done: true },
  ];
  
  const currentStep = !product.previewUrl ? 1 : !settings.baseProductId ? 2 : 3;

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
    <div className="min-h-screen bg-background text-text-primary selection:bg-accent/10 selection:text-accent">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="h-14 flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 bg-zinc-950 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs tracking-tight">B</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-text-primary tracking-tight">Prompt Studio</span>
                <Badge variant="outline">Beta</Badge>
              </div>
            </div>

            {/* Step Indicator */}
            <div className="hidden md:flex items-center gap-1">
              {steps.map((step, idx) => (
                <React.Fragment key={step.id}>
                  <div className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                    step.done ? 'text-text-secondary' :
                    step.id === currentStep ? 'bg-zinc-100 text-text-primary' : 'text-text-tertiary'
                  )}>
                    <div className={cn(
                      'w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold',
                      step.done ? 'bg-accent text-white' :
                      step.id === currentStep ? 'bg-zinc-900 text-white' : 'bg-zinc-200 text-zinc-500'
                    )}>
                      {step.done ? '✓' : step.id}
                    </div>
                    {step.label}
                  </div>
                  {idx < steps.length - 1 && (
                    <ChevronRight className="w-3 h-3 text-text-tertiary flex-shrink-0" />
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Badge variant="accent">BLL THE LABEL</Badge>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,340px] gap-6 items-start">
          
          {/* LEFT COLUMN: MAIN WORKFLOW */}
          <div className="space-y-6">
            
            {/* Steps 1 & 2: Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="h-full">
                <CardHeader className="p-4 pb-0">
                  <SectionHeader 
                    step={1} 
                    title="Ontwerp" 
                    description="Upload jouw logo of kledingstuk"
                  />
                </CardHeader>
                <CardContent className="p-4 pt-1">
                  <ProductUploader
                    product={product}
                    onUpload={setProduct}
                    customLibrary={customLibrary}
                    onSaveToLibrary={handleSaveToLibrary}
                    onRemoveFromLibrary={handleRemoveFromLibrary}
                    selectedBaseId={settings.baseProductId}
                    onSelectCustom={(id) => setSettings(s => ({ ...s, baseProductId: id }))}
                  />
                </CardContent>
              </Card>

              <Card className="h-full">
                <CardHeader className="p-4 pb-0">
                  <SectionHeader 
                    step={2} 
                    title="Basis Product" 
                    description="Kies de juiste fit voor je visualisatie"
                  />
                </CardHeader>
                <CardContent className="p-4 pt-1">
                  <BaseProductSelector
                    items={bllProducts}
                    selectedId={settings.baseProductId}
                    onSelect={(id) => setSettings(s => ({ ...s, baseProductId: id }))}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Step 3: Format */}
            <Card>
              <CardHeader className="p-4 pb-0">
                <SectionHeader 
                  step={3} 
                  title="Format & Compositie" 
                  description="Kies de professionele setting van de foto"
                />
              </CardHeader>
              <CardContent className="p-4 pt-1">
                 <FormatSelector selectedId={selectedFormatId} onSelect={setSelectedFormatId} />
              </CardContent>
            </Card>

            {/* Step 4: AI Prompt */}
            <div className="space-y-2">
               <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <Wand2 className="text-accent w-3.5 h-3.5" />
                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">AI Beschrijving</h3>
                  </div>
                  <Badge variant="outline" className="font-mono text-[9px]">{prompt.length} chars</Badge>
               </div>
               <div className="relative">
                  <div className="w-full bg-surface border border-border rounded-xl p-4 font-mono text-xs text-text-secondary leading-relaxed shadow-sm">
                    {prompt}
                  </div>
               </div>
            </div>
          </div>

          {/* RIGHT COLUMN: PREVIEW & SETTINGS (Sticky) */}
          <div className="lg:sticky lg:top-[74px] space-y-6">
            <Card className="overflow-hidden border-accent/20 shadow-lg shadow-accent/5">
              <CardHeader className="py-2.5 px-4 bg-zinc-50 border-b border-border flex flex-row items-center justify-between">
                 <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-text-primary">Preview Studio</span>
                 </div>
                 {product.previewUrl && (
                    <div className="w-6 h-6 rounded-md border border-border overflow-hidden ring-1 ring-black/5 bg-white">
                      <img src={product.previewUrl} className="w-full h-full object-cover" />
                    </div>
                 )}
              </CardHeader>
              <div className="bg-zinc-100 aspect-[4/5] relative border-b border-border flex items-center justify-center overflow-hidden">
                 <PromptPreview
                    prompt={prompt}
                    settings={settings}
                    product={product}
                    library={fullLibrary}
                    format={selectedFormat}
                  />
              </div>
              <CardContent className="p-4 space-y-2 bg-surface">
                 <div className="flex gap-1.5">
                    <Badge variant="outline" className="capitalize text-[9px]">{settings.modelType}</Badge>
                    <Badge variant="outline" className="text-[9px]">{settings.resolution}</Badge>
                 </div>
              </CardContent>
            </Card>

            <div className="space-y-3 px-1">
               <div className="flex items-center gap-2 text-text-secondary">
                  <Sliders className="w-3.5 h-3.5" />
                  <h3 className="text-[11px] font-bold uppercase tracking-wider">Instellingen</h3>
               </div>
               <SettingsPanel
                  settings={settings}
                  onUpdate={setSettings}
                  library={fullLibrary}
                  selectedFormatId={selectedFormatId}
                />
            </div>

            {/* Footer */}
            <div className="px-1 py-4 flex items-center justify-between text-[10px] font-medium text-text-tertiary border-t border-border/50">
              <span className="flex items-center gap-1.5">
                <div className="w-1 h-1 rounded-full bg-green-500 animate-pulse" />
                Systeem Gereed
              </span>
              <span>BLL Studio v2.0</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

