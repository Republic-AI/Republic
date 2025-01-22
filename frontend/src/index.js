import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles.css"; // 如果需要一些基础样式

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<App />);