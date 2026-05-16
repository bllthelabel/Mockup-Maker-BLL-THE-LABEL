
import { Copy, Check, Info, Sparkles, Loader2, Download, Maximize2, X, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NEGATIVE_PROMPT, PHOTOGRAPHY_FORMATS } from '../lib/constants';
import { generateImage } from '../services/aiService';
import { generatePrompt } from '../lib/generatePrompt';
import { PhotographyFormat, PromptSettings, UploadedProduct, GeneratedImage, LibraryProduct } from '../types';

interface Props {
  prompt: string;
  settings: PromptSettings;
  product: UploadedProduct;
  library: LibraryProduct[];
  format: PhotographyFormat;
}

interface FormatStatus {
  image: GeneratedImage | null;
  error: string | null;
  isLoading: boolean;
}

export default function PromptPreview({ prompt, settings, product, library, format }: Props) {
  const [copied, setCopied] = useState<'main' | 'negative' | 'full' | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImg, setGeneratedImg] = useState<GeneratedImage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [history, setHistory] = useState<{ image: GeneratedImage; settings: PromptSettings; formatName: string }[]>(() => {
    try {
      const saved = localStorage.getItem('bll_generation_history');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  const saveToHistory = (image: GeneratedImage, currentSettings: PromptSettings, formatName: string) => {
    const newItem = { image, settings: currentSettings, formatName };
    setHistory(prev => {
      const next = [newItem, ...prev].slice(0, 10);
      try {
        localStorage.setItem('bll_generation_history', JSON.stringify(next));
      } catch (e) {
        console.warn('Failed to save history to localStorage', e);
      }
      return next;
    });
  };

  const [isGeneratingAll, setIsGeneratingAll] = useState(false);

  useEffect(() => {
    let interval: any;
    if (isGenerating || isGeneratingAll) {
      setElapsed(0);
      interval = setInterval(() => setElapsed(e => e + 1), 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isGenerating, isGeneratingAll]);

  const [allFormats, setAllFormats] = useState<Record<string, FormatStatus>>(() => {
    const initial: Record<string, FormatStatus> = {};
    PHOTOGRAPHY_FORMATS.forEach(f => {
      initial[f.id] = { image: null, error: null, isLoading: false };
    });
    return initial;
  });

  const selectedProduct = settings.baseProductId ? library.find(p => p.id === settings.baseProductId) : null;

  const [previewAllImg, setPreviewAllImg] = useState<{ url: string; name: string } | null>(null);

  // Close preview on escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsPreviewOpen(false);
        setPreviewAllImg(null);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const copy = async (text: string, type: 'main' | 'negative' | 'full') => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const checkApiKey = async (): Promise<boolean> => {
    // In this environment, we trust the environment variable process.env.GEMINI_API_KEY
    // which is used inside the aiService.
    return true;
  };

  const parseError = (err: any, provider: 'google' | 'openai'): string => {
    console.error("Generation error:", err);
    let errorMsg = err.message || "";
    
    if (errorMsg.includes("<html>") || errorMsg.includes("502") || errorMsg.includes("Bad Gateway")) {
      return "De server is tijdelijk onbereikbaar (502). Probeer het over enkele ogenblikken opnieuw.";
    }

    if (errorMsg.includes("Requested entity was not found") || errorMsg.includes("PERMISSION_DENIED") || errorMsg.includes("403")) {
      if (provider === 'google') {
        return "Toegang geweigerd of model niet beschikbaar. Dit model (Gemini 3.1) vereist een API-sleutel van een Google Cloud-project met facturering (billing) ingeschakeld.";
      } else {
        return "Toegang geweigerd voor OpenAI. Controleer je OpenAI API key.";
      }
    }
    
    if (errorMsg.includes("quota") || errorMsg.includes("limit")) {
      return `Je hebt je quota bereikt voor de ${provider === 'google' ? 'Gemini' : 'OpenAI'} API.`;
    }
    
    return errorMsg || "Er is iets misgegaan bij het genereren.";
  };

  const handleGenerate = async () => {
    if (!product.file && !settings.baseProductId) {
      setError("Upload eerst een productafbeelding of kies een basisproduct uit de bibliotheek.");
      return;
    }

    if (!(await checkApiKey())) {
      setError("Voor HD, 2K en 4K generatie is een eigen Gemini API Key vereist.");
      return;
    }
    
    setIsGenerating(true);
    setError(null);
    try {
      const result = await generateImage(prompt, settings, product, library, format);
      setGeneratedImg(result);
      saveToHistory(result, settings, format.name);
    } catch (err: any) {
      setError(parseError(err, settings.provider));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateAll = async () => {
    if (!product.file && !settings.baseProductId) {
      setError("Upload eerst een productafbeelding of kies een basisproduct uit de bibliotheek.");
      return;
    }

    if (!(await checkApiKey())) {
      setError("Voor HD, 2K en 4K generatie is een eigen Gemini API Key vereist.");
      return;
    }

    setIsGeneratingAll(true);
    setError(null);

    // Initial state: all loading
    const initialBatchState: typeof allFormats = {};
    PHOTOGRAPHY_FORMATS.forEach(format => {
      initialBatchState[format.id] = { image: null, error: null, isLoading: true };
    });
    setAllFormats(initialBatchState);

    const results = await Promise.allSettled(
      PHOTOGRAPHY_FORMATS.map(async (format, index) => {
        // Staggered delay to improve consistency per format (avoids identical simultaneous requests)
        if (index > 0) await new Promise(resolve => setTimeout(resolve, index * 600));
        
        const formatPrompt = generatePrompt(format, settings, library);
        const img = await generateImage(formatPrompt, settings, product, library, format);
        saveToHistory(img, settings, format.name);
        return { formatId: format.id, image: img };
      })
    );

    const finalBatchState = { ...initialBatchState };
    results.forEach((res) => {
      if (res.status === 'fulfilled') {
        finalBatchState[res.value.formatId] = { image: res.value.image, error: null, isLoading: false };
      } else {
        // Find which format failed
        const formatId = PHOTOGRAPHY_FORMATS.find((_, i) => results[i] === res)?.id;
        if (formatId) {
          finalBatchState[formatId] = { 
            image: null, 
            error: parseError(res.reason, settings.provider), 
            isLoading: false 
          };
        }
      }
    });

    setAllFormats(finalBatchState);
    setIsGeneratingAll(false);
  };

  const handleGenerateVariations = async () => {
    if (!product.file && !settings.baseProductId) {
      setError("Upload eerst een productafbeelding.");
      return;
    }
    
    setIsGenerating(true);
    setError(null);
    try {
      const format = PHOTOGRAPHY_FORMATS.find(f => prompt.includes(f.name.toUpperCase())) || PHOTOGRAPHY_FORMATS[0];
      const promises = [0, 1, 2].map(i => {
        const varSettings = { ...settings, variationIndex: i };
        const varPrompt = generatePrompt(format, varSettings, library);
        return generateImage(varPrompt, varSettings, product, library, format);
      });
      
      const results = await Promise.all(promises);
      setGeneratedImg(results[0]); // Show the first one as main
      results.forEach(img => saveToHistory(img, settings, format.name));
    } catch (err: any) {
      setError(parseError(err, settings.provider));
    } finally {
      setIsGenerating(false);
    }
  };

  const resetAndRetry = () => {
    setGeneratedImg(null);
    setError(null);
    handleGenerate();
  };

  const downloadImage = (url?: string, label?: string) => {
    const finalUrl = url || generatedImg?.url;
    if (!finalUrl) return;
    
    const selectedProduct = settings.baseProductId ? library.find(p => p.id === settings.baseProductId) : null;
    const productName = selectedProduct ? selectedProduct.name.replace(/\s+/g, '-') : 'Unknown-Product';
    const colorName = settings.color ? settings.color.replace(/\s+/g, '-') : 'Original';
    const designName = settings.designName ? settings.designName.trim().replace(/\s+/g, '-') : 'Design';
    const formatLabel = label ? `-${label.replace(/\s+/g, '-')}` : '';
    
    const filename = `BLL-THE-LABEL-${designName}-${productName}-${colorName}${formatLabel}-${Date.now()}.png`;
    
    const link = document.createElement('a');
    link.href = finalUrl;
    link.download = filename;
    link.click();
  };

  const downloadAllFormats = () => {
    Object.entries(allFormats).forEach(([id, data]) => {
      const status = data as FormatStatus;
      if (status.image) {
        const format = PHOTOGRAPHY_FORMATS.find(f => f.id === id);
        downloadImage(status.image.url, format?.name || id);
      }
    });
  };

  const clearAllFormats = () => {
    const cleared: Record<string, FormatStatus> = {};
    PHOTOGRAPHY_FORMATS.forEach(f => {
      cleared[f.id] = { image: null, error: null, isLoading: false };
    });
    setAllFormats(cleared);
  };

  return (
    <div className="space-y-6" id="prompt-preview-container">
      {/* Visual Generation Section */}
      <section className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm space-y-6 overflow-hidden">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-widest text-[#1A1A1A]">Direct Genereren</h3>
          <div className="text-[10px] bg-stone-100 px-2 py-1 rounded font-bold text-stone-500">
            {settings.resolution} Kwaliteit
          </div>
        </div>

        <AnimatePresence mode="wait">
          {generatedImg ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4"
            >
              <div 
                onClick={() => setIsPreviewOpen(true)}
                className="relative aspect-square rounded-2xl overflow-hidden bg-stone-50 border border-stone-100 group cursor-zoom-in"
              >
                <img 
                  src={generatedImg.url} 
                  alt="Gegenereerd product" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                  <button 
                    onClick={(e) => { e.stopPropagation(); downloadImage(); }}
                    className="p-3 bg-white rounded-full text-[#1A1A1A] hover:bg-[#D32416] hover:text-white transition-all transform hover:scale-110"
                    title="Download afbeelding"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setIsPreviewOpen(true); }}
                    className="p-3 bg-white rounded-full text-[#1A1A1A] hover:bg-[#D32416] hover:text-white transition-all transform hover:scale-110"
                    title="Vergroot bekijken"
                  >
                    <Maximize2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => handleGenerate()}
                  disabled={isGenerating}
                  className="flex-1 py-3 bg-[#1A1A1A] text-white rounded-xl text-xs font-bold hover:bg-[#D32416] transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Opnieuw genereren
                </button>
                <button 
                  onClick={() => setGeneratedImg(null)}
                  className="px-4 py-3 bg-stone-100 text-stone-600 rounded-xl text-xs font-bold hover:bg-stone-200 transition-all"
                >
                  Nieuwe opzet
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="bg-stone-50/50 p-4 rounded-2xl border border-stone-100 space-y-3 font-sans">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Te genereren output</h4>
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[8px] font-bold text-stone-400 tracking-tighter uppercase">Ready</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-y-3 gap-x-6">
                  <div className="space-y-0.5">
                    <span className="text-[8px] uppercase font-bold text-stone-300">Product</span>
                    <p className="text-[10px] font-bold text-[#1A1A1A] truncate">{selectedProduct?.name || 'Eigen upload'}</p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[8px] uppercase font-bold text-stone-300">Format</span>
                    <p className="text-[10px] font-bold text-[#1A1A1A] truncate">{format.name}</p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[8px] uppercase font-bold text-stone-300">Model</span>
                    <p className="text-[10px] font-bold text-[#1A1A1A] capitalize">{settings.modelType}</p>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[8px] uppercase font-bold text-stone-300">Kwaliteit</span>
                    <p className="text-[10px] font-bold text-[#1A1A1A]">{settings.resolution} ({settings.aspectRatio})</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleGenerate}
                  disabled={isGenerating || (!product.file && !settings.baseProductId)}
                  className="w-full relative group overflow-hidden py-10 px-6 bg-[#1A1A1A] text-white rounded-3xl flex flex-col items-center justify-center gap-4 transition-all hover:bg-[#D32416] shadow-xl disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                >
                  {isGenerating ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="w-8 h-8 text-white animate-spin" />
                      <span className="text-sm font-bold text-white/80 animate-pulse">Ontwikkelen... {elapsed}s</span>
                    </div>
                  ) : (
                    <>
                      <div className="w-14 h-14 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20 flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-inner">
                        <Sparkles className="w-8 h-8" />
                      </div>
                      <div className="text-center space-y-1">
                        <span className="block text-base font-bold tracking-tight">Genereer Foto</span>
                        <span className="block text-[10px] text-white/40 uppercase tracking-[0.2em] font-medium">
                          {(product.file || settings.baseProductId) ? `${settings.resolution} Ready` : 'Configureer eerst'}
                        </span>
                      </div>
                    </>
                  )}
                </button>

                {!isGenerating && (product.file || settings.baseProductId) && (
                  <button 
                    onClick={handleGenerateVariations}
                    className="w-full py-3 bg-stone-100 hover:bg-stone-200 text-[#1A1A1A] rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#D32416]" />
                    Genereer 3 Variaties
                  </button>
                )}
              </div>
              {error && (
                <div className="space-y-3">
                  <p className="text-xs text-red-500 font-medium bg-red-50 p-4 rounded-xl border border-red-100 flex flex-col gap-2">
                    <span className="flex items-center gap-2">
                      <X className="w-3 h-3" />
                      {error}
                    </span>
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* 5 Formats Batch Generation Section */}
      <section className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-widest text-[#1A1A1A]">Alle {PHOTOGRAPHY_FORMATS.length} Formats</h3>
          {(Object.values(allFormats) as FormatStatus[]).some(f => f.image) && !isGeneratingAll && (
            <div className="flex items-center gap-4">
              <button 
                onClick={downloadAllFormats}
                className="text-xs font-bold text-[#D32416] flex items-center gap-2 hover:underline"
              >
                <Download className="w-3 h-3" />
                Alles downloaden
              </button>
              <button 
                onClick={clearAllFormats}
                className="text-xs font-bold text-stone-400 flex items-center gap-2 hover:text-[#D32416]"
              >
                <Trash2 className="w-3 h-3" />
                Wis
              </button>
            </div>
          )}
        </div>

        {(Object.values(allFormats) as FormatStatus[]).every(f => !f.image && !f.isLoading && !f.error) ? (
          <button 
            onClick={handleGenerateAll}
            disabled={isGeneratingAll || (!product.file && !settings.baseProductId)}
            className="w-full py-10 px-6 bg-stone-50 border-2 border-dashed border-stone-200 rounded-3xl flex flex-col items-center justify-center gap-3 transition-all hover:border-[#D32416]/20 hover:bg-white disabled:opacity-50"
          >
            <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-stone-100 flex items-center justify-center text-[#D32416]">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="text-center">
              <span className="block text-sm font-bold text-[#1A1A1A]">Genereer Alle {PHOTOGRAPHY_FORMATS.length} Formats</span>
              <span className="block text-[10px] text-stone-400 uppercase tracking-widest mt-1">
                Momenten · Detail · Portret · Flatlay · Ghost
              </span>
            </div>
          </button>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {PHOTOGRAPHY_FORMATS.map((format) => {
              const data = allFormats[format.id];
              return (
                <div key={format.id} className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">{format.name}</span>
                  </div>
                  <div className="relative aspect-square rounded-2xl overflow-hidden bg-stone-50 border border-stone-100 group">
                    {data.isLoading ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 text-[#D32416] animate-spin" />
                        <span className="text-[8px] font-bold text-stone-400 uppercase tracking-widest">Laden...</span>
                      </div>
                    ) : data.error ? (
                      <div className="absolute inset-0 flex items-center justify-center p-4 text-center">
                        <p className="text-[9px] text-red-400 font-medium leading-tight">{data.error}</p>
                      </div>
                    ) : data.image ? (
                      <>
                        <img 
                          src={data.image.url} 
                          alt={format.name} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <button 
                            onClick={() => downloadImage(data.image?.url, format.name)}
                            className="p-2 bg-white rounded-full text-[#1A1A1A] hover:bg-[#D32416] hover:text-white transition-all transform hover:scale-110"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setPreviewAllImg({ url: data.image!.url, name: format.name })}
                            className="p-2 bg-white rounded-full text-[#1A1A1A] hover:bg-[#D32416] hover:text-white transition-all transform hover:scale-110"
                          >
                            <Maximize2 className="w-4 h-4" />
                          </button>
                        </div>
                      </>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Session History */}
      {history.length > 0 && (
        <section className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#1A1A1A]">Recente Generaties</h3>
            <button 
              onClick={() => { setHistory([]); localStorage.removeItem('bll_generation_history'); }}
              className="text-[10px] font-bold text-stone-400 hover:text-[#D32416] uppercase tracking-widest"
            >
              Wis geschiedenis
            </button>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {history.map((item, i) => (
              <button
                key={i}
                onClick={() => setGeneratedImg(item.image)}
                className="relative aspect-square rounded-lg overflow-hidden border border-stone-100 hover:border-[#D32416] transition-all group"
                title={`${item.formatName} - ${new Date(item.image.timestamp).toLocaleTimeString()}`}
              >
                <img src={item.image.url} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Main Prompt */}
      <section className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-widest text-[#1A1A1A]">AI Prompt</h3>
          <button 
            onClick={() => copy(prompt, 'main')}
            className="flex items-center gap-2 text-xs font-medium text-stone-500 hover:text-[#D32416] transition-colors"
          >
            {copied === 'main' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied === 'main' ? 'Gekopieerd' : 'Kopieer prompt'}
          </button>
        </div>
        <div className="bg-stone-50 p-4 rounded-xl text-sm leading-relaxed text-stone-700 italic border border-stone-100/50 min-h-[120px]">
          {prompt}
        </div>
      </section>

      {/* Negative Prompt */}
      <section className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm space-y-4 opacity-80">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-widest text-stone-400">Negative Prompt</h3>
          <button 
            onClick={() => copy(NEGATIVE_PROMPT, 'negative')}
            className="flex items-center gap-2 text-xs font-medium text-stone-500 hover:text-[#D32416] transition-colors"
          >
            {copied === 'negative' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied === 'negative' ? 'Gekopieerd' : 'Kopieer'}
          </button>
        </div>
        <div className="bg-stone-50 p-4 rounded-xl text-xs leading-relaxed text-stone-500 border border-stone-100/50">
          {NEGATIVE_PROMPT}
        </div>
      </section>

      {/* Full Combo Button */}
      <button 
        onClick={() => copy(`${prompt}\n\nNegative Prompt:\n${NEGATIVE_PROMPT}`, 'full')}
        className="w-full py-4 bg-[#1A1A1A] text-white rounded-2xl font-bold hover:bg-[#D32416] transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
      >
        {copied === 'full' ? <Check className="w-5 h-5 text-white" /> : <Copy className="w-5 h-5" />}
        {copied === 'full' ? 'Alles gekopieerd!' : 'Kopieer volledige prompt combo'}
      </button>

      {/* Tip */}
      <div className="flex items-start gap-4 p-5 bg-[#FDFDFC] rounded-2xl border border-stone-100 border-l-4 border-l-[#D32416]">
        <Info className="w-5 h-5 text-[#D32416] mt-0.5 shrink-0" />
        <p className="text-xs text-stone-600 leading-relaxed">
          <span className="font-bold text-[#1A1A1A]">Tip:</span> upload eerst je productafbeelding, kies daarna een vast format. Zo blijft je merk herkenbaar, maar voelt elke foto toch anders.
        </p>
      </div>
      {/* Full-screen Image Preview Overlay */}
      <AnimatePresence>
        {isPreviewOpen && generatedImg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1A1A]/95 p-4 sm:p-10 backdrop-blur-sm"
            onClick={() => setIsPreviewOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative max-w-full max-h-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsPreviewOpen(false)}
                className="absolute -top-12 sm:-top-16 right-0 text-white/60 hover:text-white transition-colors p-2"
              >
                <X className="w-8 h-8" />
              </button>

              <div className="absolute -top-12 sm:-top-16 left-0 flex items-center gap-4">
                <button
                  onClick={downloadImage}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full text-xs font-bold transition-all backdrop-blur-md border border-white/10"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>

              <img
                src={generatedImg.url}
                alt="Product Preview Full"
                className="max-w-full max-h-[80vh] sm:max-h-[85vh] object-contain rounded-lg shadow-2xl"
                referrerPolicy="no-referrer"
              />
              
              <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 text-center w-full">
                <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold">
                  {settings.designName || 'BLL-DESIGN'} • {settings.resolution}
                </p>
                <p className="text-white/20 text-[8px] mt-2">
                  Druk op ESC om te sluiten
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Batch Preview Overlay */}
      <AnimatePresence>
        {previewAllImg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A1A1A]/95 p-4 sm:p-10 backdrop-blur-sm"
            onClick={() => setPreviewAllImg(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative max-w-full max-h-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setPreviewAllImg(null)}
                className="absolute -top-12 sm:-top-16 right-0 text-white/60 hover:text-white transition-colors p-2"
              >
                <X className="w-8 h-8" />
              </button>

              <div className="absolute -top-12 sm:-top-16 left-0 flex items-center gap-4">
                <button
                  onClick={() => downloadImage(previewAllImg.url, previewAllImg.name)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full text-xs font-bold transition-all backdrop-blur-md border border-white/10"
                >
                  <Download className="w-4 h-4" />
                  Download {previewAllImg.name}
                </button>
              </div>

              <img
                src={previewAllImg.url}
                alt={previewAllImg.name}
                className="max-w-full max-h-[80vh] sm:max-h-[85vh] object-contain rounded-lg shadow-2xl"
                referrerPolicy="no-referrer"
              />
              
              <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 text-center w-full">
                <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold">
                  {previewAllImg.name} • {settings.designName || 'BLL-DESIGN'}
                </p>
                <p className="text-white/20 text-[8px] mt-2">
                  Druk op ESC om te sluiten
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
