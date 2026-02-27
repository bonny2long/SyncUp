import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { UserProvider } from "./context/UserContext";
import { ThemeProvider } from "./context/ThemeContext";
import { reportError } from "./utils/api";

import "./index.css";
import "./charts/agChartsSetup";
import App from "./App.jsx";

// Global error handlers for robust error reporting
window.onerror = (message, source, lineno, colno, error) => {
  reportError("javascript", message, {
    stack: error?.stack,
    pageUrl: window.location.pathname,
  });
  return false;
};

window.onunhandledrejection = (event) => {
  reportError("javascript", event.reason?.message || "Unhandled Promise Rejection", {
    stack: event.reason?.stack,
    pageUrl: window.location.pathname,
  });
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
      <UserProvider>
        <BrowserRouter
          future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        >
          <App />
        </BrowserRouter>
      </UserProvider>
    </ThemeProvider>
  </StrictMode>
);
