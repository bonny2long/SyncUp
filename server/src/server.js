import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import sql from "mssql";
import usersRoutes from "./routes/usersRoutes.js";
import projectsRoutes from "./routes/projectsRoutes.js";
import healthRoute from "./routes/healthRoute.js";
import progressRoutes from "./routes/progressRoutes.js";
import mentorshipRoutes from "./routes/mentorshipRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import skillsRoutes from "./routes/skillsRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import badgeRoutes from "./routes/badgeRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import announcementsRoutes from "./routes/announcementsRoutes.js";
import eventsRoutes from "./routes/eventsRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import errorsRoutes from "./routes/errorsRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import { checkMaintenanceMode } from "./middleware/maintenanceMode.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import {
  generalLimiter,
  strictLimiter,
  createLimiter,
  searchLimiter,
  sensitiveLimiter,
  adminLimiter,
} from "./config/rateLimit.js";
import { swaggerDocs, swaggerSetup } from "./config/swagger.js";

dotenv.config();
const app = express();

// Middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: [
          "'self'",
          "data:",
          "blob:",
          process.env.BACKEND_URL || "http://localhost:5000",
        ],
        connectSrc: [
          "'self'",
          process.env.CLIENT_URL || "http://localhost:5173",
        ],
      },
    },
  }),
);
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use("/api", generalLimiter);

// Middleware to pass user info from frontend headers
app.use((req, res, next) => {
  const userHeader = req.headers["x-user"];
  if (userHeader) {
    try {
      req.user = JSON.parse(userHeader);
    } catch (e) {
      req.user = null;
    }
  }
  next();
});

// Maintenance mode check - skip health, users (login), admin settings, and errors
app.use("/api", (req, res, next) => {
  const skippedPaths = [
    "/health",
    "/users",
    "/admin/settings/maintenance",
    "/admin/growth-stats",
    "/errors",
  ];
  if (skippedPaths.some((path) => req.path.startsWith(path))) {
    return next();
  }
  return checkMaintenanceMode(req, res, next);
});

// Swagger documentation
app.use("/api-docs", swaggerDocs, swaggerSetup);

app.use("/api/health", healthRoute);
app.use("/api/progress_updates", progressRoutes);
app.use("/api/mentorship", mentorshipRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/projects", projectsRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/skills", skillsRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/badges", badgeRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/announcements", announcementsRoutes);
app.use("/api/events", eventsRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/errors", errorsRoutes);
app.use("/api/admin", adminRoutes);

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Apply stricter limits to mutation routes
app.post("/api/projects", createLimiter);
app.post("/api/projects/:projectId/join-request", strictLimiter);
app.post("/api/mentorship/sessions", strictLimiter);
app.post("/api/progress_updates", strictLimiter);

app.put("/api/projects/:id/status", strictLimiter);
app.put("/api/mentorship/sessions/:id", strictLimiter);

// Apply sensitive limits to password changes and user deletion
app.put("/api/users/:userId/password", sensitiveLimiter);
app.delete("/api/users/:userId", sensitiveLimiter);

// Apply admin limits
app.use("/api/admin", adminLimiter);

// Apply stricter limits to public registration to prevent abuse
app.post("/api/admin/register", sensitiveLimiter);

// Basic route for testing
app.get("/", (req, res) => {
  res.send("SyncUp Backend API is running ");
});

// Database connection config
const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

//Mysql connection
import pool from "./config/db.js";

async function testConnection() {
  try {
    const [rows] = await pool.query("SELECT NOW() AS now");
    console.log("Connected to MySQL at:", rows[0].now);
  } catch (err) {
    console.error("MySQL connection failed:", err.message);
  }
}

testConnection();

// Connect to Azure SQL
// async function connectDB() {
//   try {
//     await sql.connect(dbConfig);
//     console.log(" Connected to Azure SQL Database");
//   } catch (err) {
//     console.error(" Database connection failed:", err.message);
//   }
// }
// connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`SyncUp is live, Server is on port ${PORT}`),
);
