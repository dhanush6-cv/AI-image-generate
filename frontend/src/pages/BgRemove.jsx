import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";

import GateModal from "../components/GateModal";
import {
  getAnonUsed,
  getLoggedUsed,
  getPremium,
  markUsageSuccess,
} from "../utils/usageGate";

import { uploadImage } from "../utils/api";

export default function BgRemove() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [resultImage, setResultImage] = useState(null);
  const [gate, setGate] = useState({ open: false, type: "login" });

  const stars = useMemo(() => Array.from({ length: 46 }, (_, i) => i), []);

  /* DEVICE ID AUTO CREATE */
  useEffect(() => {
    let id = localStorage.getItem("deviceId");
    if (!id) {
      id = "dev_" + Math.random().toString(36).substring(2) + Date.now();
      localStorage.setItem("deviceId", id);
    }
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setResultImage(null);
  };

  /* =========================
     REMOVE BACKGROUND
  ========================= */
  const handleRemoveBackground = async () => {
    const user = auth.currentUser;
    const premium = getPremium();

    /* ---------- FRONTEND GATE ---------- */
    if (!user) {
      if (getAnonUsed() >= 1) {
        setGate({ open: true, type: "login" });
        return;
      }
    } else {
      if (!premium && getLoggedUsed() >= 2) {
        setGate({ open: true, type: "premium" });
        return;
      }
    }

    if (!image || loading) return;

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("image", image);

      const blob = await uploadImage("/remove-bg", formData);

      const imageUrl = URL.createObjectURL(blob);
      setResultImage(imageUrl);

      markUsageSuccess(!!user);

    } catch (err) {
      console.log(err);

      if (err.message === "LOGIN_REQUIRED") {
        setGate({ open: true, type: "login" });
      }

      if (err.message === "PREMIUM_REQUIRED") {
        setGate({ open: true, type: "premium" });
      }

    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{css}</style>

      <div className="bgPage">

        <div className="bgFx" aria-hidden="true">
          <div className="bgBase" />
          <div className="orb o1" />
          <div className="orb o2" />
          <div className="orb o3" />
          <div className="orb o4" />

          <div className="starLayer">
            {stars.map((i) => {
              const top = (i * 37) % 100;
              const left = (i * 61) % 100;
              const delay = (i % 9) * 0.22;
              const dur = 2.6 + (i % 7) * 0.45;
              const size = i % 11 === 0 ? 3 : 2;

              return (
                <span
                  key={i}
                  className="star"
                  style={{
                    top: `${top}%`,
                    left: `${left}%`,
                    width: `${size}px`,
                    height: `${size}px`,
                    animationDelay: `${delay}s`,
                    animationDuration: `${dur}s`,
                  }}
                />
              );
            })}
          </div>

          <div className="grain" />
          <div className="vignette" />
        </div>

        <button className="homeBtn" onClick={() => navigate("/")}>
          ⟵ Home
        </button>

        <div className="card">
          <div className="titleRow">
            <h1 className="title neonFlicker">
              <span className="sweepText sweepSlow">AI Background Remover</span>
            </h1>
            <p className="subtitle">
              Upload an image and remove the background instantly.
            </p>
          </div>

          <div className="uploadRow">
            <label className="uploadBox">
              <span className="uploadGlow" />
              <span className="uploadText">Choose Image</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                hidden
              />
            </label>
          </div>

          {preview && (
            <div className="section">
              <div className="imgWrap">
                <img src={preview} alt="preview" className="img" />
              </div>

              <button
                className="btnPrimary"
                onClick={handleRemoveBackground}
                disabled={loading}
              >
                {loading ? (
                  <span className="btnInline">
                    <span className="spinner" /> Processing…
                  </span>
                ) : (
                  "Remove Background"
                )}
              </button>
            </div>
          )}

          {resultImage && (
            <div className="section result">
              <div className="resultHead">
                <div className="resultTitle">
                  <span className="sweepTextAlt sweepAlt">Result</span>
                </div>
              </div>

              <div className="imgWrap">
                <img src={resultImage} alt="result" className="img" />
              </div>

              <a
                className="downloadLink"
                href={resultImage}
                download="removed.png"
              >
                <button className="btnDownload" type="button">
                  Download Image
                </button>
              </a>
            </div>
          )}
        </div>

        <GateModal
          open={gate.open}
          type={gate.type}
          onClose={() => setGate({ open: false, type: "login" })}
        />
      </div>
    </>
  );
}

const css = `
  :root{
    --bg0:#050714;
    --bg1:#070B22;
    --text: rgba(255,255,255,.92);
    --muted: rgba(255,255,255,.72);
    --glass: rgba(255,255,255,.08);
    --stroke: rgba(255,255,255,.14);
    --shadow: 0 28px 90px rgba(0,0,0,.60);
    --shadow2: 0 14px 50px rgba(0,0,0,.38);

    --cyan:#22D3EE;
    --violet:#7C5CFF;
    --pink:#FF5C7A;
    --gold:#FFBE3C;
    --green:#34D399;
  }

  *{ box-sizing:border-box; }
  body{ margin:0; }

  .bgPage{
    min-height:100vh;
    display:flex;
    align-items:center;
    justify-content:center;
    padding: 26px 14px;
    position:relative;
    overflow:hidden;
    color: var(--text);
    font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
  }

  /* Background */
  .bgFx{
    position:fixed;
    inset:0;
    z-index:0;
    pointer-events:none;
    overflow:hidden;
  }

  .bgBase{
    position:absolute; inset:0;
    background:
      radial-gradient(1200px 760px at 15% 20%, rgba(34,211,238,.16), transparent 60%),
      radial-gradient(1100px 760px at 85% 25%, rgba(124,92,255,.18), transparent 60%),
      radial-gradient(1100px 760px at 55% 95%, rgba(255,92,122,.12), transparent 60%),
      linear-gradient(180deg, var(--bg0), var(--bg1));
    animation: hueDrift 14s ease-in-out infinite;
  }

  @keyframes hueDrift{
    0%,100%{ filter: hue-rotate(0deg) saturate(1.1); }
    50%{ filter: hue-rotate(18deg) saturate(1.25); }
  }

  .orb{
    position:absolute;
    width: 640px; height: 640px;
    border-radius:50%;
    filter: blur(34px);
    opacity:.55;
    mix-blend-mode: screen;
    animation: orbFloat 10s ease-in-out infinite;
  }
  .o1{ left:-260px; top:-220px; background: radial-gradient(circle at 30% 30%, rgba(124,92,255,.75), transparent 62%); }
  .o2{ right:-300px; top:110px; background: radial-gradient(circle at 30% 30%, rgba(34,211,238,.70), transparent 62%); animation-duration: 12s; }
  .o3{ left:34%; bottom:-360px; background: radial-gradient(circle at 30% 30%, rgba(255,92,122,.55), transparent 62%); animation-duration: 14s; }
  .o4{ right:22%; bottom:-420px; background: radial-gradient(circle at 30% 30%, rgba(255,190,60,.35), transparent 62%); animation-duration: 16s; opacity:.35; }

  @keyframes orbFloat{
    0%,100%{ transform: translate3d(0,0,0) scale(1); }
    50%{ transform: translate3d(18px,-14px,0) scale(1.03); }
  }

  .starLayer{ position:absolute; inset:0; opacity:.92; }
  .star{
    position:absolute;
    border-radius:50%;
    background: rgba(255,255,255,.92);
    box-shadow: 0 0 12px rgba(255,255,255,.22);
    animation: twinkle 3.6s ease-in-out infinite;
  }
  @keyframes twinkle{
    0%,100%{ opacity:.25; transform: scale(1); }
    50%{ opacity:1; transform: scale(1.6); }
  }

  .grain{
    position:absolute; inset:-40%;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='220' height='220' filter='url(%23n)' opacity='.35'/%3E%3C/svg%3E");
    opacity:.10;
    transform: rotate(10deg);
    animation: grainMove 10s steps(10) infinite;
  }
  @keyframes grainMove{
    0%{ transform: translate(0,0) rotate(10deg); }
    25%{ transform: translate(-3%,2%) rotate(10deg); }
    50%{ transform: translate(-6%,-2%) rotate(10deg); }
    75%{ transform: translate(2%,-6%) rotate(10deg); }
    100%{ transform: translate(0,0) rotate(10deg); }
  }

  .vignette{
    position:absolute; inset:0;
    background: radial-gradient(1200px 800px at 50% 10%, rgba(255,255,255,.05), transparent 60%),
                radial-gradient(900px 700px at 50% 110%, rgba(0,0,0,.70), transparent 58%);
    opacity:.9;
  }

  /* Home button */
  .homeBtn{
    position: fixed;
    top: 16px;
    right: 16px;
    z-index: 5;
    padding: 10px 14px;
    border-radius: 999px;
    border: 1px solid rgba(255,255,255,.14);
    background: rgba(255,255,255,.08);
    backdrop-filter: blur(16px);
    color: rgba(255,255,255,.92);
    font-weight: 900;
    cursor: pointer;
    box-shadow: 0 18px 40px rgba(0,0,0,.25);
    transition: transform .15s ease, background .15s ease, border-color .15s ease;
  }
  .homeBtn:hover{
    transform: translateY(-1px);
    background: rgba(255,255,255,.10);
    border-color: rgba(34,211,238,.22);
  }

  /* Card */
  .card{
    position:relative;
    z-index: 2;
    width: min(520px, 94vw);
    border-radius: 26px;
    padding: 26px 22px;
    background: linear-gradient(180deg, rgba(255,255,255,.10), rgba(255,255,255,.05));
    border: 1px solid rgba(255,255,255,.14);
    backdrop-filter: blur(18px);
    box-shadow: var(--shadow);
    overflow:hidden;
  }

  .card::before{
    content:"";
    position:absolute; inset:-1px;
    border-radius: 26px;
    background:
      radial-gradient(600px 260px at 15% 20%, rgba(34,211,238,.16), transparent 65%),
      radial-gradient(600px 260px at 85% 10%, rgba(124,92,255,.16), transparent 65%),
      radial-gradient(600px 260px at 50% 110%, rgba(255,92,122,.10), transparent 65%);
    pointer-events:none;
  }

  .titleRow{ position:relative; text-align:center; }
  .title{
    margin: 0;
    font-size: 30px;
    font-weight: 1000;
    letter-spacing: -0.4px;
    line-height: 1.1;
    text-shadow:
      0 0 12px rgba(34,211,238,.18),
      0 0 28px rgba(124,92,255,.14);
  }
  .subtitle{
    margin: 10px 0 0;
    font-size: 13.5px;
    color: rgba(255,255,255,.76);
  }

  /* Neon flicker + sweep */
  .neonFlicker{ animation: neonFlicker 6.2s infinite; }
  @keyframes neonFlicker{
    0%, 18%, 22%, 62%, 66%, 100%{ opacity: 1; filter: brightness(1.12); }
    19%, 21%, 64%{ opacity: .72; filter: brightness(.92); }
  }

  .sweepText{
    display:inline-block;
    background: linear-gradient(
      90deg,
      #ffffff,
      var(--cyan),
      var(--violet),
      var(--pink),
      var(--gold),
      var(--cyan),
      #ffffff
    );
    background-size: 240% 100%;
    -webkit-background-clip:text;
    background-clip:text;
    color: transparent;
    filter: saturate(1.2);
    animation: sweep 5.2s linear infinite;
  }
  .sweepSlow{ animation-duration: 6.6s; }

  .sweepTextAlt{
    display:inline-block;
    background: linear-gradient(
      90deg,
      var(--cyan),
      var(--pink),
      var(--violet),
      var(--gold),
      var(--cyan)
    );
    background-size: 240% 100%;
    -webkit-background-clip:text;
    background-clip:text;
    color: transparent;
    filter: saturate(1.2);
    animation: sweep 5.4s linear infinite reverse;
  }
  .sweepAlt{ animation-duration: 5.4s; }

  @keyframes sweep{
    0%{ background-position: 0% 50%; }
    100%{ background-position: 200% 50%; }
  }

  /* Upload */
  .uploadRow{
    position:relative;
    margin-top: 18px;
    display:flex;
    justify-content:center;
  }

  .uploadBox{
    position:relative;
    display:inline-flex;
    align-items:center;
    justify-content:center;
    padding: 12px 18px;
    border-radius: 16px;
    border: 1px solid rgba(255,255,255,.16);
    background: rgba(10, 14, 34, 0.30);
    backdrop-filter: blur(16px);
    cursor:pointer;
    font-weight: 900;
    color: rgba(255,255,255,.92);
    box-shadow: var(--shadow2);
    overflow:hidden;
    transition: transform .16s ease, border-color .16s ease, background .16s ease;
  }
  .uploadBox:hover{
    transform: translateY(-2px);
    border-color: rgba(34,211,238,.26);
    background: rgba(10, 14, 34, 0.36);
  }

  .uploadGlow{
    position:absolute; inset:-2px;
    background: radial-gradient(420px 90px at 15% 20%, rgba(34,211,238,.18), transparent 65%),
                radial-gradient(420px 90px at 85% 10%, rgba(124,92,255,.18), transparent 65%),
                radial-gradient(420px 90px at 50% 110%, rgba(255,92,122,.12), transparent 65%);
    pointer-events:none;
  }
  .uploadText{ position:relative; z-index:1; }

  .section{
    position:relative;
    margin-top: 18px;
    display:flex;
    flex-direction:column;
    gap: 14px;
  }

  .imgWrap{
    width:100%;
    border-radius: 18px;
    border: 1px solid rgba(255,255,255,.14);
    background: rgba(0,0,0,.15);
    overflow:hidden;
    box-shadow: 0 16px 40px rgba(0,0,0,.22);
  }

  .img{
    width:100%;
    display:block;
  }

  .btnPrimary{
    width: 100%;
    border: none;
    border-radius: 16px;
    padding: 12px 14px;
    font-weight: 1000;
    cursor: pointer;
    color: rgba(10,14,24,.95);
    background: linear-gradient(135deg, rgba(34,211,238,.95), rgba(124,92,255,.85));
    box-shadow: 0 18px 40px rgba(0,0,0,.30);
    transition: transform .14s ease, filter .14s ease;
  }
  .btnPrimary:hover{ transform: translateY(-1px); filter: brightness(1.06); }
  .btnPrimary:disabled{ opacity:.65; cursor:not-allowed; transform:none; }

  .btnInline{ display:inline-flex; align-items:center; gap:10px; justify-content:center; }

  .spinner{
    width: 16px;
    height: 16px;
    border-radius: 999px;
    border: 2px solid rgba(0,0,0,.20);
    border-top-color: rgba(0,0,0,.75);
    animation: spin 0.8s linear infinite;
  }
  @keyframes spin{ to { transform: rotate(360deg); } }

  .resultHead{ display:flex; justify-content:center; }
  .resultTitle{
    font-weight: 1000;
    font-size: 16px;
    letter-spacing: .2px;
    text-shadow: 0 0 14px rgba(34,211,238,.16);
  }

  .downloadLink{ text-decoration:none; }

  .btnDownload{
    width: 100%;
    border: none;
    border-radius: 16px;
    padding: 12px 14px;
    font-weight: 1000;
    cursor: pointer;
    color: rgba(10,14,24,.95);
    background: linear-gradient(135deg, rgba(52,211,153,.95), rgba(255,190,60,.88));
    box-shadow: 0 18px 40px rgba(0,0,0,.28);
    transition: transform .14s ease, filter .14s ease;
  }
  .btnDownload:hover{ transform: translateY(-1px); filter: brightness(1.05); }

  @media (max-width: 420px){
    .card{ padding: 22px 16px; border-radius: 22px; }
    .title{ font-size: 26px; }
  }
`;