
import React, { useState, useMemo } from 'react';
import { SlidersHorizontal, Save, ChevronDown, ChevronUp, Search, Info, Settings2, Sparkles } from 'lucide-react';
import { PromptSettings, ModelType, Position, Environment, Mood, AspectRatio, Resolution, LibraryProduct, PrintTechnique, AIProvider, ColorOption } from '../types';
import { COLORS, PRINT_TECHNIQUES } from '../lib/constants';
import { cn } from '../lib/utils';
import { Label, Select, Input, Badge, Button, Divider } from './ui';

interface Props {
  settings: PromptSettings;
  onUpdate: (settings: PromptSettings) => void;
  library?: LibraryProduct[];
  selectedFormatId?: string;
}

const OptionGroup = ({ label, children, className, disabled, info }: { label: string; children: React.ReactNode; className?: string; disabled?: boolean; info?: string }) => (
  <div className={cn("space-y-1.5 transition-opacity", className, disabled && "opacity-50 pointer-events-none")}>
    <div className="flex items-center gap-1.5">
      <Label className="mb-0">{label}</Label>
      {info && (
        <div className="group relative">
          <Info className="w-3 h-3 text-text-tertiary cursor-help" />
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-zinc-900 text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-md">
            {info}
          </div>
        </div>
      )}
    </div>
    {children}
  </div>
);

const Section = ({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border border-border rounded-xl bg-surface overflow-hidden shadow-xs">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 group hover:bg-zinc-50 transition-colors"
      >
        <span className="text-xs font-semibold text-text-primary">{title}</span>
        {isOpen ? <ChevronUp className="w-3.5 h-3.5 text-text-tertiary" /> : <ChevronDown className="w-3.5 h-3.5 text-text-tertiary" />}
      </button>
      {isOpen && (
        <div className="px-4 pb-4 animate-in fade-in slide-in-from-top-1 duration-200">
          <Divider className="mb-4" />
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
      } catch (e) {
        console.error('Failed to save preset', e);
      }
    }
  };

  return (
    <div className="space-y-4" id="settings-panel">
      {/* Top Header & Provider */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-1.5 p-1 bg-zinc-100 rounded-lg">
          {(['google', 'openai'] as const).map((p) => (
            <button
              key={p}
              onClick={() => update('provider', p)}
              className={cn(
                "px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold rounded-md transition-all",
                settings.provider === p 
                  ? "bg-surface text-accent shadow-sm" 
                  : "text-text-tertiary hover:text-text-secondary"
              )}
            >
              {p}
            </button>
          ))}
        </div>
        <Button variant="ghost" size="sm" onClick={savePreset} className="h-7 px-2">
          <Save className="w-3 h-3" />
          Preset
        </Button>
      </div>

      <div className="space-y-3">
        <Section title="Model & Compositie" defaultOpen>
          <div className="space-y-4">
            <OptionGroup label="Product Naam">
              <Input 
                value={settings.designName || ''}
                onChange={(e) => update('designName', e.target.value)}
                placeholder="Bijv. Essential Hoodie"
                className="h-8 text-xs"
              />
            </OptionGroup>

            <div className="grid grid-cols-2 gap-3">
              <OptionGroup label="Model" disabled={isNoModelFormat}>
                <Select 
                  value={effectiveModelType} 
                  onChange={(e) => update('modelType', e.target.value as ModelType)} 
                  disabled={isNoModelFormat}
                  className="h-8 text-xs"
                >
                  {['male', 'female', 'androgynous', 'no model'].map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </Select>
              </OptionGroup>

              <OptionGroup label="Positie">
                <Select 
                  value={settings.position} 
                  onChange={(e) => update('position', e.target.value as Position)} 
                  className="h-8 text-xs"
                >
                  {['front', 'back', 'side', 'close-up'].map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </Select>
              </OptionGroup>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <OptionGroup label="Omgeving">
                <Select 
                  value={settings.environment} 
                  onChange={(e) => update('environment', e.target.value as Environment)} 
                  className="h-8 text-xs"
                >
                  {['indoor minimal', 'outdoor golden hour', 'beach / sand tones', 'city calm', 'neutral studio'].map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </Select>
              </OptionGroup>

              <OptionGroup label="Mood">
                <Select 
                  value={settings.mood} 
                  onChange={(e) => update('mood', e.target.value as Mood)} 
                  className="h-8 text-xs"
                >
                  {['calm', 'soft', 'grounded', 'ontspannen'].map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </Select>
              </OptionGroup>
            </div>
          </div>
        </Section>

        <Section title="Kleur & Techniek">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-text-tertiary" />
                <Input 
                  value={colorSearch}
                  onChange={(e) => setColorSearch(e.target.value)}
                  placeholder="Zoek kleur..."
                  className="h-8 pl-8 text-xs bg-surface-raised border-border/50"
                />
              </div>
              
              <div className="flex flex-wrap gap-1">
                <button 
                  onClick={() => setActiveCategory(null)}
                  className={cn(
                    "px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-md transition-all border",
                    !activeCategory ? "bg-accent text-white border-accent" : "bg-surface text-text-tertiary border-border hover:border-border-strong"
                  )}
                >
                  Alles
                </button>
                {categories.map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={cn(
                      "px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-md transition-all border",
                      activeCategory === cat ? "bg-accent text-white border-accent" : "bg-surface text-text-tertiary border-border hover:border-border-strong"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-8 gap-1 p-2 bg-surface-raised rounded-lg border border-border/50 max-h-[120px] overflow-y-auto scrollbar-thin">
                {filteredColors.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => update('color', color.name)}
                    className={cn(
                      "aspect-square rounded-md border transition-all flex items-center justify-center p-0.5",
                      settings.color === color.name 
                        ? "border-accent bg-accent-muted shadow-sm" 
                        : "border-transparent hover:border-border-strong"
                    )}
                    title={color.name}
                  >
                    <div 
                      className="w-full h-full rounded-[4px] border border-black/5"
                      style={{ backgroundColor: color.hex }}
                    />
                  </button>
                ))}
              </div>
            </div>
            
            <OptionGroup label="Druktechniek">
              <Select 
                value={settings.printTechnique || 'none'} 
                onChange={(e) => update('printTechnique', e.target.value as PrintTechnique)} 
                className="h-8 text-xs"
              >
                {PRINT_TECHNIQUES.map(tech => (
                  <option key={tech.id} value={tech.id}>{tech.name}</option>
                ))}
              </Select>
            </OptionGroup>
          </div>
        </Section>

        <Section title="Resolutie & Output">
          <div className="grid grid-cols-2 gap-3">
            <OptionGroup label="Aspect Ratio">
              <Select 
                value={settings.aspectRatio} 
                onChange={(e) => update('aspectRatio', e.target.value as AspectRatio)} 
                className="h-8 text-xs"
              >
                {['3:4', '4:5', '1:1'].map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </Select>
            </OptionGroup>

            <OptionGroup label="Resolutie">
              <Select 
                value={settings.resolution} 
                onChange={(e) => update('resolution', e.target.value as Resolution)} 
                className="h-8 text-xs"
              >
                {['HD', '2K', '4K'].map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </Select>
            </OptionGroup>
          </div>
        </Section>
      </div>

      {presets && Object.keys(presets).length > 0 && (
        <div className="pt-2">
          <Label>Opgeslagen Presets</Label>
          <div className="grid grid-cols-2 gap-2 mt-1.5">
            {Object.keys(presets).slice(0, 4).map(name => (
              <button
                key={name}
                onClick={() => onUpdate(presets[name])}
                className="px-2 py-1.5 text-[10px] font-medium bg-surface border border-border rounded-lg text-text-secondary hover:border-border-strong hover:text-text-primary transition-all text-left truncate"
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

