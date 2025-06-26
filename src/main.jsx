import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PronostiekApp from "./App";
import LoginPage from "./LoginPage"; // <== Dit moet je hebben
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<PronostiekApp />} />
    </Routes>
  </BrowserRouter>
);
