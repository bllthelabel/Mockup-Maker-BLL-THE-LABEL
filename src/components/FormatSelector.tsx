
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
    <div className="grid grid-cols-3 xl:grid-cols-4 gap-2" id="format-selector">
      {PHOTOGRAPHY_FORMATS.map((format) => {
        const IconComponent = (IconMap as any)[format.icon || 'Camera'] || Camera;
        const isSelected = selectedId === format.id;
        return (
          <button
            key={format.id}
            onClick={() => onSelect(format.id)}
            className={cn(
              "text-center p-2 rounded-xl border transition-all relative overflow-hidden group flex flex-col items-center gap-1.5",
              isSelected 
                ? "border-[#D32416] bg-[#D32416]/5 ring-1 ring-[#D32416]/20" 
                : "border-stone-100 bg-white hover:border-stone-200 shadow-xs"
            )}
          >
            <div className={cn(
              "p-1.5 rounded-lg transition-colors shrink-0",
              isSelected ? "bg-[#D32416] text-white" : "bg-stone-50 text-stone-400 group-hover:text-stone-600"
            )}>
              <IconComponent className="w-3 h-3" />
            </div>
            
            <div className="w-full">
              <h4 className={cn(
                "text-[8px] font-black uppercase tracking-tight transition-colors truncate",
                isSelected ? "text-[#D32416]" : "text-[#1A1A1A]"
              )}>
                {format.name}
              </h4>
            </div>
          </button>
        );
      })}
    </div>
  );
}
