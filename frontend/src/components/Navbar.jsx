import { Link, useLocation } from "react-router-dom";

export default function Navbar({ user }) {
  const { pathname } = useLocation();

  const NavPill = ({ to, children }) => {
    const active = pathname === to;
    return (
      <Link to={to} style={{ ...styles.pill, ...(active ? styles.pillActive : {}) }}>
        {children}
      </Link>
    );
  };

  return (
    <div style={styles.wrap}>
      <div style={styles.inner}>
        {/* ✅ Logo/Heading REMOVE panniten — so 2nd heading no more */}

        <div style={styles.leftSpace} />

        <div style={styles.links}>
          <NavPill to="/">Home</NavPill>
          <NavPill to="/bg-remove">Remove BG</NavPill>
          <NavPill to="/enhance">Enhance</NavPill>
          <NavPill to="/sketch">Sketch</NavPill>
        </div>

        <div style={styles.right}>
          <Link to="/premium" style={styles.premium}>
            ⭐ Premium
          </Link>

          {!user ? (
            <Link to="/login" style={styles.login}>
              Login
            </Link>
          ) : (
            <div style={styles.userDot} title={user?.email || "Logged in"} />
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrap: {
    position: "sticky",
    top: 0,
    zIndex: 999,
    padding: "14px 18px",
    background: "rgba(10, 18, 38, 0.18)",
    backdropFilter: "blur(16px)",
    borderBottom: "1px solid rgba(255,255,255,0.10)",
  },
  inner: {
    maxWidth: 1200,
    margin: "0 auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  leftSpace: { width: 1 }, // spacing only

  links: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    justifyContent: "center",
  },

  pill: {
    padding: "10px 14px",
    borderRadius: 999,
    textDecoration: "none",
    color: "white",
    fontWeight: 800,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.06)",
    transition: "0.18s",
  },
  pillActive: {
    border: "1px solid rgba(0,245,255,0.55)",
    background: "rgba(0,245,255,0.10)",
    boxShadow: "0 0 18px rgba(0,245,255,0.15)",
  },

  right: { display: "flex", alignItems: "center", gap: 10 },

  premium: {
    padding: "10px 14px",
    borderRadius: 999,
    textDecoration: "none",
    fontWeight: 900,
    color: "#0b1020",
    background: "linear-gradient(135deg, rgba(255,166,0,.95), rgba(255,0,200,.85))",
    border: "1px solid rgba(255,255,255,0.16)",
  },
  login: {
    padding: "10px 14px",
    borderRadius: 999,
    textDecoration: "none",
    fontWeight: 900,
    color: "white",
    background: "rgba(255,255,255,0.10)",
    border: "1px solid rgba(255,255,255,0.16)",
  },
  userDot: {
    width: 34,
    height: 34,
    borderRadius: "50%",
    background: "radial-gradient(circle at 30% 30%, #00f5ff, #ff00c8)",
    border: "2px solid rgba(255,255,255,0.18)",
    boxShadow: "0 0 20px rgba(255,0,200,0.18)",
  },
};