
import { PhotographyFormat } from '../types';
import { PHOTOGRAPHY_FORMATS } from '../lib/constants';
import { Camera } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface Props {
  selectedId: string;
  onSelect: (id: string) => void;
}

export default function FormatSelector({ selectedId, onSelect }: Props) {
  return (
    <div className="space-y-4" id="format-selector">
      <div className="flex items-center gap-2 mb-2">
        <Camera className="text-[#D32416] w-5 h-5" />
        <h3 className="font-semibold text-[#1A1A1A]">2. Fotografie format</h3>
      </div>
      
      <div className="grid gap-3">
        {PHOTOGRAPHY_FORMATS.map((format) => (
          <motion.button
            key={format.id}
            whileHover={{ x: 4 }}
            onClick={() => onSelect(format.id)}
            className={cn(
              "text-left p-4 rounded-xl border transition-all relative overflow-hidden group",
              selectedId === format.id 
                ? "border-[#D32416] bg-[#D32416]/5 ring-1 ring-[#D32416]" 
                : "border-stone-200 bg-white hover:border-stone-300"
            )}
          >
            <div className="flex items-center justify-between mb-1">
              <h4 className={cn(
                "font-bold transition-colors",
                selectedId === format.id ? "text-[#D32416]" : "text-[#1A1A1A]"
              )}>
                {format.name}
              </h4>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              {format.description}
            </p>
            {selectedId === format.id && (
              <motion.div 
                layoutId="active-format-indicator"
                className="absolute left-0 top-0 bottom-0 w-1 bg-[#D32416]"
              />
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
