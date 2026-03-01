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
  const stars = useMemo(() => Array.from({ length: 30 }, (_, i) => i), []);

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
    <>
      <style>{css}</style>

      <div className="authWrap">
        {/* 🌌 Space Background */}
        <div className="spaceBg">
          <div className="spaceBase" />
          <div className="nebula n1" />
          <div className="nebula n2" />
          <div className="nebula n3" />

          <div className="starLayer">
            {stars.map((i) => (
              <span key={i} className="star" />
            ))}
          </div>
        </div>

        {/* Login Card */}
        <div className="card">
          <h1 className="title sweepText">Login</h1>

          {msg.text && (
            <div className={`msg ${msg.type}`}>
              {msg.text}
            </div>
          )}

          <form onSubmit={handleLogin} className="form">
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

            <button className="btnPrimary" disabled={busy}>
              {busy ? "Please wait..." : "Login"}
            </button>
          </form>

          <button className="btnGhost" onClick={handleGoogleLogin}>
            Continue with Google
          </button>

          <button className="btnLink" onClick={handleReset}>
            Forgot password?
          </button>

          <p className="footer">
            New user? <Link to="/register">Register</Link>
          </p>
        </div>
      </div>
    </>
  );
}

/* 🔥 PREMIUM SPACE CSS */
const css = `
.authWrap{
  min-height:100vh;
  display:grid;
  place-items:center;
  background:#050714;
  color:white;
  font-family: ui-sans-serif, system-ui;
  position:relative;
  overflow:hidden;
}

.spaceBg{
  position:fixed;
  inset:0;
  z-index:0;
}

.spaceBase{
  position:absolute;
  inset:0;
  background:
    radial-gradient(1200px 700px at 20% 20%, rgba(34,211,238,.18), transparent 60%),
    radial-gradient(1000px 700px at 80% 30%, rgba(124,92,255,.18), transparent 60%),
    linear-gradient(180deg, #050714, #070B22);
}

.nebula{
  position:absolute;
  width:600px;
  height:600px;
  border-radius:50%;
  filter:blur(40px);
  opacity:.5;
}
.n1{ left:-200px; top:-200px; background:rgba(124,92,255,.6); }
.n2{ right:-200px; top:100px; background:rgba(34,211,238,.6); }
.n3{ left:40%; bottom:-300px; background:rgba(255,92,122,.4); }

.starLayer{ position:absolute; inset:0; }
.star{
  position:absolute;
  width:2px;
  height:2px;
  background:white;
  border-radius:50%;
  opacity:.8;
  animation:twinkle 3s infinite ease-in-out;
}
@keyframes twinkle{
  0%,100%{ opacity:.3 }
  50%{ opacity:1 }
}

.card{
  position:relative;
  z-index:2;
  width:360px;
  padding:30px;
  border-radius:20px;
  background:rgba(255,255,255,.08);
  backdrop-filter:blur(20px);
  border:1px solid rgba(255,255,255,.15);
}

.title{
  text-align:center;
  font-size:34px;
  margin-bottom:20px;
}

.sweepText{
  background: linear-gradient(90deg,#fff,#22D3EE,#7C5CFF,#fff);
  background-size:200% 100%;
  -webkit-background-clip:text;
  color:transparent;
  animation:sweep 4s linear infinite;
}
@keyframes sweep{
  0%{ background-position:0% 50% }
  100%{ background-position:200% 50% }
}

.form{
  display:flex;
  flex-direction:column;
  gap:12px;
}

input{
  padding:12px;
  border-radius:12px;
  border:1px solid rgba(255,255,255,.2);
  background:rgba(0,0,0,.3);
  color:white;
}

.btnPrimary{
  padding:12px;
  border:none;
  border-radius:12px;
  background:linear-gradient(135deg,#22D3EE,#7C5CFF);
  font-weight:bold;
  cursor:pointer;
}

.btnGhost{
  margin-top:10px;
  width:100%;
  padding:10px;
  border-radius:12px;
  background:rgba(255,255,255,.1);
  border:1px solid rgba(255,255,255,.2);
  color:white;
  cursor:pointer;
}

.btnLink{
  margin-top:8px;
  background:none;
  border:none;
  color:#22D3EE;
  cursor:pointer;
}

.footer{
  text-align:center;
  margin-top:15px;
}
.msg{
  text-align:center;
  margin-bottom:10px;
}
`;