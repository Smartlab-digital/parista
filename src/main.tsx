import React from "react";
import { createRoot } from "react-dom/client";
import { RedesignShowcase } from "./RedesignShowcase";
import "./style.css";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RedesignShowcase />
  </React.StrictMode>,
);
