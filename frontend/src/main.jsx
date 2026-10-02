import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import AuthProvider from "./context/AuthProvider.jsx";
import AlertProvider from "./context/AlertProvider.jsx";

import "./main.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AlertProvider>
          <App />
        </AlertProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);