import cors from "cors";
import dotenv from "dotenv";
import express, { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from "./routes/authRoutes";

const app = express();

// Middleware
app.use(
  cors({
    origin: "*",
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
const connectDB = async (): Promise<void> => {
  try {
    console.log("🔗 Connecting to MongoDB Atlas...");
    const mongoURI =
      process.env.MONGODB_URI ||
      "mongodb+srv://pdao:cpsu26pdao@pdao.abdiecr.mongodb.net/pdao?retryWrites=true&w=majority&appName=PDAO";
    await mongoose.connect(mongoURI);
    console.log("✅ MongoDB Atlas connected successfully!");
  } catch (error: any) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

// Routes
app.use("/api/auth", authRoutes);

// Health check
app.get("/health", (req: Request, res: Response) => {
  res.json({
    success: true,
    status: "ok",
    message: "PDAO Server is running",
    database:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

// Home route
app.get("/", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "PDAO Backend API",
    version: "1.0.0",
    endpoints: [
      "GET / - API Info",
      "GET /health - Health check",
      "POST /api/auth/register - Register user",
      "POST /api/auth/login - Login user",
    ],
  });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("❌ Server error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

// ==================== 404 HANDLER ====================
// This must be the LAST middleware/route
// =====================================================

// OPTION A: Simple middleware without path (RECOMMENDED)
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
    timestamp: new Date().toISOString(),
  });
});

// OR OPTION B: If you need to exclude certain paths
app.use((req: Request, res: Response, next: NextFunction) => {
  // List of valid paths that shouldn't trigger 404
  const validPaths = ["/health", "/", "/api/auth"];

  const isKnownPath = validPaths.some(
    (path) =>
      req.originalUrl === path || req.originalUrl.startsWith(path + "/"),
  );

  if (isKnownPath) {
    // Let it continue to the actual route handler
    next();
  } else {
    // Return 404
    res.status(404).json({
      success: false,
      message: `Route ${req.originalUrl} not found`,
      availableRoutes: validPaths,
    });
  }
});

// =====================================================

const PORT = parseInt(process.env.PORT || "5000", 10);

const startServer = async (): Promise<void> => {
  await connectDB();

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 Network: http://192.168.1.80:${PORT}`);
  });
};

process.on("SIGINT", async () => {
  await mongoose.disconnect();
  process.exit(0);
});

startServer();
