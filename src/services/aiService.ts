import { GoogleGenAI, Part } from "@google/genai";
import { UploadedProduct, PromptSettings, GeneratedImage, LibraryProduct } from "../types";

export async function generateImage(
  prompt: string,
  settings: PromptSettings,
  product: UploadedProduct,
  library: LibraryProduct[]
): Promise<GeneratedImage> {

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Geen API key gevonden. Controleer de instellingen.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-2.5-flash-image";
  const contentParts: Part[] = [];

  // Stap 1 — Tekst-prompt (met CRITICAL regel + beeldrol-instructies)
  contentParts.push({ text: prompt });

  // Stap 2 — Image 1: het geüploade design (artwork / print)
  // Gemini gebruikt dit als de absolute design-referentie
  if (product.file && product.mimeType) {
    const base64Data = await fileToBase64(product.file);
    contentParts.push({
      inlineData: {
        data: base64Data,
        mimeType: product.mimeType
      }
    });
  }

  // Stap 3 — Image 2: het basisproduct (ghost mannequin / vormreferentie)
  // Gemini gebruikt dit alleen voor silhouet, pasvorm en constructie
  if (settings.baseProductId) {
    const libraryItem = library.find(p => p.id === settings.baseProductId);
    if (libraryItem) {
      const referenceUrl = libraryItem.ghostImageUrl || libraryItem.imageUrl;
      if (referenceUrl !== product.previewUrl) {
        try {
          const resp = await fetch(referenceUrl);
        if (!resp.ok) throw new Error(`HTTP error: ${resp.status}`);
        const blob = await resp.blob();
        const base64Data = await blobToBase64(blob);
        contentParts.push({
          inlineData: {
            data: base64Data,
            mimeType: blob.type
          }
        });
      } catch (e: any) {
        console.warn("Basisproduct foto kon niet worden geladen:", e.message);
      }
    }
  }
}

  // Stap 4 — Verstuur naar Gemini
  const response = await (ai as any).models.generateContent({
    model,
    contents: { parts: contentParts },
    config: {
      responseModalities: ['IMAGE'],
      imageConfig: {
        aspectRatio: settings.aspectRatio
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

  return { url: imageUrl, timestamp: Date.now() };
}

async function fileToBase64(file: File): Promise<string> {
  return blobToBase64(file);
}

async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = error => reject(error);
  });
}
