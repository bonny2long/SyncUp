const isDev = import.meta.env.DEV;

export const logger = {
  error: (message, ...args) => {
    if (isDev) {
      console.error(message, ...args);
    }
  },
  
  warn: (message, ...args) => {
    if (isDev) {
      console.warn(message, ...args);
    }
  },
  
  log: (message, ...args) => {
    if (isDev) {
      console.log(message, ...args);
    }
  },
};

export async function reportToServer(errorType, message, details = {}) {
  try {
    const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";
    await fetch(`${API_BASE}/errors`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error_type: errorType,
        message: typeof message === 'string' ? message : String(message),
        stack: details.stack || null,
        user_id: details.userId || null,
        page_url: details.pageUrl || window?.location?.pathname || "",
        user_agent: typeof navigator !== "undefined" ? navigator.userAgent : "",
      }),
    });
  } catch {
    // Silent fail - don't break the app
  }
}
