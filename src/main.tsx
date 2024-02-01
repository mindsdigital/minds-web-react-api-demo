import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./global.css";

window.global ||= window;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
