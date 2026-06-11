import cors from "cors";

// Allow requests from any origin (SDK sends from customer websites)
const corsMiddleware = cors({
  origin: "*",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "x-api-key"],
});

export default corsMiddleware;
