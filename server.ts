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

  // API Route for OpenAI Image Generation
  app.post("/api/openai/generate", upload.any(), async (req, res) => {
    try {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({ error: "OPENAI_API_KEY niet geconfigureerd op de server." });
      }

      const openai = new OpenAI({ apiKey });
      const { prompt, aspectRatio } = req.body;
      const files = req.files as Express.Multer.File[];

      const sizeMap: Record<string, string> = {
        '1:1': '1024x1024',
        '4:5': '1024x1280',
        '3:4': '1024x1365'
      };

      let result;
      if (files && files.length > 0) {
        // Map Multer files to OpenAI compatible format
        const imageFiles = files.map(file => {
          return new File([file.buffer], file.originalname, { type: file.mimetype });
        });

        result = await openai.images.edit({
          model: "gpt-image-2",
          image: imageFiles,
          prompt: prompt,
          size: (sizeMap[aspectRatio] as any) || "1024x1024"
        });
      } else {
        result = await openai.images.generate({
          model: "gpt-image-2",
          prompt: prompt,
          size: (sizeMap[aspectRatio] as any) || "1024x1024"
        });
      }

      res.json(result);
    } catch (error: any) {
      console.error("Server OpenAI error:", error);
      res.status(500).json({ error: error.message || "Interne serverfout bij OpenAI aanvraag" });
    }
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
