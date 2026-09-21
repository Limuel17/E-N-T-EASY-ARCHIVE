import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import AuthProvider from "./context/AuthProvider.jsx";
import AlertProvider from "./context/AlertProvider.jsx";

import "./main.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <AlertProvider>
        <App />
      </AlertProvider>
    </AuthProvider>
  </StrictMode>
);