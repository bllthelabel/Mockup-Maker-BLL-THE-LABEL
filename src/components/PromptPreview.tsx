
import { Copy, Check, Info, Sparkles, Loader2, Download, Maximize2, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NEGATIVE_PROMPT } from '../lib/constants';
import { generateImage } from '../services/aiService';
import { PromptSettings, UploadedProduct, GeneratedImage, LibraryProduct } from '../types';

interface Props {
  prompt: string;
  settings: PromptSettings;
  product: UploadedProduct;
  library: LibraryProduct[];
}

export default function PromptPreview({ prompt, settings, product, library }: Props) {
  const [copied, setCopied] = useState<'main' | 'negative' | 'full' | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImg, setGeneratedImg] = useState<GeneratedImage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Close preview on escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsPreviewOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const copy = async (text: string, type: 'main' | 'negative' | 'full') => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleGenerate = async () => {
    if (!product.file && !settings.baseProductId) {
      setError("Upload eerst een productafbeelding of kies een basisproduct uit de bibliotheek.");
      return;
    }

    // Check for API key if using high-res models
    try {
      const aistudio = (window as any).aistudio;
      if (aistudio && typeof aistudio.hasSelectedApiKey === 'function') {
        const hasKey = await aistudio.hasSelectedApiKey();
        if (!hasKey) {
          setError("Voor HD, 2K en 4K generatie is een eigen Gemini API Key vereist.");
          if (typeof aistudio.openSelectKey === 'function') {
            await aistudio.openSelectKey();
          }
          return; // Stop here if key selection was prompted
        }
      }
    } catch (err) {
      console.warn("Key selection check failed, proceeding anyway", err);
    }
    
    setIsGenerating(true);
    setError(null);
    try {
      const result = await generateImage(prompt, settings, product, library);
      setGeneratedImg(result);
    } catch (err: any) {
      console.error("Generation error:", err);
      let errorMsg = err.message || "";
      
      // Handle the case where the server returns a 502/HTML error page
      if (errorMsg.includes("<html>") || errorMsg.includes("502") || errorMsg.includes("Bad Gateway")) {
        errorMsg = "De server is tijdelijk onbereikbaar (502). Probeer het over enkele ogenblikken opnieuw. Als dit blijft gebeuren, controleer dan of je API key nog geldig is of verlaag de resolutie (bijv. naar HD).";
      }

      if (errorMsg.includes("Requested entity was not found") || errorMsg.includes("PERMISSION_DENIED") || errorMsg.includes("403")) {
        setError("Toegang geweigerd of model niet beschikbaar. Zorg ervoor dat je een API key hebt geselecteerd met de juiste rechten en dat de regio wordt ondersteund.");
        const aistudio = (window as any).aistudio;
        if (aistudio && typeof aistudio.openSelectKey === 'function') {
          await aistudio.openSelectKey();
        }
      } else if (errorMsg.includes("quota") || errorMsg.includes("limit")) {
        setError("Je hebt je quota bereikt voor de Gemini API. Probeer het later opnieuw of gebruik een andere API key.");
      } else {
        setError(errorMsg || "Er is iets misgegaan bij het genereren.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const resetAndRetry = () => {
    setGeneratedImg(null);
    setError(null);
    handleGenerate();
  };

  const downloadImage = () => {
    if (!generatedImg) return;
    
    const selectedProduct = settings.baseProductId ? library.find(p => p.id === settings.baseProductId) : null;
    const productName = selectedProduct ? selectedProduct.name.replace(/\s+/g, '-') : 'Unknown-Product';
    const colorName = settings.color ? settings.color.replace(/\s+/g, '-') : 'Original';
    const designName = settings.designName ? settings.designName.trim().replace(/\s+/g, '-') : 'Design';
    
    const filename = `BLL-THE-LABEL-${designName}-${productName}-${colorName}-${Date.now()}.png`;
    
    const link = document.createElement('a');
    link.href = generatedImg.url;
    link.download = filename;
    link.click();
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
              <button 
                onClick={() => setGeneratedImg(null)}
                className="text-xs font-bold text-[#D32416] hover:underline"
              >
                Opnieuw genereren
              </button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <button 
                onClick={handleGenerate}
                disabled={isGenerating || (!product.file && !settings.baseProductId)}
                className="w-full relative group overflow-hidden py-8 px-6 bg-stone-50 border-2 border-dashed border-stone-200 rounded-3xl flex flex-col items-center justify-center gap-3 transition-all hover:border-[#D32416]/20 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-8 h-8 text-[#D32416] animate-spin" />
                    <span className="text-sm font-bold text-stone-600 animate-pulse">Foto wordt ontwikkeld...</span>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-stone-100 flex items-center justify-center text-[#D32416] group-hover:scale-110 transition-transform">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div className="text-center">
                      <span className="block text-sm font-bold text-[#1A1A1A]">Genereer Foto</span>
                      <span className="block text-[10px] text-stone-400 uppercase tracking-widest mt-1">
                        {(product.file || settings.baseProductId) ? `${settings.resolution} Ready` : 'Kies content'}
                      </span>
                    </div>
                  </>
                )}
              </button>
              {error && (
                <p className="text-xs text-red-500 font-medium bg-red-50 p-3 rounded-lg border border-red-100">
                  {error}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </section>

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
    </div>
  );
}
