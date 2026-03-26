import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { type Server } from "http";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, server: Server) {
  // Dynamic imports to avoid bundling Vite in production
  const { createServer: createViteServer, createLogger } = await import("vite");
  const viteConfig = (await import("../vite.config.js")).default;
  const { nanoid } = await import("nanoid");
  
  const viteLogger = createLogger();
  
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    // CRITICAL: Skip API routes FIRST - before any other checks
    // This prevents the middleware from running at all for API routes
    if (req.path.startsWith("/api/")) {
      return next(); // Skip this middleware entirely for API routes
    }
    
    // CRITICAL: Check if response has already been sent
    if (res.headersSent || res.finished || res.writableEnded) {
      return;
    }
    
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        __dirname,
        "..",
        "client",
        "index.html",
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`,
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const candidatePaths = [
    path.resolve(__dirname, "public"),
    path.resolve(__dirname, "..", "dist", "public"),
    path.resolve(__dirname, "..", "server", "public"),
    path.resolve(process.cwd(), "dist", "public"),
    path.resolve(process.cwd(), "server", "public"),
  ];

  const distPath = candidatePaths.find((candidate) => fs.existsSync(candidate));

  if (!distPath) {
    throw new Error(
      `Could not find the build directory. Tried: ${candidatePaths.join(
        ", ",
      )}. Make sure to run the client build before starting the server.`,
    );
  }

  // Serve static files with proper MIME types
  // CRITICAL: Skip API routes COMPLETELY - this middleware should NEVER run for API routes
  app.use((req, res, next) => {
    // CRITICAL: Skip static file serving for ALL API routes - check this FIRST
    // This MUST be the first check to prevent express.static from running for API routes
    if (req.path.startsWith("/api/")) {
      return next(); // Skip static middleware entirely for API routes - don't call express.static
    }
    
    // CRITICAL: Check if response has already been sent by a route handler
    // If headers are sent, the route handler already responded - don't serve static files
    if (res.headersSent || res.finished || res.writableEnded) {
      return; // Don't serve static files if response already sent
    }
    
    // Only serve static files for non-API routes that haven't been handled yet
    express.static(distPath, {
      setHeaders: (res, filePath) => {
        // Set proper MIME types for JavaScript and CSS files
        if (filePath.endsWith('.js')) {
          res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
        } else if (filePath.endsWith('.css')) {
          res.setHeader('Content-Type', 'text/css; charset=utf-8');
        } else if (filePath.endsWith('.json')) {
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
        }
      }
    })(req, res, next);
  });

  // fall through to index.html if the file doesn't exist
  // BUT exclude API routes and static asset requests - they should return 404 if not found
  app.use("*", (req, res, next) => {
    // CRITICAL: Skip ALL API routes FIRST - before any other checks
    // This prevents the middleware from running at all for API routes
    if (req.path.startsWith("/api/")) {
      // If we reach here and it's an API route, it means no route handler matched
      // Only return 404 if response hasn't been sent yet
      if (!res.headersSent && !res.finished && !res.writableEnded) {
        res.setHeader("Content-Type", "application/json");
        res.status(404).json({ message: "API endpoint not found" });
      }
      return; // CRITICAL: Return immediately, don't continue
    }
    
    // CRITICAL: Check if response has already been sent or finished - if so, do nothing
    if (res.headersSent || res.finished || res.writableEnded) {
      return;
    }
    
    // Don't serve index.html for static asset requests (JS, CSS, images, etc.)
    // These should return 404 if the file doesn't exist
    const staticAssetExtensions = ['.js', '.css', '.json', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2', '.ttf', '.eot'];
    const hasStaticExtension = staticAssetExtensions.some(ext => req.path.endsWith(ext));
    const isAssetPath = req.path.startsWith('/assets/') || req.path.startsWith('/static/');
    
    if (hasStaticExtension || isAssetPath) {
      if (!res.headersSent) {
        res.setHeader("Content-Type", "application/json");
        res.status(404).json({ message: "Asset not found" });
      }
      return;
    }
    
    // For all other routes, serve index.html (SPA routing)
    // Only if headers haven't been sent (i.e., no route matched)
    if (!res.headersSent && !res.finished && !res.writableEnded) {
      res.sendFile(path.resolve(distPath, "index.html"));
    }
  });
}
