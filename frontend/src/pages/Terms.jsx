import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";

export default function Terms() {
  const navigate = useNavigate();
  const stars = useMemo(() => Array.from({ length: 46 }, (_, i) => i), []);

  return (
    <>
      <style>{css}</style>

      <div className="tcPage">
        {/* 🌌 Background */}
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
          <div className="head">
            <div className="badge">📜 Legal</div>
            <h1 className="title neonFlicker">
              <span className="sweepText sweepSlow">Terms & Conditions</span>
            </h1>
            <p className="subtitle">
              Please read these terms carefully before using AI Image Studio.
            </p>
            <div className="meta">Last updated: {new Date().toLocaleDateString()}</div>
          </div>

          <div className="content">
            <Section title="1. Service Overview">
              AI Image Studio provides image tools like background remover, enhancer, and sketch generator.
              Output quality may vary based on image size, lighting, and network speed.
            </Section>

            <Section title="2. Eligibility">
              You must be at least 13 years old to use this service. If you are under 18, you must use the service
              under parent/guardian supervision.
            </Section>

            <Section title="3. Accounts & Login">
              If you log in using Google or Email, you are responsible for keeping your account secure.
              Any activity on your account is considered your responsibility.
            </Section>

            <Section title="4. Free Usage & Premium">
              We may offer limited free usage. Premium plan unlocks higher monthly limits and features.
              Limits can be changed anytime to prevent abuse and ensure fair usage.
            </Section>

            <Section title="5. Prohibited Use">
              You agree NOT to:
              <ul>
                <li>Upload illegal, harmful, abusive, or copyrighted content without permission.</li>
                <li>Attempt to hack, overload, or scrape the service.</li>
                <li>Use the service to violate anyone’s privacy or rights.</li>
              </ul>
            </Section>

            <Section title="6. Content & Ownership">
              You own the images you upload. You are responsible for having the right to use them.
              Generated output is provided “as-is”. We do not guarantee commercial suitability.
            </Section>

            <Section title="7. Privacy">
              We may store usage counts (for limits) and basic identifiers (like device id / user id) for preventing abuse.
              We do not sell your personal data. Please review our Privacy Policy if available.
            </Section>

            <Section title="8. Refund / Cancellation">
              Since this is a digital service, refunds are handled based on our Refund Policy page.
              (Example: credits used → non-refundable; duplicate payments → refundable.)
            </Section>

            <Section title="9. Availability & Changes">
              We can update features, pricing, limits, or discontinue the service anytime.
              We try our best to keep the service stable, but uptime is not guaranteed.
            </Section>

            <Section title="10. Limitation of Liability">
              We are not liable for any indirect or consequential damages.
              Use the service at your own risk.
            </Section>

            <Section title="11. Contact">
              For questions or support:
              <div className="contactBox">
                <div><b>Email:</b> dhanushkarthick610gmail.com</div>
                <div><b>Website:</b> AI Image Studio</div>
              </div>
              (Replace this email with your real support mail)
            </Section>
          </div>

          <div className="footer">
            <button className="btnGhost" onClick={() => navigate(-1)}>
              ⟵ Back
            </button>
            <button className="btnPrimary" onClick={() => navigate("/")}>
              Go Home
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function Section({ title, children }) {
  return (
    <div className="sec">
      <div className="secTitle">{title}</div>
      <div className="secBody">{children}</div>
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
  }

  *{ box-sizing:border-box; }
  body{ margin:0; }

  .tcPage{
    min-height:100vh;
    display:flex;
    align-items:center;
    justify-content:center;
    padding: 26px 14px;
    position:relative;
    overflow:hidden;
    color: var(--text);
    font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial;
    z-index:5;
  }

  /* Background */
  .bgFx{ position:fixed; inset:0; z-index:0; pointer-events:none; overflow:visible; }
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
  }

  /* Card */
  .card{
    position:relative;
    z-index: 10;
    width: min(860px, 96vw);
    border-radius: 26px;
    padding: 22px 20px;
    background: linear-gradient(180deg, rgba(255,255,255,.10), rgba(255,255,255,.05));
    border: 1px solid rgba(255,255,255,.14);
    backdrop-filter: blur(18px);
    box-shadow: var(--shadow);
    overflow:hidden;
  }

  .head{ text-align:center; padding: 6px 6px 10px; }
  .badge{
    display:inline-block;
    padding: 8px 12px;
    border-radius: 999px;
    border: 1px solid rgba(255,255,255,.14);
    background: rgba(255,255,255,.07);
    font-weight: 900;
    font-size: 12px;
    margin-bottom: 10px;
  }

  .title{
    margin: 0;
    font-size: 34px;
    font-weight: 1000;
    letter-spacing: -0.6px;
    line-height: 1.06;
    text-shadow:
      0 0 10px rgba(34,211,238,.18),
      0 0 24px rgba(124,92,255,.14);
  }
  .subtitle{
    margin: 10px 0 0;
    font-size: 13.5px;
    color: rgba(255,255,255,.76);
  }
  .meta{
    margin-top: 10px;
    font-size: 12px;
    opacity: .75;
  }

  /* Neon sweep */
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
    filter: saturate(1.15);
    animation: sweep 4.6s linear infinite;
  }
  .sweepSlow{ animation-duration: 6.2s; }
  @keyframes sweep{
    0%{ background-position: 0% 50%; }
    100%{ background-position: 200% 50%; }
  }

  /* Content */
  .content{
    margin-top: 10px;
    display:flex;
    flex-direction:column;
    gap: 12px;
  }

  .sec{
    padding: 14px 14px;
    border-radius: 18px;
    border: 1px solid rgba(255,255,255,.12);
    background: rgba(10,14,34,.30);
    box-shadow: var(--shadow2);
  }
  .secTitle{
    font-weight: 1000;
    margin-bottom: 8px;
    letter-spacing: .2px;
  }
  .secBody{
    font-size: 13.5px;
    line-height: 1.65;
    color: rgba(255,255,255,.84);
  }
  .secBody ul{
    margin: 10px 0 0 18px;
    padding: 0;
  }
  .secBody li{
    margin: 6px 0;
  }

  .contactBox{
    margin-top: 10px;
    padding: 10px 12px;
    border-radius: 14px;
    border: 1px solid rgba(255,255,255,.12);
    background: rgba(0,0,0,.18);
  }

  .footer{
    margin-top: 14px;
    display:flex;
    gap: 10px;
    justify-content:flex-end;
    flex-wrap:wrap;
  }

  .btnGhost{
    padding: 10px 14px;
    border-radius: 14px;
    border: 1px solid rgba(255,255,255,.14);
    background: rgba(255,255,255,.08);
    color: rgba(255,255,255,.92);
    font-weight: 900;
    cursor:pointer;
  }

  .btnPrimary{
    padding: 10px 14px;
    border: none;
    border-radius: 14px;
    font-weight: 1000;
    cursor: pointer;
    color: #0b1020;
    background: linear-gradient(135deg, rgba(34,211,238,.95), rgba(124,92,255,.88));
    box-shadow: 0 18px 40px rgba(0,0,0,.20);
  }

  @media (max-width: 520px){
    .card{ padding: 20px 14px; border-radius: 22px; }
    .title{ font-size: 28px; }
  }
`;