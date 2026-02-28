import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth } from "../firebase";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
} from "firebase/auth";

export default function Register() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [busy, setBusy] = useState(false);
  const [waitingVerify, setWaitingVerify] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const showMsg = (type, text) => setMsg({ type, text });

  const stars = useMemo(() => Array.from({ length: 22 }, (_, i) => i), []);

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!email || !password) return showMsg("error", "Enter email and password.");
    if (password.length < 6) return showMsg("error", "Password must be at least 6 characters.");

    try {
      setBusy(true);
      setMsg({ type: "", text: "" });

      const userCred = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );

      // save for auto fill
      localStorage.setItem("tempEmail", email.trim());
      localStorage.setItem("tempPassword", password);

      await sendEmailVerification(userCred.user);

      // logout immediately (recommended)
      await signOut(auth);

      setWaitingVerify(true);
      showMsg("success", "Verification link sent. Please verify your email to continue.");
    } catch (err) {
      const code = err?.code || "";
      if (code === "auth/email-already-in-use") showMsg("error", "Email already registered.");
      else if (code === "auth/invalid-email") showMsg("error", "Invalid email.");
      else if (code === "auth/weak-password") showMsg("error", "Weak password. Use at least 6 characters.");
      else showMsg("error", "Registration failed. Try again.");
    } finally {
      setBusy(false);
    }
  };

  /* Auto verify detect (works only if user is logged in on this page)
     Since we signOut above, we show a clean "verified? then login" message instead. */
  useEffect(() => {
    if (!waitingVerify) return;

    const interval = setInterval(async () => {
      // If the user comes back logged in (rare), we can still detect verification
      const user = auth.currentUser;
      if (!user) return;

      await user.reload();
      if (user.emailVerified) {
        clearInterval(interval);
        showMsg("success", "Email verified. Redirecting to login…");
        setTimeout(() => navigate("/login"), 1200);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [waitingVerify, navigate]);

  return (
    <>
      <style>{css}</style>

      <div className="authPage">
        {/* 🌌 SPACE BACKGROUND */}
        <div className="bgFx" aria-hidden="true">
          <div className="bgBase" />
          <div className="orb o1" />
          <div className="orb o2" />
          <div className="orb o3" />
          <div className="orb o4" />

          {/* subtle stars (optional) */}
          <div className="starLayer">
            {stars.map((i) => (
              <span
                key={i}
                className="star"
                style={{
                  top: `${(i * 37) % 100}%`,
                  left: `${(i * 61) % 100}%`,
                  width: `${i % 9 === 0 ? 3 : 2}px`,
                  height: `${i % 9 === 0 ? 3 : 2}px`,
                  animationDelay: `${(i % 9) * 0.25}s`,
                  animationDuration: `${2.8 + (i % 7) * 0.5}s`,
                }}
              />
            ))}
          </div>

          <div className="grain" />
          <div className="vignette" />
        </div>

        {/* Home button TOP RIGHT */}
        <button className="homeBtn" onClick={() => navigate("/")}>
          ⟵ Home
        </button>

        <div className="authShell">
          {/* LEFT: Branding */}
          <div className="authLeft">
            <div className="brandTop">
              <div className="brandDot" />
              <span className="brandName">AI Image Studio</span>
            </div>

            <h2 className="brandTitle neonFlicker">
              <span className="sweepText sweepSlow">Create your account</span>
            </h2>

            <p className="brandSub">
              Register once, verify your email, and unlock a smooth premium-ready experience.
            </p>

            <div className="brandStats">
              <div className="statBox">
                <div className="statNum">📩</div>
                <div className="statText">Email verification</div>
              </div>
              <div className="statBox">
                <div className="statNum">🛡️</div>
                <div className="statText">Secure access</div>
              </div>
              <div className="statBox">
                <div className="statNum">⚡</div>
                <div className="statText">Fast tools</div>
              </div>
            </div>
          </div>

          {/* RIGHT: Form */}
          <div className="authRight">
            <div className="formHead">
              <h1 className="hTitle">
                <span className="sweepTextAlt sweepAlt">Register</span>
              </h1>
              <p>Create an account to continue</p>
            </div>

            {msg.text ? <div className={`flash ${msg.type}`}>{msg.text}</div> : null}

            {!waitingVerify ? (
              <form onSubmit={handleRegister} className="formGrid">
                <div className="field">
                  <label>Email</label>
                  <input
                    type="email"
                    value={email}
                    placeholder="example@gmail.com"
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>

                <div className="field">
                  <label>Password</label>
                  <input
                    type="password"
                    value={password}
                    placeholder="Minimum 6 characters"
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                  />
                </div>

                <button className="btnPrimary" disabled={busy}>
                  {busy ? (
                    <span className="btnInline">
                      <span className="spinner" /> Creating…
                    </span>
                  ) : (
                    "Create account"
                  )}
                </button>

                <div className="formFoot">
                  <span>Already have an account?</span>
                  <Link to="/login" className="linkStrong">
                    Login
                  </Link>
                </div>
              </form>
            ) : (
              <div className="verifyBox">
                <div className="verifyTitle">
                  <span className="sweepTextAlt sweepAlt">Verify your email</span>
                </div>
                <p className="verifyText">
                  We sent a verification link to <b>{email || "your email"}</b>.
                  Open your inbox and click the link, then come back and login.
                </p>

                <button className="btnGhost" type="button" onClick={() => navigate("/login")}>
                  Go to Login
                </button>

                <div className="formFoot" style={{ marginTop: 14 }}>
                  <span>Wrong email?</span>
                  <button
                    type="button"
                    className="linkBtn"
                    onClick={() => {
                      setWaitingVerify(false);
                      setMsg({ type: "", text: "" });
                    }}
                  >
                    Change
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
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

    --cyan:#22D3EE;
    --violet:#7C5CFF;
    --pink:#FF5C7A;
    --gold:#FFBE3C;
    --green:#34D399;
  }

  *{ box-sizing:border-box; }
  body{ margin:0; }

  .authPage{
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
  .bgFx{ position:fixed; inset:0; z-index:0; pointer-events:none; overflow:hidden; }

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

  .starLayer{ position:absolute; inset:0; opacity:.65; }
  .star{
    position:absolute;
    border-radius:50%;
    background: rgba(255,255,255,.92);
    box-shadow: 0 0 12px rgba(255,255,255,.22);
    animation: twinkle 3.6s ease-in-out infinite;
  }
  @keyframes twinkle{
    0%,100%{ opacity:.18; transform: scale(1); }
    50%{ opacity:.95; transform: scale(1.55); }
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

  /* Home */
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

  /* Shell */
  .authShell{
    position:relative;
    z-index:2;
    width: min(980px, 96vw);
    border-radius: 28px;
    overflow:hidden;
    border: 1px solid rgba(255,255,255,.14);
    background: linear-gradient(180deg, rgba(255,255,255,.10), rgba(255,255,255,.05));
    backdrop-filter: blur(18px);
    box-shadow: var(--shadow);
    display:grid;
    grid-template-columns: 1.05fr 1fr;
  }

  @media (max-width: 860px){
    .authShell{ grid-template-columns: 1fr; }
    .authLeft{ display:none; }
  }

  .authLeft{
    padding: 28px 26px;
    border-right: 1px solid rgba(255,255,255,.10);
    background: rgba(10, 14, 34, 0.20);
  }

  .brandTop{
    display:flex;
    align-items:center;
    gap: 10px;
    font-weight: 1000;
    letter-spacing:.2px;
  }
  .brandDot{
    width: 12px; height: 12px;
    border-radius:999px;
    background: linear-gradient(135deg, var(--violet), var(--cyan));
    box-shadow: 0 0 18px rgba(124,92,255,.25);
  }
  .brandName{ opacity:.92; }

  .brandTitle{
    margin: 16px 0 10px;
    font-size: 34px;
    line-height: 1.05;
    letter-spacing: -0.6px;
  }
  .brandSub{
    margin: 0;
    color: rgba(255,255,255,.75);
    font-size: 13.5px;
    max-width: 56ch;
  }

  .brandStats{
    margin-top: 18px;
    display:grid;
    grid-template-columns: 1fr;
    gap: 10px;
  }
  .statBox{
    display:flex;
    align-items:center;
    gap: 10px;
    border-radius: 18px;
    padding: 12px 12px;
    border: 1px solid rgba(255,255,255,.12);
    background: rgba(255,255,255,.05);
  }
  .statNum{ width: 34px; height: 34px; display:grid; place-items:center; border-radius: 14px; background: rgba(255,255,255,.06); }
  .statText{ font-weight: 900; opacity:.9; }

  .authRight{
    padding: 28px 26px;
  }

  .formHead h1{
    margin:0;
    font-size: 28px;
    font-weight: 1000;
    letter-spacing: -0.4px;
  }
  .formHead p{
    margin: 8px 0 0;
    color: rgba(255,255,255,.75);
    font-size: 13.5px;
  }

  /* Flash */
  .flash{
    margin-top: 14px;
    padding: 10px 12px;
    border-radius: 14px;
    border: 1px solid rgba(255,255,255,.12);
    background: rgba(255,255,255,.06);
    font-weight: 900;
    text-align:center;
  }
  .flash.success{ border-color: rgba(52,211,153,.28); }
  .flash.error{ border-color: rgba(255,92,122,.28); }
  .flash.info{ border-color: rgba(34,211,238,.28); }

  .formGrid{
    margin-top: 16px;
    display:flex;
    flex-direction:column;
    gap: 12px;
  }

  .field label{
    display:block;
    font-size: 12px;
    font-weight: 900;
    margin-bottom: 6px;
    color: rgba(255,255,255,.82);
  }
  .field input{
    width:100%;
    padding: 12px 12px;
    border-radius: 14px;
    border: 1px solid rgba(255,255,255,.14);
    background: rgba(10, 14, 34, 0.22);
    color: rgba(255,255,255,.92);
    outline: none;
    font-weight: 800;
  }
  .field input:focus{
    border-color: rgba(34,211,238,.28);
    box-shadow: 0 0 0 4px rgba(34,211,238,.08);
  }

  /* Buttons */
  .btnPrimary{
    margin-top: 6px;
    width:100%;
    border:none;
    border-radius: 16px;
    padding: 12px 14px;
    font-weight: 1000;
    cursor:pointer;
    color: rgba(10,14,24,.95);
    background: linear-gradient(135deg, rgba(34,211,238,.95), rgba(124,92,255,.85));
    box-shadow: 0 18px 40px rgba(0,0,0,.30);
    transition: transform .14s ease, filter .14s ease;
  }
  .btnPrimary:hover{ transform: translateY(-1px); filter: brightness(1.06); }
  .btnPrimary:disabled{ opacity:.65; cursor:not-allowed; transform:none; }

  .btnGhost{
    margin-top: 10px;
    width:100%;
    border-radius: 16px;
    padding: 12px 14px;
    font-weight: 1000;
    cursor:pointer;
    color: rgba(255,255,255,.92);
    border: 1px solid rgba(255,255,255,.14);
    background: rgba(255,255,255,.07);
    backdrop-filter: blur(14px);
    box-shadow: 0 18px 40px rgba(0,0,0,.25);
    transition: transform .14s ease, background .14s ease, border-color .14s ease;
  }
  .btnGhost:hover{
    transform: translateY(-1px);
    background: rgba(255,255,255,.09);
    border-color: rgba(34,211,238,.22);
  }

  /* footer */
  .formFoot{
    margin-top: 14px;
    display:flex;
    justify-content:center;
    align-items:center;
    gap: 8px;
    color: rgba(255,255,255,.78);
    font-weight: 800;
  }
  .linkStrong{
    color: rgba(255,255,255,.92);
    text-decoration: none;
    font-weight: 1000;
    border-bottom: 1px solid rgba(34,211,238,.35);
    padding-bottom: 2px;
  }
  .linkStrong:hover{
    border-bottom-color: rgba(255,92,122,.45);
  }

  .linkBtn{
    background: transparent;
    border: none;
    color: rgba(255,255,255,.92);
    font-weight: 1000;
    cursor: pointer;
    border-bottom: 1px solid rgba(34,211,238,.35);
    padding: 0 0 2px;
  }
  .linkBtn:hover{ border-bottom-color: rgba(255,92,122,.45); }

  /* Verify box */
  .verifyBox{
    margin-top: 16px;
    padding: 14px 14px;
    border-radius: 18px;
    border: 1px solid rgba(255,255,255,.12);
    background: rgba(255,255,255,.06);
    text-align:center;
  }
  .verifyTitle{
    font-size: 18px;
    font-weight: 1000;
    margin-bottom: 8px;
  }
  .verifyText{
    margin: 0;
    color: rgba(255,255,255,.78);
    font-size: 13.5px;
    line-height: 1.5;
  }

  /* Light pass text */
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
    background: linear-gradient(90deg, var(--cyan), var(--pink), var(--violet), var(--gold), var(--cyan));
    background-size: 240% 100%;
    -webkit-background-clip:text;
    background-clip:text;
    color: transparent;
    filter: saturate(1.2);
    animation: sweep 5.4s linear infinite reverse;
    font-weight: 1000;
  }
  .sweepAlt{ animation-duration: 5.6s; }

  @keyframes sweep{
    0%{ background-position: 0% 50%; }
    100%{ background-position: 200% 50%; }
  }

  /* Neon flicker */
  .neonFlicker{ animation: neonFlicker 6.2s infinite; }
  @keyframes neonFlicker{
    0%, 18%, 22%, 62%, 66%, 100%{ opacity: 1; filter: brightness(1.12); }
    19%, 21%, 64%{ opacity: .72; filter: brightness(.92); }
  }

  /* spinner */
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
`;