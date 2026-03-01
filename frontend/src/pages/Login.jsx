import React, { useMemo, useRef, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "../firebase";
import { resetUsage } from "../utils/usageGate";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState(localStorage.getItem("tempEmail") || "");
  const [password, setPassword] = useState(localStorage.getItem("tempPassword") || "");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const emailRef = useRef(null);
  const stars = useMemo(() => Array.from({ length: 28 }, (_, i) => i), []);

  const showMsg = (type, text) => setMsg({ type, text });

  /* ✅ redirect if already logged */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) navigate("/");
    });
    return () => unsub();
  }, [navigate]);

  useEffect(() => {
    setTimeout(() => emailRef.current?.focus(), 50);
  }, []);

  /* ================= EMAIL LOGIN ================= */
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return showMsg("error", "Enter email and password.");

    try {
      setBusy(true);
      const res = await signInWithEmailAndPassword(auth, email.trim(), password);

      if (!res.user.emailVerified) {
        showMsg("error", "Verify email first ❌");
        await signOut(auth);
        return;
      }

      localStorage.setItem(
        "profile",
        JSON.stringify({
          name: res.user.displayName || "",
          email: res.user.email || "",
          photo: res.user.photoURL || "",
          uid: res.user.uid,
        })
      );

      localStorage.removeItem("tempEmail");
      localStorage.removeItem("tempPassword");
      resetUsage();

      window.location.href = "/";
    } catch (err) {
      console.log(err);
      showMsg("error", "Login failed.");
    } finally {
      setBusy(false);
    }
  };

  /* ================= GOOGLE LOGIN ================= */
  const handleGoogleLogin = async () => {
    try {
      setBusy(true);

      if (auth.currentUser) await signOut(auth);

      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });

      const result = await signInWithPopup(auth, provider);
      const u = result.user;

      localStorage.setItem(
        "profile",
        JSON.stringify({
          name: u.displayName || "",
          email: u.email || "",
          photo: u.photoURL || "",
          uid: u.uid,
        })
      );

      resetUsage();
      window.location.href = "/";
    } catch (err) {
      console.log(err);
      showMsg("error", "Google login failed.");
    } finally {
      setBusy(false);
    }
  };

  /* ================= RESET PASSWORD ================= */
  const handleReset = async () => {
    if (!email) return showMsg("info", "Enter email first.");
    try {
      setBusy(true);
      await sendPasswordResetEmail(auth, email.trim());
      showMsg("success", "Reset link sent.");
    } catch {
      showMsg("error", "Reset failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#050714", color: "white" }}>
      <div style={{ width: 350, padding: 30, borderRadius: 16, background: "#0b1020" }}>
        <h2 style={{ textAlign: "center" }}>Login</h2>

        {msg.text && (
          <div style={{ marginBottom: 10, textAlign: "center" }}>
            {msg.text}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <input
            ref={emailRef}
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button disabled={busy}>
            {busy ? "Please wait..." : "Login"}
          </button>
        </form>

        <button onClick={handleGoogleLogin} style={{ marginTop: 10, width: "100%" }}>
          Continue with Google
        </button>

        <button onClick={handleReset} style={{ marginTop: 10, width: "100%" }}>
          Forgot password
        </button>

        <p style={{ textAlign: "center", marginTop: 15 }}>
          New user? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
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
    --red:#fb7185;
  }

  *{ box-sizing:border-box; }
  body{ margin:0; }

  /* Page */
  .authWrap{
    min-height:100vh;
    display:grid;
    place-items:center;
    padding: 24px 14px;
    position:relative;
    overflow:hidden;
    color: var(--text);
    font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
  }

  /* 🌌 Background */
  .spaceBg{
    position:fixed;
    inset:0;
    z-index:0;
    pointer-events:none;
    overflow:hidden;
  }

  .spaceBase{
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

  .nebula{
    position:absolute;
    width: 680px; height: 680px;
    border-radius: 50%;
    filter: blur(34px);
    opacity:.55;
    mix-blend-mode: screen;
    animation: float 10s ease-in-out infinite;
  }
  .nebula.n1{
    left:-240px; top:-220px;
    background: radial-gradient(circle at 30% 30%, rgba(124,92,255,.75), transparent 62%);
  }
  .nebula.n2{
    right:-260px; top:120px;
    background: radial-gradient(circle at 30% 30%, rgba(34,211,238,.70), transparent 62%);
    animation-duration: 12s;
  }
  .nebula.n3{
    left:35%; bottom:-360px;
    background: radial-gradient(circle at 30% 30%, rgba(255,92,122,.55), transparent 62%);
    animation-duration: 14s;
  }
  @keyframes float{
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
    0%,100%{ opacity:.22; transform: scale(1); }
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

  /* Card shell */
  .shell{
    position:relative;
    z-index:2;
    width: min(520px, 94vw);
    border-radius: 26px;
    padding: 26px 22px;
    background: linear-gradient(180deg, rgba(255,255,255,.10), rgba(255,255,255,.05));
    border: 1px solid rgba(255,255,255,.14);
    backdrop-filter: blur(18px);
    box-shadow: var(--shadow);
  }

  .right{ width:100%; }

  .formHead{
    text-align:center;
    margin-bottom: 14px;
  }

  .brandRow{
    display:flex;
    align-items:center;
    justify-content:center;
    gap:10px;
    margin-bottom: 10px;
    font-weight: 1000;
    letter-spacing:.2px;
  }
  .dot{
    width: 12px; height: 12px; border-radius:999px;
    background: linear-gradient(135deg, var(--violet), var(--cyan));
    box-shadow: 0 0 20px rgba(124,92,255,.35);
  }
  .brandName{ font-size: 14px; opacity: .95; }

  .title{
    margin: 0;
    font-size: 34px;
    font-weight: 1000;
    letter-spacing: -0.6px;
    text-shadow:
      0 0 10px rgba(34,211,238,.18),
      0 0 24px rgba(124,92,255,.14);
  }
  .sub{
    margin: 8px 0 0;
    font-size: 14px;
    color: rgba(255,255,255,.78);
  }

  .neonFlicker{ animation: neonFlicker 6.2s infinite; }
  @keyframes neonFlicker{
    0%, 19%, 22%, 62%, 64%, 100%{ opacity: 1; filter: brightness(1.12); }
    20%, 21%, 63%{ opacity: .68; filter: brightness(.88); }
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
    text-shadow:
      0 0 14px rgba(34,211,238,.22),
      0 0 34px rgba(124,92,255,.16);
    filter: saturate(1.15);
    animation: sweep 4.6s linear infinite;
  }
  .sweepSlow{ animation-duration: 6.2s; }
  @keyframes sweep{
    0%{ background-position: 0% 50%; }
    100%{ background-position: 200% 50%; }
  }

  /* Flash messages */
  .flash{
    margin: 14px auto 10px;
    width: 100%;
    padding: 10px 12px;
    border-radius: 14px;
    border: 1px solid rgba(255,255,255,.14);
    background: rgba(0,0,0,.22);
    font-weight: 900;
    text-align:center;
  }
  .flash.success{ border-color: rgba(52,211,153,.35); background: rgba(52,211,153,.10); }
  .flash.error{ border-color: rgba(251,113,133,.35); background: rgba(251,113,133,.10); }
  .flash.info{ border-color: rgba(34,211,238,.35); background: rgba(34,211,238,.08); }

  /* Form */
  .formGrid{
    margin-top: 10px;
    display:flex;
    flex-direction:column;
    gap: 12px;
  }

  .field{
    display:flex;
    flex-direction:column;
    gap: 8px;
    text-align:left;
  }
  .field label{
    font-size: 12px;
    font-weight: 900;
    opacity: .9;
  }

  .field input{
    width:100%;
    padding: 12px 12px;
    border-radius: 14px;
    border: 1px solid rgba(255,255,255,.14);
    outline: none;
    background: rgba(10,14,34,.32);
    color: rgba(255,255,255,.92);
    font-weight: 800;
  }
  .field input::placeholder{ color: rgba(255,255,255,.55); }
  .field input:focus{
    border-color: rgba(34,211,238,.34);
    box-shadow: 0 0 0 4px rgba(34,211,238,.10);
  }

  .btnPrimary{
    padding: 12px 14px;
    border: none;
    border-radius: 14px;
    font-weight: 1000;
    cursor: pointer;
    color: #0b1020;
    background: linear-gradient(135deg, rgba(34,211,238,.95), rgba(124,92,255,.88));
    box-shadow: 0 18px 40px rgba(0,0,0,.20);
    transition: transform .15s ease, filter .15s ease;
  }
  .btnPrimary:hover{ transform: translateY(-1px); filter: brightness(1.04); }
  .btnPrimary:disabled{ opacity:.7; cursor:not-allowed; transform:none; }

  .btnGhost{
    padding: 12px 14px;
    border-radius: 14px;
    border: 1px solid rgba(255,255,255,.14);
    background: rgba(255,255,255,.08);
    color: rgba(255,255,255,.92);
    font-weight: 1000;
    cursor:pointer;
    transition: transform .15s ease, background .15s ease;
  }
  .btnGhost:hover{ transform: translateY(-1px); background: rgba(255,255,255,.10); }
  .btnGhost:disabled{ opacity:.7; cursor:not-allowed; transform:none; }

  .btnLink{
    background: transparent;
    border: none;
    color: rgba(255,255,255,.82);
    font-weight: 900;
    cursor: pointer;
    padding: 6px 0 0;
    text-align: center;
    text-decoration: underline;
    opacity:.95;
  }
  .btnLink:disabled{ opacity:.6; cursor:not-allowed; }

  .formFoot{
    margin-top: 6px;
    display:flex;
    gap: 8px;
    justify-content:center;
    align-items:center;
    color: rgba(255,255,255,.78);
    font-weight: 800;
  }
  .linkStrong{
    color: rgba(255,255,255,.92);
    font-weight: 1000;
    text-decoration: none;
    border-bottom: 1px solid rgba(255,255,255,.25);
  }
  .linkStrong:hover{
    border-bottom-color: rgba(34,211,238,.55);
  }

  @media (max-width: 520px){
    .shell{ padding: 22px 16px; }
    .title{ font-size: 30px; }
  }
`;