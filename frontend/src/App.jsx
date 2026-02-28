import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ImageEnhancer from "./pages/ImageEnhancer";
import BgRemove from "./pages/BgRemove";
import Sketch from "./pages/Sketch";
import Premium from "./pages/Premium";

export default function App() {
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true);

  /* =========================
     CREATE DEVICE ID (for guest tracking)
  ========================== */
  useEffect(() => {
    if (!localStorage.getItem("deviceId")) {
      const id = crypto.randomUUID
        ? crypto.randomUUID()
        : "dev_" + Date.now().toString();

      localStorage.setItem("deviceId", id);
      console.log("Device ID created:", id);
    }
  }, []);

  /* =========================
     FIREBASE AUTH STATE
  ========================== */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setBooting(false);
    });
    return () => unsub();
  }, []);

  /* =========================
     LOADING SCREEN
  ========================== */
  if (booting) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          color: "white",
          background: "#0f172a",
          fontWeight: 600
        }}
      >
        Loading...
      </div>
    );
  }

  /* =========================
     ROUTES
  ========================== */
  return (
    <Router>
      <Routes>

        {/* Home */}
        <Route path="/" element={<Home />} />

        {/* Auth pages (always accessible) */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Tools */}
        <Route path="/bg-remove" element={<BgRemove />} />
        <Route path="/enhance" element={<ImageEnhancer />} />
        <Route path="/sketch" element={<Sketch />} />

        {/* Premium */}
        <Route path="/premium" element={<Premium />} />

        {/* fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </Router>
  );
}