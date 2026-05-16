
import { Copy, Check, Info, Sparkles, Loader2, Download, Maximize2, X, Trash2, Zap, History, Layers, Image as ImageIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NEGATIVE_PROMPT, PHOTOGRAPHY_FORMATS } from '../lib/constants';
import { generateImage } from '../services/aiService';
import { generatePrompt } from '../lib/generatePrompt';
import { PhotographyFormat, PromptSettings, UploadedProduct, GeneratedImage, LibraryProduct } from '../types';
import { Button, Badge, Card, CardHeader, CardContent, Divider } from './ui';
import { cn } from '../lib/utils';

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

  const [activeView, setActiveView] = useState<'latest' | 'history' | 'batch'>('latest');

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

  const parseError = (err: any, provider: 'google' | 'openai'): string => {
    console.error("Generation error:", err);
    let errorMsg = err.message || "";
    if (errorMsg.includes("<html>") || errorMsg.includes("502") || errorMsg.includes("Bad Gateway")) return "Server onbereikbaar (502).";
    if (errorMsg.includes("quota") || errorMsg.includes("limit")) return "Quota bereikt.";
    return errorMsg.slice(0, 100) || "Generatie mislukt.";
  };

  const handleGenerate = async () => {
    if (!product.file && !settings.baseProductId) {
      setError("Selecteer eerst een ontwerp.");
      return;
    }
    setIsGenerating(true);
    setError(null);
    setActiveView('latest');
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

  const downloadImage = (url?: string, label?: string) => {
    const finalUrl = url || generatedImg?.url;
    if (!finalUrl) return;
    const filename = `BLL-${settings.designName || 'DESIGN'}-${Date.now()}.png`;
    const link = document.createElement('a');
    link.href = finalUrl;
    link.download = filename;
    link.click();
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative bg-zinc-50">
      <AnimatePresence mode="wait">
        {isGenerating ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-3"
          >
            <div className="relative">
              <Loader2 className="w-10 h-10 text-accent animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-1 h-1 bg-accent rounded-full animate-ping" />
              </div>
            </div>
            <div className="text-center">
              <p className="text-xs font-bold text-text-primary uppercase tracking-widest">Ontwikkelen...</p>
              <p className="text-[10px] text-text-tertiary font-mono mt-1">{elapsed}s verstreken</p>
            </div>
          </motion.div>
        ) : error ? (
          <motion.div 
            key="error"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 text-center"
          >
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-3">
              <X className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-sm font-semibold text-text-primary">Oeps!</p>
            <p className="text-xs text-text-tertiary mt-1 mb-4">{error}</p>
            <Button variant="secondary" size="sm" onClick={handleGenerate}>Probeer opnieuw</Button>
          </motion.div>
        ) : generatedImg ? (
          <motion.div 
            key="result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full h-full group"
          >
            <img 
              src={generatedImg.url} 
              className="w-full h-full object-cover cursor-zoom-in" 
              onClick={() => setIsPreviewOpen(true)}
              referrerPolicy="no-referrer"
            />
            <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
              <Button size="sm" variant="secondary" className="h-8 w-8 p-0 rounded-full shadow-lg" onClick={() => downloadImage()}>
                <Download className="w-3.5 h-3.5" />
              </Button>
              <Button size="sm" variant="secondary" className="h-8 w-8 p-0 rounded-full shadow-lg" onClick={() => setIsPreviewOpen(true)}>
                <Maximize2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center gap-4 p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-surface border border-border-strong/10 shadow-sm flex items-center justify-center text-text-tertiary">
              <ImageIcon className="w-8 h-8 opacity-20" />
            </div>
            <div>
              <p className="text-sm font-semibold text-text-secondary">Wachtend op input</p>
              <p className="text-xs text-text-tertiary mt-1">Configureer je stijl en druk op genereer</p>
            </div>
            <Button variant="primary" size="md" onClick={handleGenerate} className="mt-2">
              <Zap className="w-4 h-4 fill-white" />
              Genereer nu
            </Button>
          </div>
        )}
      </AnimatePresence>

      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-center gap-2">
        <div className="flex bg-surface/50 backdrop-blur-md border border-border/50 rounded-full p-1 shadow-sm">
          <button 
            onClick={handleGenerate}
            disabled={isGenerating || (!product.file && !settings.baseProductId)}
            className="h-7 px-3 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-text-secondary hover:text-accent disabled:opacity-50 transition-colors"
          >
            <Sparkles className="w-3 h-3" />
            Variatie
          </button>
          <div className="w-[1px] bg-border/50 mx-1" />
          <button 
            onClick={() => copy(prompt, 'main')}
            className="h-7 px-3 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-text-secondary hover:text-text-primary transition-colors"
          >
            {copied === 'main' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            Copy
          </button>
        </div>
      </div>

      {/* Overlay Modal */}
      <AnimatePresence>
        {isPreviewOpen && generatedImg && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/95 p-4 backdrop-blur-sm"
            onClick={() => setIsPreviewOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="relative max-w-full max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setIsPreviewOpen(false)}
                className="absolute -top-12 right-0 text-white hover:text-accent p-2"
              >
                <X className="w-6 h-6" />
              </button>
              <img src={generatedImg.url} className="max-w-full max-h-[85vh] rounded-lg shadow-2xl border border-white/10" referrerPolicy="no-referrer" />
              <div className="mt-4 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-white">{settings.designName || 'Branding Design'}</p>
                  <Badge variant="outline" className="text-white/50 border-white/20">{settings.resolution} • {format.name}</Badge>
                </div>
                <Button variant="primary" onClick={() => downloadImage()}>
                  <Download className="w-4 h-4" />
                  Download PNG
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
