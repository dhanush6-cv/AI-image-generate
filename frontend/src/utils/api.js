import axios from "axios";
import { auth } from "../firebase";

const BASE = "http://localhost:5000";

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
      // NOTE: axios auto sets multipart boundary when you DON'T set Content-Type manually
    };

    if (user) {
      const token = await user.getIdToken();
      headers.Authorization = `Bearer ${token}`;
      headers["x-user-id"] = user.uid; // optional
    }

    const res = await axios.post(`${BASE}${path}`, formData, {
      headers,
      responseType: "blob",
    });

    return res.data;
  } catch (err) {
    const code = err?.response?.data?.code;

    // server returns 402 with {code:"LOGIN_REQUIRED"} or {code:"PREMIUM_REQUIRED"}
    if (err?.response?.status === 402 && code) {
      throw new Error(code);
    }

    // some times blob error -> parse not possible
    if (err?.response?.status === 402) {
      throw new Error("PREMIUM_REQUIRED");
    }

    console.log("UPLOAD ERROR:", err?.response?.status, err?.response?.data || err.message);
    throw new Error("UPLOAD_FAILED");
  }
}