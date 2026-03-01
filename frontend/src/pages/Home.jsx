import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Home() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  /* ✅ parse profile only once */
  const savedProfile = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("profile") || "{}");
    } catch {
      return {};
    }
  }, []);

  const displayName = user?.displayName || savedProfile?.name || "User";
  const displayEmail = user?.email || savedProfile?.email || "";
  const userPhoto = user?.photoURL || savedProfile?.photo || "";

  const [showDropdown, setShowDropdown] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const profileRef = useRef(null);

  const [parallax, setParallax] = useState({ x: 0, y: 0 });
  const stars = useMemo(() => Array.from({ length: 40 }, (_, i) => i), []);

  /* close dropdown */
  useEffect(() => {
    const onDown = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  /* ✅ parallax only desktop */
  useEffect(() => {
    if (window.innerWidth <= 768) return;

    const onMove = (e) => {
      const w = window.innerWidth || 1;
      const h = window.innerHeight || 1;
      const x = (e.clientX / w - 0.5) * 2;
      const y = (e.clientY / h - 0.5) * 2;
      setParallax({ x, y });
    };

    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  const handleLogout = async () => {
    setLoadingMsg("Logging out...");
    setTimeout(async () => {
      try {
        await logout();
        localStorage.removeItem("profile");
        localStorage.removeItem("tempEmail");
        localStorage.removeItem("tempPassword");
      } finally {
        setShowDropdown(false);
        setLoadingMsg("");
        navigate("/login");
      }
    }, 900);
  };

  const go = (path) => navigate(path);

  return (
    <>
      <style>{css}</style>

      <div className="homePage">

        {/* 🌌 BACKGROUND */}
        <div className="spaceBg" aria-hidden="true">
          <div className="spaceBase" />

          <div
            className="nebula n1"
            style={{
              transform: `translate(${parallax.x * -18}px, ${parallax.y * -12}px)`,
            }}
          />
          <div
            className="nebula n2"
            style={{
              transform: `translate(${parallax.x * 22}px, ${parallax.y * 16}px)`,
            }}
          />
          <div
            className="nebula n3"
            style={{
              transform: `translate(${parallax.x * -12}px, ${parallax.y * 22}px)`,
            }}
          />

          <div className="starLayer">
            {stars.map((i) => {
              const top = (i * 37) % 100;
              const left = (i * 61) % 100;
              const delay = (i % 9) * 0.22;
              const dur = 2.6 + (i % 7) * 0.45;
              const size = i % 10 === 0 ? 3 : 2;

              return (
                <span
                  key={i}
                  className="star"
                  style={{
                    top: `${top}%`,
                    left: `${left}%`,
                    animationDelay: `${delay}s`,
                    animationDuration: `${dur}s`,
                    width: `${size}px`,
                    height: `${size}px`,
                  }}
                />
              );
            })}
          </div>

          <div className="grain" />
          <div className="vignette" />
        </div>

        {/* NAVBAR */}
        <header className="topBar">
          <div className="tbSide" />

          <div className="brandCenter">
            <span className="dot" />
            <span className="brandName">AI Image Studio</span>
          </div>

          <div className="navRight">
            <button className="btnPremium" onClick={() => go("/premium")}>
              ⭐ Premium
            </button>

            {!user ? (
              <button className="btnGhost" onClick={() => go("/login")}>
                Login
              </button>
            ) : (
              <div className="profileWrap" ref={profileRef}>
                <button
                  className="avatarBtn"
                  onClick={() => setShowDropdown((s) => !s)}
                >
                  {userPhoto ? (
                    <img
                      src={userPhoto}
                      alt="avatar"
                      className="avatarImg"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="avatarImg avatarFallback">
                      {(displayName?.[0] || "U").toUpperCase()}
                    </div>
                  )}
                  <span className="chev">▾</span>
                </button>

                {showDropdown && (
                  <div className="dropdown">
                    <div className="ddHeader">
                      <div className="ddName">{displayName}</div>
                      <div className="ddMail">{displayEmail}</div>
                    </div>

                    <button className="ddBtn ddRed" onClick={handleLogout}>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </header>

        {/* HERO */}
        <main className="hero">
          <div className="heroBadge">🌌 Space UI • Fast • Premium Ready</div>

          <h1 className="heroTitle neonFlicker">
            <span className="sweepText sweepSlow">
              Create stunning images with AI
            </span>
          </h1>

          <p className="heroDesc">
            Pick a tool below. Each card includes smooth interaction and a premium feel.
          </p>

          <div className="cards">
            <button className="card" onClick={() => go("/bg-remove")}>
              <div className="cardIcon">🎯</div>
              <div className="cardText">
                <div className="cardTitle">Background Remover</div>
                <div className="cardSub">Clean cut • Pro output</div>
              </div>
              <div className="arrow">›</div>
            </button>

            <button className="card" onClick={() => go("/enhance")}>
              <div className="cardIcon">✨</div>
              <div className="cardText">
                <div className="cardTitle">Image Enhancer</div>
                <div className="cardSub">Sharper • HD look</div>
              </div>
              <div className="arrow">›</div>
            </button>

            <button className="card" onClick={() => go("/sketch")}>
              <div className="cardIcon">🎨</div>
              <div className="cardText">
                <div className="cardTitle">Pencil Sketch Effect</div>
                <div className="cardSub">Stylish • Realistic Sketch</div>
              </div>
              <div className="arrow">›</div>
            </button>
          </div>
        </main>

        {loadingMsg && (
          <div className="loadingOverlay">
            <div className="loadingBox">{loadingMsg}</div>
          </div>
        )}
      </div>
    </>
  );
}

const css = `
  :root{
    --bg0:#050714;
    --bg1:#070B22;

    --glass: rgba(255,255,255,.08);
    --stroke: rgba(255,255,255,.14);

    --text: rgba(255,255,255,.92);
    --muted: rgba(255,255,255,.72);

    --shadow: 0 28px 80px rgba(0,0,0,.55);
    --shadow2: 0 12px 40px rgba(0,0,0,.35);

    --cyan:#22D3EE;
    --violet:#7C5CFF;
    --pink:#FF5C7A;
    --gold:#FFBE3C;
  }

  *{ box-sizing:border-box; }
  body{ margin:0; }

  .homePage{
    min-height:100vh;
    position:relative;
    overflow:hidden;
    color:var(--text);
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
    will-change: transform;
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

  .starLayer{ position:absolute; inset:0; opacity:.9; }
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

  /* Top bar */
  .topBar{
    position:relative;
    z-index:10;
    padding: 18px 22px;
    display:grid;
    grid-template-columns: 1fr auto 1fr;
    align-items:center;
    gap: 14px;
    background: rgba(12, 16, 36, 0.40);
    border-bottom: 1px solid rgba(255,255,255,0.10);
    backdrop-filter: blur(16px);
  }
  .tbSide{ height: 1px; }

  .brandCenter{
    display:flex;
    align-items:center;
    gap:10px;
    justify-content:center;
    font-weight: 1000;
    letter-spacing:.2px;
  }
  .dot{
    width: 12px; height: 12px; border-radius:999px;
    background: linear-gradient(135deg, var(--violet), var(--cyan));
    box-shadow: 0 0 20px rgba(124,92,255,.35);
  }
  .brandName{ font-size: 16px; }

  .navRight{
    display:flex;
    align-items:center;
    justify-content:flex-end;
    gap: 10px;
    flex-wrap:wrap;
  }

  .btnPremium{
    padding: 10px 14px;
    border-radius: 999px;
    border: 1px solid rgba(255,255,255,.14);
    background: linear-gradient(135deg, rgba(255,190,60,.95), rgba(255,92,122,.85));
    color: #0b1020;
    font-weight: 1000;
    cursor:pointer;
    box-shadow: 0 18px 40px rgba(0,0,0,.22);
    transition: transform .15s ease, filter .15s ease;
  }
  .btnPremium:hover{ transform: translateY(-1px); filter: brightness(1.05); }

  .btnGhost{
    padding: 10px 14px;
    border-radius: 999px;
    border: 1px solid rgba(255,255,255,.14);
    background: rgba(255,255,255,.08);
    color: rgba(255,255,255,.92);
    font-weight: 900;
    cursor:pointer;
    box-shadow: 0 18px 40px rgba(0,0,0,.18);
    transition: transform .15s ease, background .15s ease;
  }
  .btnGhost:hover{ transform: translateY(-1px); background: rgba(255,255,255,.10); }

  /* Profile dropdown */
  .profileWrap{ position:relative; }
  .avatarBtn{
    display:flex;
    align-items:center;
    gap: 8px;
    padding: 6px 10px;
    border-radius: 999px;
    border: 1px solid rgba(255,255,255,.14);
    background: rgba(255,255,255,.08);
    cursor:pointer;
    color: rgba(255,255,255,.9);
    box-shadow: 0 18px 40px rgba(0,0,0,.18);
    transition: transform .15s ease, background .15s ease;
  }
  .avatarBtn:hover{ transform: translateY(-1px); background: rgba(255,255,255,.10); }

  .avatarImg{
    width: 34px; height: 34px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid rgba(34,211,238,.65);
    display:block;
  }
  .avatarFallback{
    display:grid;
    place-items:center;
    font-weight: 1000;
    background: rgba(255,255,255,.10);
    border: 2px solid rgba(34,211,238,.65);
  }
  .chev{ opacity:.8; font-weight:1000; }

  .dropdown{
    position:absolute;
    top: 58px;
    right: 0;
    width: 250px;
    border-radius: 18px;
    background: rgba(16, 22, 46, 0.92);
    border: 1px solid rgba(255,255,255,0.12);
    backdrop-filter: blur(18px);
    padding: 10px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.6);
  }
  .ddHeader{
    padding: 10px 10px 8px;
    border-bottom: 1px solid rgba(255,255,255,0.10);
    margin-bottom: 8px;
  }
  .ddName{ font-weight: 1000; font-size: 14px; }
  .ddMail{ font-size: 12px; opacity: .75; margin-top: 3px; word-break: break-word; }

  .ddBtn{
    width:100%;
    padding: 10px 12px;
    border-radius: 14px;
    border: none;
    cursor:pointer;
    font-weight: 1000;
    margin-top: 8px;
    color: white;
  }
  .ddRed{
    background: linear-gradient(135deg, rgba(255,92,122,.95), rgba(255,190,60,.85));
  }

  /* Hero */
  .hero{
    position:relative;
    z-index:5;
    padding: 56px 18px 40px;
    display:flex;
    flex-direction:column;
    align-items:center;
    text-align:center;
    gap: 14px;
  }

  .heroBadge{
    padding: 8px 14px;
    border-radius: 999px;
    border: 1px solid rgba(255,255,255,0.14);
    background: rgba(255,255,255,0.07);
    font-weight: 1000;
    font-size: 12px;
  }

  .heroTitle{
    margin: 0;
    font-size: clamp(34px, 5vw, 58px);
    line-height: 1.02;
    letter-spacing: -0.6px;
    max-width: 22ch;
    text-shadow:
      0 0 10px rgba(34,211,238,.18),
      0 0 24px rgba(124,92,255,.14);
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
  .sweepMid{ animation-duration: 4.8s; }
  .sweepFast{ animation-duration: 4.0s; }
  .sweepAlt{ animation-duration: 5.4s; animation-direction: reverse; }

  @keyframes sweep{
    0%{ background-position: 0% 50%; }
    100%{ background-position: 200% 50%; }
  }

  .heroDesc{
    margin: 0;
    max-width: 64ch;
    font-size: 14px;
    color: rgba(255,255,255,.78);
  }

  /* Cards */
  .cards{
    margin-top: 18px;
    display:flex;
    gap: 16px;
    flex-wrap: wrap;
    justify-content:center;
  }
  .card{
    width: min(360px, 92vw);
    padding: 18px 18px;
    border-radius: 22px;
    border: 1px solid rgba(255,255,255,0.16);
    background: linear-gradient(135deg, rgba(255,255,255,0.10), rgba(255,255,255,0.04));
    backdrop-filter: blur(18px);
    cursor:pointer;
    display:flex;
    align-items:center;
    gap: 14px;
    box-shadow: 0 18px 40px rgba(0,0,0,0.30);
    transition: transform .16s ease, border-color .16s ease, background .16s ease;
    color: rgba(255,255,255,.92);
  }
  .card:hover{
    transform: translateY(-3px) scale(1.01);
    border-color: rgba(34,211,238,0.28);
    background: linear-gradient(135deg, rgba(255,255,255,0.12), rgba(255,255,255,0.05));
  }
  .card:active{ transform: translateY(-1px) scale(0.995); }

  .cardIcon{ font-size: 24px; }
  .cardText{ flex:1; text-align:left; }
  .cardTitle{ font-weight: 1000; font-size: 16px; }
  .cardSub{ opacity: .82; font-size: 12px; margin-top: 4px; }
  .arrow{ font-size: 28px; opacity:.9; }

  /* Loading */
  .loadingOverlay{
    position:fixed; inset:0;
    background: rgba(0,0,0,0.55);
    display:flex;
    align-items:center;
    justify-content:center;
    z-index: 9999;
  }
  .loadingBox{
    padding: 16px 22px;
    border-radius: 16px;
    background: rgba(255,255,255,0.12);
    border: 1px solid rgba(255,255,255,0.18);
    backdrop-filter: blur(14px);
    font-weight: 1000;
  }

  /* Mobile tweaks */
  @media (max-width: 520px){
    .topBar{ padding: 14px 14px; }
    .btnPremium, .btnGhost{ padding: 9px 12px; }
    .hero{ padding: 44px 16px 34px; }
  }
`;