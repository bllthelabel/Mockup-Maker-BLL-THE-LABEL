
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
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2" id="format-selector">
      {PHOTOGRAPHY_FORMATS.map((format) => {
        const IconComponent = (IconMap as any)[format.icon || 'Camera'] || Camera;
        const isSelected = selectedId === format.id;
        return (
          <button
            key={format.id}
            onClick={() => onSelect(format.id)}
            className={cn(
              "text-center p-3 rounded-lg border transition-all relative overflow-hidden group flex flex-col items-center gap-2",
              isSelected 
                ? "border-accent bg-accent-muted ring-2 ring-accent/10" 
                : "border-border bg-surface hover:border-border-strong shadow-xs"
            )}
          >
            <div className={cn(
              "p-2 rounded-md transition-colors shrink-0",
              isSelected ? "bg-accent text-white" : "bg-zinc-50 text-text-tertiary group-hover:text-text-secondary"
            )}>
              <IconComponent className="w-4 h-4" />
            </div>
            
            <div className="w-full text-center">
              <h4 className={cn(
                "text-[10px] font-bold uppercase tracking-tight transition-colors truncate",
                isSelected ? "text-accent" : "text-text-primary"
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

