
import React from 'react';
import { UploadedProduct } from '../types';
import { Image as ImageIcon, X, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  product: UploadedProduct;
  onUpload: (product: UploadedProduct) => void;
}

export default function ProductUploader({ product, onUpload }: Props) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      onUpload({ file, previewUrl, mimeType: file.type, isLibraryImage: false });
    }
  };

  const clearUpload = () => {
    if (product.previewUrl && !product.isLibraryImage) URL.revokeObjectURL(product.previewUrl);
    onUpload({ file: null, previewUrl: null, mimeType: null });
  };

  return (
    <div className="space-y-4" id="uploader-container">
      <div className="flex items-center gap-2 mb-2">
        <ImageIcon className="text-[#D32416] w-5 h-5" />
        <h3 className="font-semibold text-[#1A1A1A]">1. Product afbeelding (ontwerp)</h3>
      </div>
      
      <AnimatePresence mode="wait">
        {product.previewUrl && !product.isLibraryImage ? (
          <motion.div 
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative aspect-square rounded-xl overflow-hidden bg-stone-100 border border-stone-200"
          >
            <img 
              src={product.previewUrl} 
              alt="Product preview" 
              className="w-full h-full object-contain"
            />
            <button 
              onClick={clearUpload}
              className="absolute top-2 right-2 p-1.5 bg-white/80 backdrop-blur-sm rounded-full text-[#1A1A1A] hover:bg-[#D32416] hover:text-white transition-colors shadow-sm"
              title="Verwijder afbeelding"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ) : (
          <motion.label 
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center aspect-square rounded-xl border-2 border-dashed border-stone-200 bg-stone-50/50 cursor-pointer hover:bg-stone-50 hover:border-[#D32416]/30 transition-all group"
          >
            <Upload className="w-8 h-8 text-stone-400 group-hover:text-[#D32416] transition-colors mb-3" />
            <span className="text-sm font-medium text-stone-600 group-hover:text-[#1A1A1A]">Klik of sleep naar hier</span>
            <span className="text-xs text-stone-400 mt-1">Sla jouw unieke ontwerp/print op</span>
            <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
          </motion.label>
        )}
      </AnimatePresence>
    </div>
  );
}
