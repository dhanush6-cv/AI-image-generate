import axios from "axios";
import { auth } from "../firebase";

/* ✅ IMPORTANT — NO QUOTES */
const BASE = import.meta.env.VITE_API_URL;

/* fallback (optional safety) */
const API_BASE = BASE || "http://localhost:5000";

function getDeviceId() {
  let id = localStorage.getItem("deviceId");
  if (!id) {
    id = "dev_" + Math.random().toString(36).slice(2) + Date.now();
    localStorage.setItem("deviceId", id);
  }
  return id;
}

export async function uploadImage(path, formData) {
  try {
    const user = auth.currentUser;
    const deviceId = getDeviceId();

    const headers = {
      "x-device-id": deviceId,
    };

    if (user) {
      const token = await user.getIdToken();
      headers.Authorization = `Bearer ${token}`;
      headers["x-user-id"] = user.uid;
    }

    const res = await axios.post(`${API_BASE}${path}`, formData, {
      headers,
      responseType: "blob",
    });

    // ✅ IMPORTANT — check empty blob
    if (!res.data || res.data.size === 0) {
      throw new Error("EMPTY_RESPONSE");
    }

    return res.data;

  } catch (err) {
    const status = err?.response?.status;
    const code = err?.response?.data?.code;

    if (status === 402 && code) {
      throw new Error(code);
    }

    if (status === 402) {
      throw new Error("PREMIUM_REQUIRED");
    }

    console.log("UPLOAD ERROR:", status, err?.response?.data || err.message);
    throw new Error("UPLOAD_FAILED");
  }
}