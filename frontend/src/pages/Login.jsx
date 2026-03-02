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

  const stars = useMemo(() => Array.from({ length: 44 }, (_, i) => i), []);
  const showMsg = (type, text) => setMsg({ type, text });

  /* ✅ redirect if already logged */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) navigate("/");
    });
    return () => unsub();
  }, [navigate]);

  useEffect(() => {
    setTimeout(() => emailRef.current?.focus(), 60);
  }, []);

  /* ================= EMAIL LOGIN ================= */
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return showMsg("error", "Enter email and password.");

    try {
      setBusy(true);
      setMsg({ type: "", text: "" });

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
      showMsg("error", "Login failed. Check email & password.");
    } finally {
      setBusy(false);
    }
  };

  /* ================= GOOGLE LOGIN ================= */
  const handleGoogleLogin = async () => {
    try {
      setBusy(true);
      setMsg({ type: "", text: "" });

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
      setMsg({ type: "", text: "" });

      await sendPasswordResetEmail(auth, email.trim());
      showMsg("success", "Reset link sent ✅ Check inbox/spam.");
    } catch {
      showMsg("error", "Reset failed ❌");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <style>{css}</style>

      <div className="authWrap">
        {/* 🌌 Premium Space BG */}
        <div className="spaceBg" aria-hidden="true">
          <div className="spaceBase" />

          <div className="orb o1" />
          <div className="orb o2" />
          <div className="orb o3" />
          <div className="orb o4" />

          <div className="starLayer">
            {stars.map((i) => {
              const top = (i * 37) % 100;
              const left = (i * 61) % 100;
              const delay = (i % 9) * 0.22;
              const dur = 2.8 + (i % 7) * 0.45;
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

        {/* Card */}
        <div className="card">
          <div className="brandRow">
            <span className="dot" />
            <span className="brandName">AI Image Studio</span>
          </div>

          <h1 className="title neonFlicker">
            <span className="sweepText sweepSlow">Login</span>
          </h1>
          <p className="sub">Continue to your dashboard</p>

          {msg.text ? (
            <div className={`flash ${msg.type}`}>
              {msg.type === "error" ? "✖ " : msg.type === "success" ? "✔ " : "ℹ "}
              {msg.text}
            </div>
          ) : null}

          <form onSubmit={handleLogin} className="formGrid">
            <div className="field">
              <label>Email</label>
              <input
                ref={emailRef}
                type="email"
                placeholder="example@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <div className="field">
              <label>Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>

            <button className="btnPrimary" disabled={busy}>
              {busy ? "Please wait..." : "Login"}
            </button>

            <button
              type="button"
              className="btnGhost"
              onClick={handleGoogleLogin}
              disabled={busy}
            >
              Continue with Google
            </button>

            <button
              type="button"
              className="btnLink"
              onClick={handleReset}
              disabled={busy}
            >
              Forgot password?
            </button>

            <div className="formFoot">
              <span>New user?</span>
              <Link to="/register" className="linkStrong">
                Register
              </Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

/* ✅ Premium CSS */
const css = `
:root{
  --bg0:#050714;
  --bg1:#070B22;
  --text: rgba(255,255,255,.92);
  --muted: rgba(255,255,255,.72);
  --glass: rgba(255,255,255,.08);
  --stroke: rgba(255,255,255,.14);
  --shadow: 0 28px 90px rgba(0,0,0,.60);

  --cyan:#22D3EE;
  --violet:#7C5CFF;
  --pink:#FF5C7A;
  --gold:#FFBE3C;
}

*{ box-sizing:border-box; }
body{ margin:0; }

.authWrap{
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
.spaceBg{ position:fixed; inset:0; z-index:0; pointer-events:none; overflow:hidden; }

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
  background:
    radial-gradient(1200px 800px at 50% 10%, rgba(255,255,255,.05), transparent 60%),
    radial-gradient(900px 700px at 50% 110%, rgba(0,0,0,.70), transparent 58%);
  opacity:.9;
}

/* Card */
.card{
  position:relative;
  z-index:2;
  width: min(420px, 92vw);
  border-radius: 26px;
  padding: 26px 22px;
  background: linear-gradient(180deg, rgba(255,255,255,.10), rgba(255,255,255,.05));
  border: 1px solid rgba(255,255,255,.14);
  backdrop-filter: blur(18px);
  box-shadow: var(--shadow);
}

.brandRow{
  display:flex;
  align-items:center;
  gap:10px;
  justify-content:center;
  margin-bottom: 10px;
}
.dot{
  width: 12px; height: 12px; border-radius:999px;
  background: linear-gradient(135deg, var(--violet), var(--cyan));
  box-shadow: 0 0 20px rgba(124,92,255,.35);
}
.brandName{ font-weight: 1000; letter-spacing:.2px; }

/* Neon title + passing light */
.title{
  margin: 0;
  text-align:center;
  font-size: 34px;
  font-weight: 1000;
  letter-spacing: -.3px;
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
    #22d3ee,
    #7c5cff,
    #ff5c7a,
    #ffbe3c,
    #22d3ee,
    #ffffff
  );
  background-size: 260% 100%;
  -webkit-background-clip:text;
  background-clip:text;
  color: transparent;
  text-shadow:
    0 0 14px rgba(34,211,238,.28),
    0 0 34px rgba(124,92,255,.18),
    0 0 60px rgba(255,92,122,.10);
  filter: saturate(1.2);
  animation: sweep 4.6s linear infinite;
}
.sweepSlow{ animation-duration: 5.8s; }
@keyframes sweep{
  0%{ background-position: 0% 50%; }
  100%{ background-position: 200% 50%; }
}

.sub{
  margin: 10px 0 0;
  text-align:center;
  opacity:.78;
  font-size: 13px;
}

/* Flash msg */
.flash{
  margin-top: 14px;
  border-radius: 14px;
  padding: 10px 12px;
  border: 1px solid rgba(255,255,255,.14);
  background: rgba(0,0,0,.22);
  text-align:center;
  font-weight: 900;
}
.flash.success{ border-color: rgba(16,185,129,.35); }
.flash.error{ border-color: rgba(255,92,122,.45); }
.flash.info{ border-color: rgba(34,211,238,.35); }

/* Form */
.formGrid{
  margin-top: 16px;
  display:flex;
  flex-direction:column;
  gap: 12px;
}
.field label{
  display:block;
  font-size: 12px;
  opacity:.85;
  margin-bottom: 6px;
  font-weight: 900;
}
.field input{
  width:100%;
  padding: 12px 12px;
  border-radius: 14px;
  border: 1px solid rgba(255,255,255,.16);
  outline: none;
  background: rgba(10,14,34,.35);
  color: rgba(255,255,255,.92);
}
.field input:focus{
  border-color: rgba(34,211,238,.42);
  box-shadow: 0 0 0 3px rgba(34,211,238,.12);
}

.btnPrimary{
  width:100%;
  padding: 12px;
  border-radius: 16px;
  border: none;
  font-weight: 1000;
  cursor:pointer;
  color: #0b1020;
  background: linear-gradient(135deg, rgba(34,211,238,.95), rgba(124,92,255,.92));
}
.btnPrimary:disabled{ opacity:.75; cursor:not-allowed; }

.btnGhost{
  width:100%;
  padding: 12px;
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,.16);
  background: rgba(255,255,255,.08);
  color: rgba(255,255,255,.92);
  font-weight: 1000;
  cursor:pointer;
}
.btnGhost:disabled{ opacity:.75; cursor:not-allowed; }

.btnLink{
  width: 100%;
  background: transparent;
  border: none;
  color: rgba(34,211,238,.95);
  font-weight: 900;
  cursor:pointer;
  padding: 6px 0 0;
}

.formFoot{
  margin-top: 6px;
  display:flex;
  justify-content:center;
  gap: 6px;
  font-size: 13px;
  opacity:.9;
}
.linkStrong{
  color: rgba(255,255,255,.95);
  font-weight: 1000;
  text-decoration: none;
  border-bottom: 1px solid rgba(255,255,255,.25);
}
.linkStrong:hover{ border-bottom-color: rgba(34,211,238,.55); }
`;