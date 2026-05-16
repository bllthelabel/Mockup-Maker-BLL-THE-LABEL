
import { PhotographyFormat } from '../types';
import { PHOTOGRAPHY_FORMATS } from '../lib/constants';
import { Camera, Search, Box, User, UserCircle, Smile, Shirt } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface Props {
  selectedId: string;
  onSelect: (id: string) => void;
}

const IconMap = {
  Search,
  Box,
  User,
  UserCircle,
  Camera,
  Smile,
  Shirt
};

export default function FormatSelector({ selectedId, onSelect }: Props) {
  return (
    <div className="space-y-4" id="format-selector">
      <div className="flex items-center gap-2 mb-2">
        <Camera className="text-[#D32416] w-5 h-5" />
        <h3 className="font-semibold text-[#1A1A1A]">2. Fotografie format</h3>
      </div>
      
      <div className="grid gap-3">
        {PHOTOGRAPHY_FORMATS.map((format) => {
          const IconComponent = (IconMap as any)[format.icon || 'Camera'] || Camera;
          return (
            <motion.button
              key={format.id}
              whileHover={{ x: 4 }}
              onClick={() => onSelect(format.id)}
              className={cn(
                "text-left p-4 rounded-3xl border transition-all relative overflow-hidden group flex items-start gap-4",
                selectedId === format.id 
                  ? "border-[#D32416] bg-[#D32416]/5 ring-1 ring-[#D32416]" 
                  : "border-stone-100 bg-white hover:border-stone-200 shadow-sm"
              )}
            >
              <div className={cn(
                "p-3 rounded-2xl transition-colors",
                selectedId === format.id ? "bg-[#D32416] text-white" : "bg-stone-50 text-stone-400 group-hover:text-stone-600"
              )}>
                <IconComponent className="w-5 h-5" />
              </div>
              
              <div className="flex-1">
                <h4 className={cn(
                  "text-sm font-bold transition-colors",
                  selectedId === format.id ? "text-[#D32416]" : "text-[#1A1A1A]"
                )}>
                  {format.name}
                </h4>
                <p className="text-[11px] text-stone-500 leading-relaxed mt-0.5">
                  {format.description}
                </p>
              </div>

              {selectedId === format.id && (
                <motion.div 
                  layoutId="active-format-indicator"
                  className="absolute left-0 top-0 bottom-0 w-1 bg-[#D32416]"
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
