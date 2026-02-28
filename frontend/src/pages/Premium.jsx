// src/pages/Premium.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";

// ✅ localStorage keys (refresh persist)
const STEP_KEY = "premium_step"; // "get" | "pay" | "txn" | "done"
const PREMIUM_KEY = "premium";   // "1" | "0"

// ✅ UPI config (change these)
const UPI_ID = "sekhardhanush6@oksbi";
const PAYEE_NAME = "AI Magic Premium";
const AMOUNT = "1"; // offer price
const NOTE = "Premium Activation";

function isMobile() {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

// Create UPI deep link
function buildUpiUrl() {
  const params = new URLSearchParams({
    pa: UPI_ID,
    pn: PAYEE_NAME,
    am: AMOUNT,
    cu: "INR",
    tn: NOTE,
  });
  return `upi://pay?${params.toString()}`;
}

export default function Premium() {
  const navigate = useNavigate();

  // ✅ step restore on refresh
  const [step, setStep] = useState(() => localStorage.getItem(STEP_KEY) || "get");
  const [txnId, setTxnId] = useState("");
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");

  const upiUrl = useMemo(() => buildUpiUrl(), []);

  // ✅ persist step always
  useEffect(() => {
    localStorage.setItem(STEP_KEY, step);
  }, [step]);

  // ✅ if already premium, show done
  useEffect(() => {
    const isPrem = localStorage.getItem(PREMIUM_KEY) === "1";
    if (isPrem) setStep("done");
  }, []);

  // ✅ small toast auto hide
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  // ✅ Back one-by-one (no direct home)
  const handleBack = () => {
    if (step === "txn") return setStep("pay");
    if (step === "pay") return setStep("get");
    if (step === "done") return setStep("get"); // optional
    // step === "get"
    navigate(-1); // previous page from where user came
  };

  const goPayNow = () => {
    // laptop: stay here & show QR
    // mobile: open UPI apps using deep link
    if (isMobile()) {
      window.location.href = upiUrl; // opens gpay/phonepe/paytm chooser if available
    }
    // After user pays, they will come back manually -> show "payment success" button
    setToast("Pay complete? Click 'Payment Success' to continue");
  };

  const markPaymentSuccess = async () => {
    setBusy(true);
    setTimeout(() => {
      setBusy(false);
      setStep("txn");
      setToast("Enter UTR / Transaction ID");
    }, 700);
  };

  const activatePremium = async () => {
    if (!txnId.trim() || txnId.trim().length < 6) {
      setToast("Valid Transaction ID / UTR enter pannunga");
      return;
    }

    setBusy(true);

    // ✅ here you can call backend verify API (later).
    // For now: activate locally
    setTimeout(() => {
      localStorage.setItem(PREMIUM_KEY, "1");
      setStep("done");
      setBusy(false);
      setToast("Premium Activated ✅");

      // auto go home
      setTimeout(() => {
        navigate("/");
      }, 1400);
    }, 900);
  };

  // ---------- UI helpers ----------
  const Price = () => (
    <div style={styles.priceRow}>
      <span style={styles.oldPrice}>₹2999</span>
      <span style={styles.newPrice}>₹{AMOUNT}</span>
      <span style={styles.offerTag}>Today Offer</span>
    </div>
  );

  const TopBar = () => (
    <div style={styles.topBar}>
      <button onClick={handleBack} style={styles.backBtn} aria-label="Back">
        ←
      </button>

      <div style={styles.premiumBadge}>
        <span style={{ marginRight: 6 }}>⭐</span> Premium
      </div>
    </div>
  );

  const ButtonRow = ({ children }) => (
    <div style={styles.row}>{children}</div>
  );

  const FullWidthBtn = ({ onClick, children, variant = "primary", disabled }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...styles.fullBtn,
        ...(variant === "ghost" ? styles.ghostBtn : styles.primaryBtn),
        ...(disabled ? styles.disabledBtn : {}),
      }}
    >
      {children}
    </button>
  );

  // ---------- Renders ----------
  const renderGet = () => (
    <>
      <h1 style={styles.h1}>Get Premium</h1>
      <p style={styles.sub}>
        Unlimited uploads • Faster tools • No limits. Limited-time deal.
      </p>

      <Price />

      <div style={styles.featureBox}>
        <div style={styles.featureItem}>✅ Unlimited Uploads</div>
        <div style={styles.featureItem}>✅ Faster Processing</div>
        <div style={styles.featureItem}>✅ Premium Cartoon / Enhance</div>
      </div>

      <ButtonRow>
        <FullWidthBtn onClick={() => setStep("pay")}>
          Pay Now & Unlock Premium
        </FullWidthBtn>
      </ButtonRow>
    </>
  );

  const renderPay = () => (
    <>
      <h1 style={styles.h1}>Complete Payment</h1>
      <p style={styles.sub}>
        {isMobile()
          ? "Mobile detected: Pay Now click pannina UPI apps open aagum."
          : "Laptop detected: QR scan pannitu pay pannunga."}
      </p>

      <Price />

      <div style={styles.payBox}>
        {!isMobile() && (
          <div style={styles.qrWrap}>
            <QRCodeCanvas value={upiUrl} size={180} />
            <div style={styles.qrText}>
              Scan & Pay to <b>{UPI_ID}</b>
              <div style={{ marginTop: 6, opacity: 0.9 }}>Amount: ₹{AMOUNT}</div>
            </div>
          </div>
        )}

        <div style={styles.payActions}>
          <FullWidthBtn onClick={goPayNow}>Pay Now</FullWidthBtn>

          <FullWidthBtn
            onClick={markPaymentSuccess}
            variant="ghost"
            disabled={busy}
          >
            {busy ? "Checking..." : "Payment Success"}
          </FullWidthBtn>

          <div style={styles.hint}>
            If your <b>Payment completed</b> click payment success then goto next step.
          
          </div>
        </div>
      </div>
    </>
  );

  const renderTxn = () => (
    <>
      <h1 style={styles.h1}>Enter Transaction ID</h1>
      <p style={styles.sub}>
        UPI app la irukkura <b>UTR / Transaction ID</b> paste pannunga.
      </p>

      <div style={styles.inputCard}>
        <input
          value={txnId}
          onChange={(e) => setTxnId(e.target.value)}
          placeholder="Enter UPI Transaction ID / UTR"
          style={styles.input}
        />

        {/* ✅ same length as input */}
        <button
          onClick={activatePremium}
          disabled={busy}
          style={{
            ...styles.fullBtn,
            ...styles.primaryBtn,
            ...(busy ? styles.disabledBtn : {}),
          }}
        >
          {busy ? (
            <span style={{ display: "inline-flex", gap: 10, alignItems: "center" }}>
              <span style={styles.spinner} /> Activating...
            </span>
          ) : (
            "Activate Premium"
          )}
        </button>
      </div>
    </>
  );

  const renderDone = () => (
    <>
      <div style={styles.doneWrap}>
        <div style={styles.tickCircle}>✓</div>
        <h1 style={{ ...styles.h1, marginTop: 14 }}>Premium Activated</h1>
        <p style={styles.sub}>Success ✅ Home page ku pogudhu...</p>
      </div>
    </>
  );

  return (
    <div style={styles.page}>
      <TopBar />

      <div style={styles.card}>
        {step === "get" && renderGet()}
        {step === "pay" && renderPay()}
        {step === "txn" && renderTxn()}
        {step === "done" && renderDone()}
      </div>

      {toast ? <div style={styles.toast}>{toast}</div> : null}
    </div>
  );
}

// ---------------- STYLES (inline) ----------------
const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "28px 14px",
    background:
      "radial-gradient(1200px 800px at 20% 20%, rgba(0,255,170,.18), transparent 55%), radial-gradient(900px 700px at 80% 30%, rgba(0,140,255,.22), transparent 55%), linear-gradient(180deg, #07121a, #071a18)",
    color: "white",
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial",
    position: "relative",
  },
  topBar: {
    position: "absolute",
    top: 16,
    left: 16,
    right: 16,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    pointerEvents: "auto",
  },
  backBtn: {
    width: 46,
    height: 46,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,.18)",
    background: "rgba(0,0,0,.25)",
    color: "white",
    fontSize: 22,
    cursor: "pointer",
    backdropFilter: "blur(10px)",
  },
  premiumBadge: {
    padding: "10px 14px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,.16)",
    background: "rgba(0,0,0,.25)",
    backdropFilter: "blur(10px)",
    fontWeight: 700,
  },
  card: {
    width: "min(960px, 92vw)",
    borderRadius: 26,
    border: "1px solid rgba(255,255,255,.14)",
    background: "rgba(0,0,0,.28)",
    boxShadow: "0 20px 80px rgba(0,0,0,.55)",
    padding: "28px",
    backdropFilter: "blur(12px)",
  },
  h1: { fontSize: 42, margin: 0, letterSpacing: 0.2 },
  sub: { opacity: 0.85, marginTop: 10, marginBottom: 18, lineHeight: 1.4 },
  priceRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 18,
    flexWrap: "wrap",
  },
  oldPrice: { textDecoration: "line-through", opacity: 0.65, fontSize: 18 },
  newPrice: { fontSize: 34, fontWeight: 900 },
  offerTag: {
    marginLeft: "auto",
    padding: "8px 12px",
    borderRadius: 999,
    background: "rgba(0,255,170,.14)",
    border: "1px solid rgba(0,255,170,.28)",
    color: "#7CFFCD",
    fontWeight: 800,
  },
  featureBox: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,.12)",
    background: "rgba(255,255,255,.03)",
    padding: 14,
    marginBottom: 18,
  },
  featureItem: { opacity: 0.92, fontWeight: 600 },
  row: { display: "flex", gap: 12, marginTop: 10, flexWrap: "wrap" },

  fullBtn: {
    width: "100%",
    height: 56,
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,.14)",
    fontWeight: 900,
    cursor: "pointer",
    fontSize: 16,
  },
  primaryBtn: {
    background: "linear-gradient(90deg, rgba(0,255,170,.85), rgba(0,140,255,.85))",
    color: "#07121a",
  },
  ghostBtn: {
    background: "rgba(255,255,255,.06)",
    color: "white",
  },
  disabledBtn: { opacity: 0.65, cursor: "not-allowed" },

  payBox: {
    marginTop: 10,
    display: "grid",
    gridTemplateColumns: "1.2fr 1fr",
    gap: 16,
    alignItems: "stretch",
  },
  qrWrap: {
    borderRadius: 20,
    border: "1px solid rgba(255,255,255,.12)",
    background: "rgba(255,255,255,.03)",
    padding: 18,
    display: "flex",
    gap: 16,
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  qrText: { maxWidth: 320, opacity: 0.92, lineHeight: 1.35 },
  payActions: {
    borderRadius: 20,
    border: "1px solid rgba(255,255,255,.12)",
    background: "rgba(255,255,255,.03)",
    padding: 18,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  hint: { opacity: 0.78, fontSize: 13, marginTop: 4 },

  inputCard: {
    marginTop: 16,
    borderRadius: 20,
    border: "1px solid rgba(255,255,255,.12)",
    background: "rgba(255,255,255,.03)",
    padding: 18,
    display: "grid",
    gap: 12,
  },
  input: {
    width: "100%",
    height: 56,
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,.14)",
    background: "rgba(0,0,0,.25)",
    color: "white",
    padding: "0 16px",
    fontSize: 16,
    outline: "none",
  },

  doneWrap: { textAlign: "center", padding: "26px 0" },
  tickCircle: {
    width: 90,
    height: 90,
    borderRadius: 999,
    margin: "0 auto",
    display: "grid",
    placeItems: "center",
    fontSize: 44,
    fontWeight: 900,
    background: "rgba(0,255,170,.18)",
    border: "1px solid rgba(0,255,170,.35)",
    color: "#7CFFCD",
    boxShadow: "0 18px 60px rgba(0,255,170,.18)",
  },

  toast: {
    position: "fixed",
    bottom: 22,
    left: "50%",
    transform: "translateX(-50%)",
    padding: "12px 16px",
    borderRadius: 14,
    background: "rgba(0,0,0,.55)",
    border: "1px solid rgba(255,255,255,.14)",
    backdropFilter: "blur(10px)",
    color: "white",
    fontWeight: 700,
    maxWidth: "92vw",
    textAlign: "center",
  },
  spinner: {
    width: 18,
    height: 18,
    borderRadius: 999,
    border: "2px solid rgba(0,0,0,.2)",
    borderTop: "2px solid rgba(0,0,0,.75)",
    display: "inline-block",
    animation: "spin 0.8s linear infinite",
  },
};

// ✅ Add this in App.css (ONLY ONCE):
// @keyframes spin { to { transform: rotate(360deg); } }