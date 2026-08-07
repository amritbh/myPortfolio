import React from "react";
import { createRoot } from "react-dom/client";

import "./index.css";
import App from "./App";
import "./assests/font-awesome/css/all.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/argon-design-system-react.css";

const container = document.getElementById("root");
if (!container) throw new Error("Root element not found");
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
