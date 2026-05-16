import { GoogleGenAI } from "@google/genai";
import { UploadedProduct, PromptSettings, GeneratedImage, LibraryProduct, PhotographyFormat } from "../types";
import { generateNegativePrompt } from "../lib/generatePrompt";

async function withRetry<T>(fn: () => Promise<T>, retries = 2): Promise<T> {
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (e: any) {
      if (i === retries) throw e;
      const waitTime = 1000 * (i + 1);
      console.warn(`Attempt ${i + 1} failed, retrying in ${waitTime}ms...`, e.message);
      await new Promise(r => setTimeout(r, waitTime));
    }
  }
  throw new Error('unreachable');
}

async function resizeImageForAI(fileOrBlob: File | Blob, maxSize = 1024): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(fileOrBlob);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error("Failed to get canvas context"));
        return;
      }

      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxSize) {
          height *= maxSize / width;
          width = maxSize;
        }
      } else {
        if (height > maxSize) {
          width *= maxSize / height;
          height = maxSize;
        }
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
      
      const base64WithHeader = canvas.toDataURL('image/jpeg', 0.9);
      const parts = base64WithHeader.split(',');
      if (parts.length < 2) {
        reject(new Error("Failed to encode image to base64"));
        return;
      }
      const header = parts[0];
      const base64 = parts[1];
      const mimeType = header.match(/:(.*?);/)?.[1] || 'image/jpeg';
      
      resolve({ base64, mimeType });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image for resizing"));
    };
    
    img.src = url;
  });
}

export async function generateImage(
  prompt: string,
  settings: PromptSettings,
  product: UploadedProduct,
  library: LibraryProduct[],
  format: PhotographyFormat
): Promise<GeneratedImage> {
  const provider = settings.provider || 'google';

  return withRetry(async () => {
    if (provider === 'google') {
      return generateGeminiImage(prompt, settings, product, library, format);
    } else {
      return generateOpenAIImage(prompt, settings, product, library, format);
    }
  });
}

async function generateOpenAIImage(
  prompt: string,
  settings: PromptSettings,
  product: UploadedProduct,
  library: LibraryProduct[],
  format: PhotographyFormat
): Promise<GeneratedImage> {
  if (!product.file && !product.previewUrl) {
    throw new Error('Geen ontwerp-afbeelding beschikbaar.');
  }

  // 1. Verklein en converteer ontwerp naar base64
  let designBase64 = "";
  let designMimeType = "image/jpeg";
  
  if (product.file) {
    const resized = await resizeImageForAI(product.file, 1024);
    designBase64 = resized.base64;
    designMimeType = resized.mimeType;
  } else if (product.previewUrl) {
    // Als het een bibliotheek item is zonder file object
    try {
      const resp = await fetch(product.previewUrl);
      const blob = await resp.blob();
      const resized = await resizeImageForAI(blob, 1024);
      designBase64 = resized.base64;
      designMimeType = resized.mimeType;
    } catch (e) {
      console.error("Kon bibliotheek afbeelding niet laden voor OpenAI:", e);
      throw new Error("Kon de ontwerp-afbeelding niet verwerken voor OpenAI.");
    }
  }

  // 2. Haal het basisproduct op en converteer naar base64
  let baseProductBase64: string | null = null;
  let baseProductMimeType: string | null = null;
  
  const baseProductId = settings.baseProductId;
  if (baseProductId) {
    const libraryItem = library.find(p => p.id === baseProductId);
    if (libraryItem && libraryItem.imageUrl) {
      try {
        const response = await fetch(libraryItem.imageUrl);
        const blob = await response.blob();
        const { base64, mimeType } = await resizeImageForAI(blob, 512);
        baseProductBase64 = base64;
        baseProductMimeType = mimeType;
      } catch (e) {
        console.warn('Basisproduct afbeelding kon niet worden geladen voor OpenAI context.');
      }
    }
  }

  const negativePrompt = generateNegativePrompt(format);

  const body = {
    prompt,
    negativePrompt,
    designImageBase64: designBase64,
    designMimeType: designMimeType,
    baseProductImageBase64: baseProductBase64,
    baseProductMimeType: baseProductMimeType,
    resolution: settings.resolution,
    aspectRatio: settings.aspectRatio,
  };

  const response = await fetch('/api/openai/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Serverfout bij OpenAI' }));
    throw new Error(err.error ?? 'OpenAI generatie mislukt.');
  }

  const data = await response.json();
  if (!data.b64_json) throw new Error('Geen afbeeldingsdata ontvangen van OpenAI.');

  return {
    url: `data:image/png;base64,${data.b64_json}`,
    timestamp: Date.now()
  };
}

async function generateGeminiImage(
  prompt: string,
  settings: PromptSettings,
  product: UploadedProduct,
  library: LibraryProduct[],
  format: PhotographyFormat
): Promise<GeneratedImage> {
  // Use the environment provided key
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error("Geen Gemini API key geconfigureerd in de omgeving. Neem contact op met de beheerder.");
  }

  const genAI = new GoogleGenAI({ apiKey });

  const negativePrompt = generateNegativePrompt(format);
  const fullPrompt = `${prompt}\n\nRESTRICTIES (NIET TONEN):\n${negativePrompt}`;
  
  const contentParts: any[] = [{ text: fullPrompt }];

  // 1. Voeg productafbeelding toe als deze bestaat
  if (product.file) {
    try {
      const { base64, mimeType } = await resizeImageForAI(product.file, 1536);
      contentParts.push({
        inlineData: {
          data: base64,
          mimeType: mimeType
        }
      });
    } catch (e: any) {
      console.error("Fout bij verwerken productafbeelding:", e);
    }
  }

  try {
    const isHighRes = settings.resolution === '2K' || settings.resolution === '4K';
    const modelName = isHighRes ? "gemini-3.1-flash-image-preview" : "gemini-2.5-flash-image";
    
    const resolutionMap: Record<string, string> = {
      'HD': '1K',
      '2K': '2K',
      '4K': '4K'
    };

    const response = await genAI.models.generateContent({
      model: modelName,
      contents: { parts: contentParts },
      config: {
        imageConfig: {
          aspectRatio: (settings.aspectRatio === "4:5" ? "3:4" : settings.aspectRatio) as any,
          imageSize: resolutionMap[settings.resolution] || "1K"
        }
      }
    });

    if (!response.candidates || response.candidates.length === 0) {
      const feedback = (response as any).promptFeedback;
      if (feedback?.blockReason) {
        throw new Error(`AI blokkering: ${feedback.blockReason}. Probeer een minder gevoelige of meer beschrijvende prompt.`);
      }
      throw new Error("Het AI model gaf geen resultaat terug. Probeer de prompt te verduidelijken.");
    }

    const candidate = response.candidates[0];
    if (candidate.finishReason && candidate.finishReason !== 'STOP' && candidate.finishReason !== 'MAX_TOKENS') {
      throw new Error(`AI Generatie gestopt: ${candidate.finishReason}. Dit kan komen door veiligheidsfilters.`);
    }

    const partsOut = candidate.content?.parts;
    
    if (!partsOut) throw new Error("Er is geen afbeeldingsdata ontvangen van het model.");

    let imageData = "";
    for (const part of partsOut) {
      if (part.inlineData) {
        imageData = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        break;
      }
    }

    if (!imageData) {
      // Als er geen afbeelding is, check of er tekst is die we als fout kunnen tonen
      const text = response.text;
      if (text) {
        console.warn("AI gaf tekst terug ipv afbeelding:", text);
        throw new Error(`De AI gaf tekst terug in plaats van een afbeelding: "${text.substring(0, 50)}..."`);
      }
      throw new Error("Het AI model genereerde geen afbeelding. Probeer de prompt te veranderen.");
    }

    return {
      url: imageData,
      timestamp: Date.now()
    };
  } catch (e: any) {
    console.error("Gemini API Error:", e);
    if (e.message?.includes("fetch") || e.name === "TypeError") {
      throw new Error("Netwerkfout: De verbinding met de AI server is verbroken of geblokkeerd. Controleer je internetverbinding of API instellingen.");
    }
    throw e;
  }
}
