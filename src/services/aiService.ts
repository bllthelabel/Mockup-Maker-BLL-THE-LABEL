import { GoogleGenAI } from "@google/genai";
import { UploadedProduct, PromptSettings, GeneratedImage, LibraryProduct } from "../types";
import { BASE_PRODUCTS } from "../lib/constants";

export async function generateImage(
  prompt: string,
  settings: PromptSettings,
  product: UploadedProduct,
  library: LibraryProduct[]
): Promise<GeneratedImage> {
  const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Geen API key gevonden. Selecteer een API key via de instellingen.");
  }

  const ai = new GoogleGenAI({ apiKey });

  // Map resolution names to SDK values
  const resolutionMap: Record<string, string> = {
    'HD': '1K',
    '2K': '2K',
    '4K': '4K'
  };

  const model = "gemini-3.1-flash-image-preview";
  
  const contentParts: any[] = [{ text: prompt }];

  // 1. Send the specific uploaded product (the design/unique item)
  if (product.file && product.mimeType) {
    const base64Data = await fileToBase64(product.file);
    contentParts.push({
      inlineData: {
        data: base64Data,
        mimeType: product.mimeType
      }
    });
  }

  // 2. Send the basis product from library for shape/category context (if different from uploaded)
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
