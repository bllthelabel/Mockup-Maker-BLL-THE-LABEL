import { GoogleGenAI } from "@google/genai";
import { UploadedProduct, PromptSettings, GeneratedImage, LibraryProduct } from "../types";
import { NEGATIVE_PROMPT, BASE_PRODUCTS } from "../lib/constants";

export async function generateImage(
  prompt: string,
  settings: PromptSettings,
  product: UploadedProduct,
  library: LibraryProduct[]
): Promise<GeneratedImage> {
  const provider = settings.provider || 'google';

  if (provider === 'google') {
    return generateGeminiImage(prompt, settings, product, library);
  } else {
    return generateOpenAIImage(prompt, settings, product, library);
  }
}

async function generateGeminiImage(
  prompt: string,
  settings: PromptSettings,
  product: UploadedProduct,
  library: LibraryProduct[]
): Promise<GeneratedImage> {
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Geen Google API key gevonden. Selecteer een API key via de instellingen.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const resolutionMap: Record<string, string> = {
    'HD': '1K',
    '2K': '2K',
    '4K': '4K'
  };

  const model = "gemini-3.1-flash-image-preview";
  const fullPrompt = `${prompt}\n\nNEGATIVE CONSTRAINTS (MANDATORY):\n${NEGATIVE_PROMPT}`;
  const contentParts: any[] = [{ text: fullPrompt }];

  if (product.file && product.mimeType) {
    const base64Data = await fileToBase64(product.file);
    contentParts.push({
      inlineData: {
        data: base64Data,
        mimeType: product.mimeType
      }
    });
  }

  if (settings.baseProductId) {
    const libraryItem = library.find(p => p.id === settings.baseProductId);
    if (libraryItem && libraryItem.imageUrl !== product.previewUrl) {
      try {
        const resp = await fetch(libraryItem.imageUrl);
        if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);
        const blob = await resp.blob();
        const base64Data = await blobToBase64(blob);
        contentParts.push({
          inlineData: {
            data: base64Data,
            mimeType: blob.type
          }
        });
      } catch (e: any) {
        console.warn("Failed to fetch basis image for AI context:", e.message);
      }
    }
  }

  const response = await ai.models.generateContent({
    model,
    contents: { parts: contentParts },
    config: {
      imageConfig: {
        aspectRatio: settings.aspectRatio,
        imageSize: resolutionMap[settings.resolution] || "1K"
      }
    }
  });

  const partsOut = response.candidates?.[0]?.content?.parts;
  if (!partsOut) throw new Error("Geen afbeelding gegenereerd.");

  let imageUrl = "";
  for (const part of partsOut) {
    if (part.inlineData) {
      imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      break;
    }
  }

  if (!imageUrl) throw new Error("Geen afbeeldingsdata in response.");

  return {
    url: imageUrl,
    timestamp: Date.now()
  };
}

async function generateOpenAIImage(
  prompt: string,
  settings: PromptSettings,
  product: UploadedProduct,
  library: LibraryProduct[]
): Promise<GeneratedImage> {
  const formData = new FormData();
  const fullPrompt = `${prompt}\n\nNEGATIVE CONSTRAINTS (MANDATORY):\n${NEGATIVE_PROMPT}`;
  formData.append('prompt', fullPrompt);
  formData.append('aspectRatio', settings.aspectRatio);
  
  if (product.file) {
    formData.append('image', product.file);
  }

  try {
    const response = await fetch('/api/openai/generate', {
      method: 'POST',
      body: formData
    });

    const contentType = response.headers.get('content-type');
    if (!response.ok) {
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server Fout (${response.status})`);
      } else {
        const text = await response.text().catch(() => "Geen details");
        console.error("Non-JSON error response:", text.substring(0, 500));
        throw new Error(`Server Fout (${response.status}): De server stuurde een ongeldige response (HTML/Tekst). Controleer of de server correct is opgestart.`);
      }
    }

    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text().catch(() => "Geen details");
      console.error("Non-JSON success response:", text.substring(0, 500));
      throw new Error("De server stuurde geen JSON terug. Controleer de server logs.");
    }

    const result = await response.json();
    const imageData = result.data[0];
    
    if (imageData.b64_json) {
      return {
        url: `data:image/png;base64,${imageData.b64_json}`,
        timestamp: Date.now()
      };
    } else if (imageData.url) {
      return {
        url: imageData.url,
        timestamp: Date.now()
      };
    } else {
      throw new Error("Geen afbeeldingsdata gevonden in OpenAI response");
    }
  } catch (error: any) {
    console.error("OpenAI proxy error:", error);
    throw new Error(`OpenAI Fout: ${error.message || "Onbekende fout"}`);
  }
}

async function fileToBase64(file: File): Promise<string> {
  return blobToBase64(file);
}

async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onload = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = error => reject(error);
  });
}
