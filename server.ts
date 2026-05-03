import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // robust API for third-party integrations
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", version: "1.0.0", service: "TaskQuest API" });
  });

  // Example API endpoint for external tools (e.g., CLI, plugins)
  app.post("/api/external/quest", (req, res) => {
    const apiKey = req.headers["x-api-key"];
    if (!apiKey) return res.status(401).json({ error: "API Key required" });
    
    // In a real app, validate API key and write to Firestore via Admin SDK
    // For this demo, we acknowledge the potential integration
    res.json({ message: "Quest received. Integration active.", data: req.body });
  });

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
