
export type ModelType = 'male' | 'female' | 'androgynous' | 'no model';
export type Position = 'front' | 'back' | 'side' | 'close-up';
export type Environment = 'indoor minimal' | 'outdoor golden hour' | 'beach / sand tones' | 'city calm' | 'neutral studio with natural light';
export type Mood = 'calm' | 'reflective' | 'confident' | 'soft' | 'grounded';
export type AspectRatio = '3:4' | '4:5' | '1:1';
export type Resolution = 'HD' | '2K' | '4K';
export type AIProvider = 'google' | 'openai';

export interface LibraryProduct {
  id: string;
  name: string;
  imageUrl: string;
  ghostImageUrl?: string;
  description: string;
  isCustom?: boolean;
  availableColors?: string[];
  technicalDetails?: string;
  category?: 'top' | 'bottom' | 'outerwear' | 'accessories';
}

export interface PhotographyFormat {
  id: string;
  name: string;
  description: string;
  basePrompt: string;
}

export interface ColorOption {
  id: string;
  name: string;
  hex: string;
}

export type PrintTechnique = 'screenprint' | 'embroidery' | 'dtg' | 'puff print' | 'flock print' | 'none';

export interface PromptSettings {
  modelType: ModelType;
  position: Position;
  environment: Environment;
  mood: Mood;
  aspectRatio: AspectRatio;
  resolution: Resolution;
  baseProductId?: string;
  color?: string;
  printTechnique?: PrintTechnique;
  designName?: string;
  provider: AIProvider;
}

export interface UploadedProduct {
  file: File | null;
  previewUrl: string | null;
  mimeType: string | null;
  isLibraryImage?: boolean;
}

export interface GeneratedImage {
  url: string;
  timestamp: number;
}

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}
