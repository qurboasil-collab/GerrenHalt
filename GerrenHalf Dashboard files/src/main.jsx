import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, HashRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./hooks/useAuth";
import "./styles/globals.css";
import "./styles/sidebar.css";
import "./styles/dashboard.css";
import "./styles/auth.css";

const Router = String(import.meta.env.VITE_ROUTER_MODE || "browser").toLowerCase() === "hash"
  ? HashRouter
  : BrowserRouter;

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Router>
      <AuthProvider>
        <App />
      </AuthProvider>
    </Router>
  </React.StrictMode>
);
