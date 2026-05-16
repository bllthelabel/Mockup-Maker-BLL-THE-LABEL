import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import OpenAI from "openai";
import multer from "multer";

const upload = multer();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Logging middleware to debug API calls
  app.use((req, res, next) => {
    if (req.url.startsWith('/api')) {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    }
    next();
  });

  // API Route for OpenAI Image Generation
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "OpenAI Proxy is alive" });
  });

  app.post("/api/openai/generate", upload.any(), async (req, res) => {
    try {
      console.log("API /api/openai/generate hit");
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        console.error("Missing OPENAI_API_KEY");
        return res.status(400).json({ error: "OPENAI_API_KEY niet geconfigureerd op de server." });
      }

      const openai = new OpenAI({ apiKey });
      const { prompt, aspectRatio } = req.body;
      const files = req.files as Express.Multer.File[];
      const file = files && files.length > 0 ? files[0] : null;

      // OpenAI DALL-E-3 sizes: 1024x1024, 1024x1792, 1792x1024
      // DALL-E-2 sizes: 256x256, 512x512, 1024x1024
      const sizeMap: Record<string, string> = {
        '1:1': '1024x1024',
        '4:5': '1024x1024', // DALL-E 3 doesn't support 4:5, using 1:1 as fallback
        '3:4': '1024x1024', // Fallback to 1:1
        '9:16': '1024x1792',
        '16:9': '1792x1024'
      };

      const size = sizeMap[aspectRatio] || "1024x1024";

      console.log(`Generating image for prompt: "${prompt?.substring(0, 50)}..." with size: ${size}`);

      let result;
      if (file) {
        console.log("Using image edit (DALL-E-2)");
        // OpenAI images.edit requires a square PNG < 4MB.
        // We use the buffer and provide a filename so the SDK handles it correctly.
        result = await openai.images.edit({
          model: "dall-e-2",
          image: await OpenAI.toFile(file.buffer, "image.png"),
          prompt: prompt,
          size: "1024x1024" as any
        });
      } else {
        console.log("Using image generation (DALL-E-3)");
        result = await openai.images.generate({
          model: "dall-e-3",
          prompt: prompt,
          size: size as any,
          quality: "standard",
          response_format: "b64_json"
        });
      }

      console.log("OpenAI generation successful");
      res.json(result);
    } catch (error: any) {
      console.error("Server OpenAI error details:", error);
      
      const errorMessage = error.response?.data?.error?.message || error.message || "Interne serverfout bij OpenAI aanvraag";
      res.status(error.status || 500).json({ 
        error: errorMessage,
        details: error.response?.data || error || null
      });
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
