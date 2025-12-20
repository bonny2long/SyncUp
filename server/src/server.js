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

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api/health", healthRoute);
app.use("/api/progress_updates", progressRoutes);
app.use("/api/mentorship", mentorshipRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/projects", projectsRoutes);
app.use("/api/analytics", analyticsRoutes);

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
app.listen(PORT, () => console.log(`Hey Sofie, Server is on port ${PORT}`));
