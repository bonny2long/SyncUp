import pool from "../config/db.js";

export const checkMaintenanceMode = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      "SELECT setting_value FROM platform_settings WHERE setting_key = 'maintenance_mode'"
    );

    const isMaintenanceMode = rows[0]?.setting_value === "true";

    if (!isMaintenanceMode) {
      return next();
    }

    const userHeader = req.headers["x-user"];
    let user = null;
    
    if (userHeader) {
      try {
        user = JSON.parse(userHeader);
      } catch (e) {
        // Invalid JSON, treat as no user
      }
    }

    const isAdmin = user?.role === "admin";

    if (isAdmin) {
      return next();
    }

    const [messageRows] = await pool.query(
      "SELECT setting_value FROM platform_settings WHERE setting_key = 'maintenance_message'"
    );
    
    const message = messageRows[0]?.setting_value || "The platform is currently under maintenance";

    return res.status(503).json({
      error: "Maintenance mode",
      message: message,
    });
  } catch (err) {
    console.error("Maintenance mode check error:", err);
    next();
  }
};
