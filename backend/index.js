
import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";

import connectDB from "./database/connections.js";

import authRoutes from "./routes/authRoutes.js";
import usersRoutes from "./routes/usersRoutes.js";
import factoryCardRoutes from "./routes/factoryCardRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import ticketRoutes from "./routes/ticketRoutes.js";
import machineOperationLogRoutes from "./routes/machineOperationLogRoutes.js";
import milledRunSheetRoutes from "./routes/milledRunSheetRoutes.js";
import milledRunSheetOptionRoutes from "./routes/milledRunSheetOptionRoutes.js";
import factoryCardOptionRoutes from "./routes/factoryCardOptionRoutes.js";

import { seedFactoryCardOptions } from "./utils/seedFactoryCardOptions.js";

const app = express();

const PORT = process.env.PORT || 5000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================
// MIDDLEWARE
// ============================================

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================
// STATIC FILES
// ============================================

app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

// ============================================
// ROOT TEST
// ============================================

app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "API is running",
  });
});

// ============================================
// API ROUTES
// ============================================

app.use("/api/auth", authRoutes);

app.use("/api/users", usersRoutes);

app.use("/api/factory-cards", factoryCardRoutes);

app.use("/api/factory-card-options", factoryCardOptionRoutes);

app.use("/api/notifications", notificationRoutes);

app.use("/api/tickets", ticketRoutes);

app.use(
  "/api/machine-operation-logs",
  machineOperationLogRoutes
);

app.use(
  "/api/milled-run-sheets",
  milledRunSheetRoutes
);

// ============================================
// MILLED RUN SHEET OPTIONS
// ============================================

console.log(
  "MOUNTING: /api/milled-run-sheet-options"
);

app.use(
  "/api/milled-run-sheet-options",
  milledRunSheetOptionRoutes
);

console.log(
  "MILLED OPTIONS ROUTE MOUNTED"
);

// ============================================
// DIRECT TEST ROUTE
// ============================================

app.get("/api/test-milled-options", (req, res) => {
  console.log(">>> DIRECT TEST ROUTE HIT");

  return res.status(200).json({
    success: true,
    message: "Milled options route system is working.",
  });
});

// ============================================
// 404 HANDLER
// ============================================

app.use((req, res) => {
  console.log(
    "404:",
    req.method,
    req.originalUrl
  );

  return res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// ============================================
// GLOBAL ERROR HANDLER
// ============================================

app.use((error, req, res, next) => {
  console.error("================================");
  console.error("GLOBAL SERVER ERROR:");
  console.error("MESSAGE:", error.message);
  console.error("NAME:", error.name);
  console.error("STACK:", error.stack);
  console.error("================================");

  return res.status(error.status || 500).json({
    success: false,
    message:
      error.message || "Internal server error.",
  });
});

// ============================================
// START SERVER
// ============================================

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    console.log("MongoDB connected");

    // Seed Factory Card types
    // RSC, Pad, and Other are stored in MongoDB.
    await seedFactoryCardOptions();

    // Start Express server
    app.listen(PORT, () => {
      console.log("================================");
      console.log(
        `Server running on http://localhost:${PORT}`
      );
      console.log(
        "Factory Card options loaded from MongoDB."
      );
      console.log(
        "Milled options route registered."
      );
      console.log("================================");
    });
  } catch (error) {
    console.error("SERVER START ERROR:", error);
    process.exit(1);
  }
};

// ============================================
// RUN SERVER
// ============================================

startServer();

