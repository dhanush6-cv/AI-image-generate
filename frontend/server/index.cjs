require("dotenv").config();

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const fs = require("fs");
const axios = require("axios");
const FormData = require("form-data");
const sharp = require("sharp");

const Replicate = require("replicate");

const { admin, db } = require("./firebaseAdmin");

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });
const PORT = process.env.PORT || 5000;

/* ================= USAGE (FIRESTORE PERSISTENT) ================= */
function getClient(req) {
  const deviceId = req.headers["x-device-id"];
  const userId = req.headers["x-user-id"];
  return { deviceId, userId };
}

async function getVerifiedUser(req) {
  try {
    const authHeader = req.headers.authorization || "";
    if (!authHeader.startsWith("Bearer ")) return null;
    const token = authHeader.slice("Bearer ".length).trim();
    if (!token) return null;
    const decoded = await admin.auth().verifyIdToken(token);
    return decoded;
  } catch {
    return null;
  }
}

function isPremium(req, decodedToken) {
  if (decodedToken && decodedToken.premium === true) return true;
  const hp = (req.headers["x-premium"] || "").toString().toLowerCase();
  if (hp === "true" || hp === "1" || hp === "yes") return true;
  return false;
}

function usageDocRef(kind, key) {
  return db.collection("usage").doc(`${kind}_${key}`);
}

async function reserveUsageOrThrow({ kind, key, limit }) {
  const ref = usageDocRef(kind, key);

  return await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const data = snap.exists ? snap.data() : {};
    const total = Number(data.total || 0);

    if (total >= limit) {
      const code = kind === "user" ? "PREMIUM_REQUIRED" : "LOGIN_REQUIRED";
      const err = new Error(code);
      err.code = code;
      err.used = total;
      err.limit = limit;
      throw err;
    }

    tx.set(
      ref,
      {
        kind,
        key,
        total: total + 1,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return { used: total + 1, limit };
  });
}

async function usageGuard(req, res, next) {
  try {
    const { deviceId, userId } = getClient(req);
    if (!deviceId && !userId) return res.status(400).json({ code: "DEVICE_ID_REQUIRED" });

    const decoded = await getVerifiedUser(req);
    const finalUserId = decoded?.uid || userId || null;
    const premium = isPremium(req, decoded);

    if (premium) return next();

    if (finalUserId) {
      await reserveUsageOrThrow({ kind: "user", key: finalUserId, limit: 2 });
      return next();
    }

    if (!deviceId) return res.status(400).json({ code: "DEVICE_ID_REQUIRED" });
    await reserveUsageOrThrow({ kind: "device", key: deviceId, limit: 1 });
    return next();

  } catch (e) {
    if (e.code === "LOGIN_REQUIRED" || e.message === "LOGIN_REQUIRED") {
      return res.status(402).json({ code: "LOGIN_REQUIRED", used: e.used, limit: e.limit });
    }
    if (e.code === "PREMIUM_REQUIRED" || e.message === "PREMIUM_REQUIRED") {
      return res.status(402).json({ code: "PREMIUM_REQUIRED", used: e.used, limit: e.limit });
    }
    console.log("usageGuard error:", e);
    return res.status(500).json({ code: "USAGE_GUARD_FAILED" });
  }
}

/* ================= HEALTH ================= */
app.get("/", (req, res) => {
  res.json({ message: "Server running 🚀" });
});

/* ================= HD ENHANCE ================= */
app.post("/enhance", usageGuard, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image" });

    const buffer = fs.readFileSync(req.file.path);

    const enhanced = await sharp(buffer)
      .resize({ width: 2200 })
      .sharpen(2)
      .modulate({ brightness: 1.05, saturation: 1.15 })
      .png({ quality: 100 })
      .toBuffer();

    res.set("Content-Type", "image/png");
    res.send(enhanced);
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Enhance failed" });
  } finally {
    if (req.file) fs.unlinkSync(req.file.path);
  }
});

/* ================= REMOVE BG ================= */
app.post("/remove-bg", usageGuard, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image" });

    const form = new FormData();
    form.append("image_file", fs.createReadStream(req.file.path));
    form.append("size", "auto");

    const response = await axios.post("https://api.remove.bg/v1.0/removebg", form, {
      headers: {
        ...form.getHeaders(),
        "X-Api-Key": process.env.REMOVE_BG_API_KEY,
      },
      responseType: "arraybuffer",
    });

    res.set("Content-Type", "image/png");
    res.send(response.data);
  } catch (e) {
    console.log(e.response?.data || e.message);
    res.status(500).json({ error: "Remove BG failed" });
  } finally {
    if (req.file) fs.unlinkSync(req.file.path);
  }
});

/* ================= PENCIL SKETCH (REAL DARK SHADING) ================= */
app.post("/sketch",usageGuard, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No image" });

    const input = fs.readFileSync(req.file.path);

    // STEP 1 — grayscale base
    const gray = await sharp(input)
      .resize({ width: 1600, withoutEnlargement: true })
      .grayscale()
      .toBuffer();

    // STEP 2 — invert + heavy blur (pencil shading base)
    const invertedBlur = await sharp(gray)
      .negate()
      .blur(14)
      .toBuffer();

    // STEP 3 — color dodge blend (REAL sketch effect)
    const sketch = await sharp(gray)
      .composite([
        {
          input: invertedBlur,
          blend: "color-dodge",
        },
      ])

      // STEP 4 — remove white glow + add depth
      .linear(2.8, -120)     // strong contrast + dark midtones
      .gamma(2.7)            // reduce white wash
      .modulate({ brightness: 0.16 }) // deep pencil darkness

      // STEP 5 — sharpen strokes
      .sharpen(2.5)

      .png({ quality: 100 })
      .toBuffer();

    res.set("Content-Type", "image/png");
    res.send(sketch);

  } catch (e) {
    console.log("SKETCH ERROR:", e.message);
    res.status(500).json({ error: "Sketch failed" });
  } finally {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
  }
});
/* ================= START ================= */
app.listen(PORT, () => {
  console.log("✅ Server running http://localhost:" , PORT);
});