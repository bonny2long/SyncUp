import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

let pool;

// Function to create a new connection pool
const connectDB = async () => {
  try {
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    const connection = await pool.getConnection();
    console.log(`SyncUP connected to MySQL at: ${new Date().toISOString()}`);
    connection.release();

    handleDisconnect();
  } catch (err) {
    console.error("Initial MySQL connection failed:", err.message);
    setTimeout(connectDB, 5000); // Retry every 5 seconds
  }
};

// Function to handle disconnects
const handleDisconnect = () => {
  pool.on("error", (err) => {
    console.error("⚠️ MySQL error:", err.message);

    // Retry on lost connection
    if (err.code === "PROTOCOL_CONNECTION_LOST" || err.code === "ECONNRESET") {
      console.log("SyncuP ttempting to reconnect to MySQL...");
      connectDB();
    } else {
      throw err;
    }
  });
};

// Initial connection
connectDB();

export default pool;
