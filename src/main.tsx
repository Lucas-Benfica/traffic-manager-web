import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import ResetStyle from "./styles/ResetStyle.ts";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ResetStyle />
    <App />
  </StrictMode>
);
