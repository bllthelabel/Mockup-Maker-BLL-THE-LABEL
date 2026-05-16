import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import OpenAI from "openai";
import multer from "multer";

const upload = multer();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Increase JSON body limit for large image base64 strings
  app.use(express.json({ limit: '50mb' }));

  // Logging middleware to debug API calls
  app.use((req, res, next) => {
    if (req.url.startsWith('/api')) {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    }
    next();
  });

  // API Route for OpenAI Image Generation (gpt-image-2)
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "BLL OpenAI Studio Relay is active" });
  });

  // Helper mapping for OpenAI sizes
  const resolveSize = (resolution: string, aspectRatio: string): string => {
    const sizeMap: Record<string, Record<string, string>> = {
      'HD': { '1:1': '1024x1024', '3:4': '1024x1360', '4:5': '1024x1280' },
      '2K': { '1:1': '2048x2048', '3:4': '2048x2720', '4:5': '2048x2560' },
      '4K': { '1:1': '2880x2880', '3:4': '2480x3296', '4:5': '2576x3216' },
    };
    return sizeMap[resolution]?.[aspectRatio] ?? '1024x1024';
  };

  const resolveQuality = (resolution: string): "low" | "medium" | "high" => {
    if (resolution === '4K' || resolution === '2K') return 'high';
    return 'medium';
  };

  app.post("/api/openai/generate", async (req, res) => {
    try {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({ error: "OpenAI API Key niet gevonden in server omgeving." });
      }

      const {
        prompt,
        negativePrompt,
        designImageBase64,
        designMimeType,
        baseProductImageBase64,
        baseProductMimeType,
        resolution = 'HD',
        aspectRatio = '1:1',
      } = req.body;

      if (!prompt || !designImageBase64) {
        return res.status(400).json({ error: "Prompt en ontwerp-afbeelding zijn verplicht." });
      }

      // Configure OpenAI with longer timeout and retries for stability
      const openai = new OpenAI({ 
        apiKey,
        timeout: 90000, // 90 seconds
        maxRetries: 3
      });

      // Embed negative prompt into main prompt
      const fullPrompt = negativePrompt 
        ? `${prompt}\n\nNEGATIVE CONSTRAINTS: ${negativePrompt}`
        : prompt;

      const size = resolveSize(resolution, aspectRatio);
      const quality = resolveQuality(resolution);

      // Convert base64 to file-like objects for the SDK
      const images: any[] = [];
      
      // Image 1: The Design
      const designBuffer = Buffer.from(designImageBase64.replace(/^data:image\/\w+;base64,/, ""), "base64");
      images.push(await OpenAI.toFile(designBuffer, "design.jpg", { type: designMimeType || "image/jpeg" }));

      // Image 2: The Base Product (Optional)
      if (baseProductImageBase64) {
        const baseBuffer = Buffer.from(baseProductImageBase64.replace(/^data:image\/\w+;base64,/, ""), "base64");
        images.push(await OpenAI.toFile(baseBuffer, "base_product.jpg", { type: baseProductMimeType || "image/jpeg" }));
      }

      console.log(`Sending image edit request to OpenAI (gpt-image-2) with ${images.length} inputs...`);

      const result = await (openai.images.edit as any)({
        model: "gpt-image-2",
        image: images, // Pass the array as per gpt-image-2 multi-image support
        prompt: fullPrompt,
        size: size,
        quality: quality,
        n: 1
      });

      const imageData = result.data[0];
      let b64 = imageData.b64_json;

      // Fallback: if OpenAI returns a URL instead of base64
      if (!b64 && imageData.url) {
        console.log("OpenAI returned URL, fetching for base64 conversion...");
        const imageResp = await fetch(imageData.url);
        const buffer = Buffer.from(await imageResp.arrayBuffer());
        b64 = buffer.toString('base64');
      }

      if (!b64) throw new Error("Geen afbeeldingsdata gevonden in OpenAI resultaat.");

      res.json({ b64_json: b64 });
    } catch (error: any) {
      console.error("OpenAI Route Error:", error);
      const msg = error.response?.data?.error?.message || error.message || "Onbekende fout bij OpenAI.";
      res.status(error.status || 500).json({ error: msg });
    }
  });

  // Generic error handler to catch errors before they fall through to Vite
  app.use((err: any, req: any, res: any, next: any) => {
    if (res.headersSent) {
      return next(err);
    }
    console.error("Unhandled server error:", err);
    res.status(500).json({ error: "Interne serverfout", message: err.message });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
