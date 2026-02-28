import pool from "./config/db.js";

const isDev = process.env.NODE_ENV !== "production";

async function logToDb(level, source, message, meta = {}) {
  if (level === "error" && !isDev) {
    try {
      await pool.query(
        `INSERT INTO system_errors (error_type, message, stack, user_id, page_url, user_agent, status) 
         VALUES (?, ?, ?, ?, ?, ?, 'open')`,
        [source, message, meta.stack || null, meta.userId || null, meta.pageUrl || null, meta.userAgent || null]
      );
    } catch {
      // Silent fail
    }
  }
}

export const logger = {
  error: (source, message, meta = {}) => {
    if (isDev) {
      console.error(`[${source}]`, message, meta.stack || "");
    }
    logToDb("error", source, message, meta);
  },

  warn: (source, message, meta = {}) => {
    if (isDev) {
      console.warn(`[${source}]`, message);
    }
  },

  info: (source, message, meta = {}) => {
    if (isDev) {
      console.log(`[${source}]`, message);
    }
  },
};
