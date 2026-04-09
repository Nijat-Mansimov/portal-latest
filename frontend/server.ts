import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';

const PORT = 3000;

async function startServer() {
  const app = express();

  // ALL MOCK API ROUTES REMOVED
  // Proxy configuration in vite.config.ts will route /api and /uploads to the real backend (localhost:4000)

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
