import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import corsMiddleware from "./middleware/cors";

// Route imports
import healthRouter from "./routes/health";
import collectRouter from "./routes/collect";
import sitesRouter from "./routes/sites";
import analyticsRouter from "./routes/analytics";

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ──────────────────────────────────────────────────────────────

app.use(corsMiddleware);
app.use(express.json());

// ─── Routes ─────────────────────────────────────────────────────────────────

app.use(healthRouter);    // GET /health
app.use(collectRouter);   // POST /collect
app.use(sitesRouter);     // GET/POST /sites
app.use(analyticsRouter); // GET /analytics/:siteId/*

// ─── 404 Handler ────────────────────────────────────────────────────────────

app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Route not found" });
});

// ─── Global Error Handler ───────────────────────────────────────────────────

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// ─── Start Server ───────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`🚀 Analytics backend running on http://localhost:${PORT}`);
});

export default app;
