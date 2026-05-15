
import React from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { PromptSettings, ModelType, Position, Environment, Mood, AspectRatio, Resolution, LibraryProduct, PrintTechnique, AIProvider } from '../types';
import { COLORS, PRINT_TECHNIQUES } from '../lib/constants';
import { cn } from '../lib/utils';

interface Props {
  settings: PromptSettings;
  onUpdate: (settings: PromptSettings) => void;
  library?: LibraryProduct[];
}

const OptionRow = ({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) => (
  <div className={cn("space-y-1.5", className)}>
    <label className="text-[10px] uppercase tracking-wider font-bold text-stone-400">{label}</label>
    {children}
  </div>
);

const Select = ({ value, options, onChange, displayMap }: { value: string; options: string[]; onChange: (v: any) => void; displayMap?: Record<string, string> }) => (
  <select 
    value={value} 
    onChange={(e) => onChange(e.target.value)}
    className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#D32416]/50 focus:border-[#D32416] transition-all appearance-none cursor-pointer"
    style={{ backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1rem' }}
  >
    {options.map(opt => <option key={opt} value={opt}>{displayMap ? displayMap[opt] || opt : opt}</option>)}
  </select>
);

export default function SettingsPanel({ settings, onUpdate, library }: Props) {
  const selectedProduct = settings.baseProductId ? library?.find(p => p.id === settings.baseProductId) : null;
  const filteredColors = selectedProduct?.availableColors 
    ? COLORS.filter(c => selectedProduct.availableColors?.includes(c.id))
    : COLORS;

  const update = <K extends keyof PromptSettings>(key: K, value: PromptSettings[K]) => {
    onUpdate({ ...settings, [key]: value });
  };

  const printTechniqueLabels = PRINT_TECHNIQUES.reduce((acc, tech) => ({ ...acc, [tech.id]: tech.name }), {});

  return (
    <div className="space-y-6" id="settings-panel">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="text-[#D32416] w-5 h-5" />
          <h3 className="font-semibold text-[#1A1A1A]">3. Instellingen</h3>
        </div>
        <div className="flex bg-stone-100 p-1 rounded-lg">
          {(['google', 'openai'] as AIProvider[]).map((p) => (
            <button
              key={p}
              onClick={() => update('provider', p)}
              className={cn(
                "px-3 py-1 text-[10px] uppercase tracking-widest font-bold rounded-md transition-all",
                settings.provider === p 
                  ? "bg-white text-[#D32416] shadow-sm" 
                  : "text-stone-400 hover:text-stone-600"
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-stone-50/50 p-5 rounded-2xl border border-stone-100 space-y-4">
        <OptionRow label="Design Naam">
          <input 
            type="text"
            value={settings.designName || ''}
            onChange={(e) => update('designName', e.target.value)}
            placeholder="Bijv. Classic Logo 2026"
            className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#D32416]/50 focus:border-[#D32416] transition-all"
          />
        </OptionRow>

        <div className="grid grid-cols-2 gap-4">
          <OptionRow label="Model type">
            <Select 
              value={settings.modelType} 
              options={['male', 'female', 'androgynous', 'no model']} 
              onChange={(v) => update('modelType', v as ModelType)} 
            />
          </OptionRow>

          <OptionRow label="Positie">
            <Select 
              value={settings.position} 
              options={['front', 'back', 'side', 'close-up']} 
              onChange={(v) => update('position', v as Position)} 
            />
          </OptionRow>

          <OptionRow label="Omgeving">
            <Select 
              value={settings.environment} 
              options={['indoor minimal', 'outdoor golden hour', 'beach / sand tones', 'city calm', 'neutral studio with natural light']} 
              onChange={(v) => update('environment', v as Environment)} 
            />
          </OptionRow>

          <OptionRow label="Mood">
            <Select 
              value={settings.mood} 
              options={['calm', 'reflective', 'confident', 'soft', 'grounded']} 
              onChange={(v) => update('mood', v as Mood)} 
            />
          </OptionRow>

          <OptionRow label="Aspect ratio">
            <Select 
              value={settings.aspectRatio} 
              options={['3:4', '4:5', '1:1']} 
              onChange={(v) => update('aspectRatio', v as AspectRatio)} 
            />
          </OptionRow>

          <OptionRow label="Resolutie">
            <Select 
              value={settings.resolution} 
              options={['HD', '2K', '4K']} 
              onChange={(v) => update('resolution', v as Resolution)} 
            />
          </OptionRow>
        </div>

        <div className="pt-2 border-t border-stone-100">
          <OptionRow label="Druktechniek">
            <Select 
              value={settings.printTechnique || 'none'} 
              options={PRINT_TECHNIQUES.map(t => t.id)} 
              onChange={(v) => update('printTechnique', v as PrintTechnique)} 
              displayMap={printTechniqueLabels}
            />
            {settings.printTechnique && settings.printTechnique !== 'none' && (
              <p className="text-[10px] text-stone-500 mt-1 italic italic">
                {PRINT_TECHNIQUES.find(t => t.id === settings.printTechnique)?.description}
              </p>
            )}
          </OptionRow>
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-[10px] uppercase tracking-wider font-bold text-stone-400">Garment Kleur</label>
        <div className="grid grid-cols-7 gap-2">
          {filteredColors.map((color) => (
            <button
              key={color.id}
              onClick={() => update('color', color.name)}
              className={cn(
                "w-full aspect-square rounded-full border-2 transition-all relative group",
                settings.color === color.name 
                  ? "border-[#D32416] scale-110 shadow-sm" 
                  : "border-transparent hover:border-stone-200"
              )}
              title={color.name}
            >
              <div 
                className="w-full h-full rounded-full border border-black/5"
                style={{ backgroundColor: color.hex }}
              />
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-black text-white text-[8px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                {color.name}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
