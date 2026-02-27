import express from "express";
import cors from "cors";
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
import uploadRoutes from "./routes/uploadRoutes.js";
import errorsRoutes from "./routes/errorsRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { generalLimiter, strictLimiter, createLimiter, searchLimiter } from "./config/rateLimit.js";
import { swaggerDocs, swaggerSetup } from "./config/swagger.js";

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api", generalLimiter);

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
