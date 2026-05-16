
import React, { useState, useMemo } from 'react';
import { SlidersHorizontal, Save, ChevronDown, ChevronUp, Search, Info } from 'lucide-react';
import { PromptSettings, ModelType, Position, Environment, Mood, AspectRatio, Resolution, LibraryProduct, PrintTechnique, AIProvider, ColorOption } from '../types';
import { COLORS, PRINT_TECHNIQUES } from '../lib/constants';
import { cn } from '../lib/utils';

interface Props {
  settings: PromptSettings;
  onUpdate: (settings: PromptSettings) => void;
  library?: LibraryProduct[];
  selectedFormatId?: string;
}

const OptionRow = ({ label, children, className, disabled, info }: { label: string; children: React.ReactNode; className?: string; disabled?: boolean; info?: string }) => (
  <div className={cn("space-y-1.5 transition-opacity", className, disabled && "opacity-50 pointer-events-none")}>
    <div className="flex items-center gap-1.5">
      <label className="text-[10px] uppercase tracking-wider font-bold text-stone-400">{label}</label>
      {info && (
        <div className="group relative">
          <Info className="w-3 h-3 text-stone-300 cursor-help" />
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-stone-800 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
            {info}
          </div>
        </div>
      )}
    </div>
    {children}
  </div>
);

const Select = ({ value, options, onChange, displayMap, disabled, className }: { value: string; options: string[]; onChange: (v: any) => void; displayMap?: Record<string, string>; disabled?: boolean; className?: string }) => (
  <select 
    value={value} 
    onChange={(e) => onChange(e.target.value)}
    disabled={disabled}
    className={cn(
      "w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#D32416]/50 focus:border-[#D32416] transition-all appearance-none",
      className,
      disabled ? "cursor-not-allowed bg-stone-50" : "cursor-pointer"
    )}
    style={{ backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1rem' }}
  >
    {options.map(opt => <option key={opt} value={opt}>{displayMap ? displayMap[opt] || opt : opt}</option>)}
  </select>
);

const Section = ({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-stone-100 last:border-0 overflow-hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-4 group"
      >
        <h4 className="text-xs font-bold uppercase tracking-widest text-[#1A1A1A] group-hover:text-[#D32416] transition-colors">{title}</h4>
        {isOpen ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
      </button>
      {isOpen && (
        <div className="pb-6 animate-in fade-in slide-in-from-top-1 duration-200">
          {children}
        </div>
      )}
    </div>
  );
};

export default function SettingsPanel({ settings, onUpdate, library, selectedFormatId }: Props) {
  const [colorSearch, setColorSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const selectedProduct = settings.baseProductId ? library?.find(p => p.id === settings.baseProductId) : null;
  const filteredColors = useMemo(() => {
    let list = selectedProduct?.availableColors 
      ? COLORS.filter(c => selectedProduct.availableColors?.includes(c.id))
      : COLORS;
    
    if (colorSearch) {
      list = list.filter(c => c.name.toLowerCase().includes(colorSearch.toLowerCase()));
    }

    if (activeCategory) {
      list = list.filter(c => c.category === activeCategory);
    }
    
    return list;
  }, [selectedProduct, colorSearch, activeCategory]);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    COLORS.forEach(c => { if (c.category) cats.add(c.category); });
    return Array.from(cats);
  }, []);

  const isNoModelFormat = selectedFormatId ? ['foto_1', 'foto_2', 'foto_7'].includes(selectedFormatId) : false;
  const effectiveModelType = isNoModelFormat ? 'no model' : settings.modelType;

  const update = <K extends keyof PromptSettings>(key: K, value: PromptSettings[K]) => {
    onUpdate({ ...settings, [key]: value });
  };

  const printTechniqueLabels = PRINT_TECHNIQUES.reduce((acc, tech) => ({ ...acc, [tech.id]: tech.name }), {});

  const [presets, setPresets] = useState<Record<string, PromptSettings>>({});

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem('setting_presets');
      if (saved) setPresets(JSON.parse(saved));
    } catch (e) {
      console.warn('Failed to load presets from localStorage', e);
    }
  }, []);

  const savePreset = () => {
    const name = prompt("Geef deze preset een naam:");
    if (name) {
      const nextPresets = { ...presets, [name]: settings };
      setPresets(nextPresets);
      try {
        localStorage.setItem('setting_presets', JSON.stringify(nextPresets));
        alert(`Preset "${name}" opgeslagen!`);
      } catch (e) {
        console.error('Failed to save preset', e);
      }
    }
  };

  return (
    <div className="space-y-6" id="settings-panel">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="text-[#D32416] w-5 h-5" />
          <h3 className="font-semibold text-[#1A1A1A]">3. Instellingen</h3>
        </div>
        <div className="flex bg-stone-100 p-1 rounded-lg">
          {(['google', 'openai'] as const).map((p) => (
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

      <div className="bg-white p-3 rounded-2xl border border-stone-100 shadow-sm divide-y divide-stone-50">
        <Section title="Model & Compositie" defaultOpen>
          <div className="space-y-3 pt-1">
            <OptionRow label="Design Naam">
              <input 
                type="text"
                value={settings.designName || ''}
                onChange={(e) => update('designName', e.target.value)}
                placeholder="Bijv. Classic Logo"
                className="w-full bg-stone-50/50 border border-stone-200 rounded-lg px-2 py-1.5 text-[11px] text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#D32416]/50 focus:border-[#D32416] transition-all"
              />
            </OptionRow>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <OptionRow label="Model" disabled={isNoModelFormat}>
                <Select 
                  value={effectiveModelType} 
                  options={['male', 'female', 'androgynous', 'no model']} 
                  onChange={(v) => update('modelType', v as ModelType)} 
                  disabled={isNoModelFormat}
                  className="py-1 text-[10px]"
                />
              </OptionRow>

              <OptionRow label="Positie">
                <Select 
                  value={settings.position} 
                  options={['front', 'back', 'side', 'close-up']} 
                  onChange={(v) => update('position', v as Position)} 
                  className="py-1 text-[10px]"
                />
              </OptionRow>

              <OptionRow label="Omgeving">
                <Select 
                  value={settings.environment} 
                  options={['indoor minimal', 'outdoor golden hour', 'beach / sand tones', 'city calm', 'neutral studio with natural light', 'neutrale fotostudio met passend licht']} 
                  onChange={(v) => update('environment', v as Environment)} 
                  className="py-1 text-[10px]"
                />
              </OptionRow>

              <OptionRow label="Mood">
                <Select 
                  value={settings.mood} 
                  options={['calm', 'reflective', 'confident', 'soft', 'grounded', 'ontspannen']} 
                  onChange={(v) => update('mood', v as Mood)} 
                  className="py-1 text-[10px]"
                />
              </OptionRow>
            </div>
          </div>
        </Section>

        <Section title="Kleur & Techniek">
          <div className="grid grid-cols-1 xl:grid-cols-[200px,1fr] gap-3 pt-2">
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 text-stone-400" />
                <input 
                  type="text"
                  value={colorSearch}
                  onChange={(e) => setColorSearch(e.target.value)}
                  placeholder="Zoek kleur..."
                  className="w-full bg-stone-50 border border-stone-200 rounded-lg pl-7 pr-2 py-1 text-[9px] text-[#1A1A1A] focus:outline-none focus:border-[#D32416]/30"
                />
              </div>
              <div className="flex flex-wrap gap-1 max-h-[100px] overflow-y-auto pr-1">
                <button 
                  onClick={() => setActiveCategory(null)}
                  className={cn(
                    "px-1 py-0.5 text-[7px] font-bold uppercase tracking-widest rounded transition-all border",
                    !activeCategory ? "bg-[#D32416] text-white border-[#D32416]" : "bg-white text-stone-400 border-stone-100 hover:border-stone-200"
                  )}
                >
                  Alles
                </button>
                {categories.map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={cn(
                      "px-1 py-0.5 text-[7px] font-bold uppercase tracking-widest rounded transition-all border",
                      activeCategory === cat ? "bg-[#D32416] text-white border-[#D32416]" : "bg-white text-stone-400 border-stone-100 hover:border-stone-200"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-10 gap-1 max-h-[100px] overflow-y-auto p-0.5 scrollbar-thin">
                {filteredColors.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => update('color', color.name)}
                    className={cn(
                      "w-full aspect-square rounded-md border transition-all relative group flex items-center justify-center",
                      settings.color === color.name 
                        ? "border-[#D32416] bg-[#D32416]/5 shadow-sm" 
                        : "border-stone-50 hover:border-stone-200"
                    )}
                    title={color.name}
                  >
                    <div 
                      className="w-2.5 h-2.5 rounded-full border border-black/5"
                      style={{ backgroundColor: color.hex }}
                    />
                  </button>
                ))}
              </div>
              
              <OptionRow label="Druktechniek">
                <Select 
                  value={settings.printTechnique || 'none'} 
                  options={PRINT_TECHNIQUES.map(t => t.id)} 
                  onChange={(v) => update('printTechnique', v as PrintTechnique)} 
                  displayMap={printTechniqueLabels}
                  className="py-1 text-[10px]"
                />
              </OptionRow>
            </div>
          </div>
        </Section>

        <Section title="Resolutie">
          <div className="grid grid-cols-2 gap-3 pt-2">
            <OptionRow label="Aspect ratio">
              <Select 
                value={settings.aspectRatio} 
                options={['3:4', '4:5', '1:1']} 
                onChange={(v) => update('aspectRatio', v as AspectRatio)} 
                className="py-1.5 text-[11px]"
              />
            </OptionRow>

            <OptionRow label="Resolutie">
              <Select 
                value={settings.resolution} 
                options={['HD', '2K', '4K']} 
                onChange={(v) => update('resolution', v as Resolution)} 
                className="py-1.5 text-[11px]"
              />
            </OptionRow>
          </div>
        </Section>
      </div>

      <div className="pt-2">
        <label className="text-[10px] uppercase tracking-wider font-bold text-stone-400">Presets</label>
        <div className="flex gap-2 mt-1.5">
          <button
            onClick={savePreset}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-lg text-xs font-medium transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            Vastzetten
          </button>
          
          <Select 
            value="" 
            options={['', ...Object.keys(presets)]} 
            onChange={(name) => {
              if (name && presets[name]) {
                onUpdate(presets[name]);
              }
            }}
            displayMap={{ '': 'Laden...' }}
            className="flex-1"
          />
        </div>
      </div>
    </div>
  );
}
