import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { StoreProvider } from "./store";
import { NavProvider } from "./nav";
import { max } from "./lib/max";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <StoreProvider>
      <NavProvider>
        <App />
      </NavProvider>
    </StoreProvider>
  </StrictMode>,
);

// Tell MAX the app has rendered so it can hide its loader
max.ready();
