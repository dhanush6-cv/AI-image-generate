import React, { useRef, useState } from "react";

export default function Contact() {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  const nameRef = useRef(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const showMsg = (type, text) => setMsg({ type, text });

  const onChange = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      return showMsg("error", "Fill Name, Email, Message.");
    }

    // ✅ Simple validation
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim());
    if (!emailOk) return showMsg("error", " Enter correct email address.");

    try {
      setBusy(true);
      setMsg({ type: "", text: "" });

      // ✅ Launch-ku fast: mailto fallback (no backend needed)
      //const to = "dhanushkarthick610@gmail.com"; // 🔥 change this
      const subject = encodeURIComponent(form.subject?.trim() || "Contact from AI Image Studio");
      const body = encodeURIComponent(
        `Name: ${form.name}\nEmail: ${form.email}\n\nMessage:\n${form.message}`
      );

      window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;

      // UI msg
      showMsg("success", "Email app will be open and send ✅");
      setForm({ name: "", email: "", subject: "", message: "" });
      setTimeout(() => nameRef.current?.focus(), 200);
    } catch (err) {
      console.log(err);
      showMsg("error", "Contact submit failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <style>{css}</style>

      <div className="contactWrap">
        {/* 🌌 Background */}
        <div className="spaceBg" aria-hidden="true">
          <div className="spaceBase" />
          <div className="nebula n1" />
          <div className="nebula n2" />
          <div className="nebula n3" />

          <div className="starLayer">
            {Array.from({ length: 26 }).map((_, i) => {
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

        {/* Card */}
        <div className="shell">
          <div className="head">
            <div className="brandRow">
              <span className="dot" />
              <span className="brandName">AI Image Studio</span>
            </div>

            <h1 className="title neonFlicker">
              <span className="sweepText sweepSlow">Contact Us</span>
            </h1>

          <p className="sub">
             Any issues / feedback? Message sent our contact page
            </p>
          </div>

          {msg.text ? (
            <div className={`flash ${msg.type}`}>
              {msg.type === "error" ? "✖ " : msg.type === "success" ? "✔ " : "ℹ "}
              {msg.text}
            </div>
          ) : null}

          <form className="formGrid" onSubmit={handleSubmit}>
            <div className="row2">
              <div className="field">
                <label>Name *</label>
                <input
                  ref={nameRef}
                  value={form.name}
                  onChange={(e) => onChange("name", e.target.value)}
                  placeholder="Your name"
                  autoComplete="name"
                />
              </div>

              <div className="field">
                <label>Email *</label>
                <input
                  value={form.email}
                  onChange={(e) => onChange("email", e.target.value)}
                  placeholder="example@gmail.com"
                  autoComplete="email"
                  spellCheck={false}
                />
              </div>
            </div>

            <div className="field">
              <label>Subject</label>
              <input
                value={form.subject}
                onChange={(e) => onChange("subject", e.target.value)}
                placeholder="(optional) Payment / Bug / Feedback..."
              />
            </div>

            <div className="field">
              <label>Message *</label>
              <textarea
                value={form.message}
                onChange={(e) => onChange("message", e.target.value)}
                placeholder="Write your message..."
                rows={6}
              />
            </div>

            <button className="btnPrimary" disabled={busy}>
              {busy ? "Please wait..." : "Send Message"}
            </button>

            <div className="mini">
              Or email directly: <span className="miniMail">dhanushkarthick610@gmail.com</span>
            </div>
          </form>
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

  .contactWrap{
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

  /* Card */
  .shell{
    position:relative;
    z-index:2;
    width: min(620px, 94vw);
    border-radius: 26px;
    padding: 26px 22px;
    background: linear-gradient(180deg, rgba(255,255,255,.10), rgba(255,255,255,.05));
    border: 1px solid rgba(255,255,255,.14);
    backdrop-filter: blur(18px);
    box-shadow: var(--shadow);
  }

  .head{
    text-align:center;
    margin-bottom: 12px;
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

  /* Flash */
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

  .row2{
    display:grid;
    grid-template-columns: 1fr 1fr;
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

  .field input, .field textarea{
    width:100%;
    padding: 12px 12px;
    border-radius: 14px;
    border: 1px solid rgba(255,255,255,.14);
    outline: none;
    background: rgba(10,14,34,.32);
    color: rgba(255,255,255,.92);
    font-weight: 800;
    resize: vertical;
  }

  .field input::placeholder, .field textarea::placeholder{ color: rgba(255,255,255,.55); }

  .field input:focus, .field textarea:focus{
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

  .mini{
    text-align:center;
    margin-top: 6px;
    color: rgba(255,255,255,.76);
    font-weight: 800;
    font-size: 12px;
  }
  .miniMail{
    color: rgba(255,255,255,.92);
    font-weight: 1000;
    border-bottom: 1px solid rgba(255,255,255,.25);
    padding-bottom: 1px;
  }

  @media (max-width: 640px){
    .row2{ grid-template-columns: 1fr; }
    .shell{ padding: 22px 16px; }
    .title{ font-size: 30px; }
  }
`;