import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import { db } from "./storage";
import { initializeFraudDetection, setBroadcastFn } from "./lib/fraudDetection";

const app = express();
const httpServer = createServer(app);

// ============ Socket.IO — Real-time Alerts ============
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
  path: "/ws",
});

io.on("connection", (socket) => {
  log(`WebSocket client connected: ${socket.id}`, "ws");
  socket.on("disconnect", () => {
    log(`WebSocket client disconnected: ${socket.id}`, "ws");
  });
});

// Wire broadcast function into fraud detection engine
setBroadcastFn((payload) => {
  io.emit("fraud_alert", payload);
  log(
    `Broadcast fraud alert: score=${payload.riskScore} severity=${payload.severity}`,
    "ws"
  );
});

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    limit: "50mb",
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false, limit: "50mb" }));

// CORS for dev
app.use((_req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        const preview = JSON.stringify(capturedJsonResponse).slice(0, 120);
        logLine += ` :: ${preview}`;
      }
      log(logLine);
    }
  });

  next();
});

(async () => {
  initializeFraudDetection(db);

  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    console.error("[error]", err);
  });

  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen({ port, host: "127.0.0.1" }, () => {
    log(`Serving on port ${port} (WebSocket at /ws)`);
  });
})();
