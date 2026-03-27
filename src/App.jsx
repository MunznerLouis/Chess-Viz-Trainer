import { useState } from "react";
import Sandbox from "./Sandbox.jsx";
import Coordinates from "./benchmarks/Coordinates.jsx";
import Threats     from "./benchmarks/Threats.jsx";
import SquareColor from "./benchmarks/SquareColor.jsx";
import PieceCount  from "./benchmarks/PieceCount.jsx";
import Memory      from "./benchmarks/Memory.jsx";
import { svgPieces, BG, CARD, CARD_BORDER, TEXT, TEXT_BRIGHT, ACCENT } from "./shared.jsx";
import { getScore, composite, label, ratingColor, saveScore } from "./scoring.js";

// ── Benchmark registry ──────────────────────────────────────────────────────
const BENCHMARKS = [
  {
    id: "coordinates",
    title: "Coordinates",
    subtitle: "Board Navigation",
    desc: "Name the square each piece sits on — with a flash option.",
    accent: "#81b64c",
    pieces: ["wN", "wB", "wP"],
    component: Coordinates,
  },
  {
    id: "threats",
    title: "Threats",
    subtitle: "Tactical Vision",
    desc: "Find every square a piece threatens across the board.",
    accent: "#e8912d",
    pieces: ["wQ", "bR", "bB"],
    component: Threats,
  },
  {
    id: "squarecolor",
    title: "Square Color",
    subtitle: "Board Intuition",
    desc: "60-second sprint — light or dark? L / D on keyboard.",
    accent: "#5dadec",
    pieces: ["wB", "bB"],
    component: SquareColor,
  },
  {
    id: "piececount",
    title: "Piece Count",
    subtitle: "Board Scanner",
    desc: "Count how many of a specific piece are on the board.",
    accent: "#9b59b6",
    pieces: ["wP", "wP", "bP", "bP"],
    component: PieceCount,
  },
  {
    id: "memory",
    title: "Position Memory",
    subtitle: "Pattern Recall",
    desc: "Memorize a position, then recall what was on each square.",
    accent: "#e84040",
    pieces: ["wK", "bK"],
    component: Memory,
  },
];

// ── Rating bar ──────────────────────────────────────────────────────────────
function RatingBar({ rating }) {
  const MIN = 400, MAX = 2800;
  const pct = Math.max(0, Math.min(100, ((rating - MIN) / (MAX - MIN)) * 100));
  const col = ratingColor(rating);
  return (
    <div style={{ width: "100%", height: 8, background: "rgba(255,255,255,0.08)", borderRadius: 4, overflow: "hidden" }}>
      <div style={{ height: "100%", width: `${pct}%`, background: col, borderRadius: 4, transition: "width 0.6s ease" }} />
    </div>
  );
}

// ── Benchmark card ──────────────────────────────────────────────────────────
function BenchmarkCard({ bm, onPlay }) {
  const score = getScore(bm.id);
  const col   = bm.accent;

  return (
    <div
      onClick={onPlay}
      style={{
        background: CARD,
        border: `1px solid ${CARD_BORDER}`,
        borderRadius: 16,
        padding: 24,
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        transition: "transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = `0 8px 32px rgba(0,0,0,0.4)`;
        e.currentTarget.style.borderColor = col + "66";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.borderColor = CARD_BORDER;
      }}
    >
      {/* Accent glow in corner */}
      <div style={{ position: "absolute", top: -30, right: -30, width: 100, height: 100, borderRadius: "50%", background: col, opacity: 0.07, pointerEvents: "none" }} />

      {/* Piece icons */}
      <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
        {bm.pieces.map((pk, i) => (
          <img key={i} src={svgPieces[pk]} alt={pk} style={{ width: 28, height: 28 }} />
        ))}
      </div>

      {/* Title + subtitle */}
      <div>
        <div style={{ fontSize: 18, fontWeight: 700, color: TEXT_BRIGHT }}>{bm.title}</div>
        <div style={{ fontSize: 12, color: col, fontWeight: 600, marginTop: 2, textTransform: "uppercase", letterSpacing: 1 }}>{bm.subtitle}</div>
      </div>

      {/* Description */}
      <div style={{ fontSize: 13, color: TEXT, lineHeight: 1.55 }}>{bm.desc}</div>

      {/* Score or CTA */}
      <div style={{ marginTop: "auto", paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {score ? (
          <span style={{ fontSize: 13, color: ratingColor(score.rating), fontWeight: 700 }}>
            Best: {score.rating} — {label(score.rating)}
          </span>
        ) : (
          <span style={{ fontSize: 13, color: "#555", fontStyle: "italic" }}>Not yet played</span>
        )}
        <span style={{ fontSize: 13, color: col, fontWeight: 700 }}>Play →</span>
      </div>
    </div>
  );
}

function RatingPanel() {
  const rating = composite();
  if (!rating) {
    return (
      <div style={{ color: TEXT, fontSize: 15, marginBottom: 32, textAlign: "center" }}>
        Play a benchmark to earn your Chess Rating.
      </div>
    );
  }
  const col   = ratingColor(rating);
  const lbl   = label(rating);
  const count = BENCHMARKS.filter((b) => getScore(b.id)).length;

  return (
    <div style={{
      background: CARD, border: `1px solid ${CARD_BORDER}`, borderRadius: 16, padding: "24px 28px",
      width: "min(90vw,640px)", marginBottom: 32, display: "flex", flexDirection: "column", gap: 12,
    }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 2, color: TEXT, fontWeight: 600, marginBottom: 4 }}>Your Chess Rating</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
            <span style={{ fontSize: 52, fontWeight: 900, color: col, lineHeight: 1 }}>{rating}</span>
            <span style={{ fontSize: 18, fontWeight: 700, color: col }}>{lbl}</span>
          </div>
        </div>
        <div style={{ textAlign: "right", color: TEXT, fontSize: 13 }}>
          Based on {count}/{BENCHMARKS.length} benchmark{count !== 1 ? "s" : ""}
        </div>
      </div>
      <RatingBar rating={rating} />
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#555" }}>
        <span>Novice · 400</span>
        <span>Club · 1500</span>
        <span>Master · 2300</span>
        <span>GM · 2700</span>
      </div>

      {/* Mini scores per benchmark */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
        {BENCHMARKS.map((bm) => {
          const s = getScore(bm.id);
          return (
            <div key={bm.id} style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.04)", padding: "4px 10px", borderRadius: 20, border: "1px solid rgba(255,255,255,0.06)" }}>
              {bm.pieces.slice(0, 1).map((pk, i) => (
                <img key={i} src={svgPieces[pk]} alt={pk} style={{ width: 16, height: 16 }} />
              ))}
              <span style={{ fontSize: 12, color: s ? ratingColor(s.rating) : "#444", fontWeight: s ? 700 : 400 }}>
                {s ? s.rating : "—"}
              </span>
              <span style={{ fontSize: 11, color: "#555" }}>{bm.title}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main App ────────────────────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen]     = useState("home");
  const [activeBm, setActiveBm] = useState(null);
  const [, forceUpdate]         = useState(0);

  function goHome() {
    setScreen("home");
    setActiveBm(null);
    forceUpdate((n) => n + 1); // refresh scores
  }

  function playBenchmark(bm) {
    setActiveBm(bm);
    setScreen("benchmark");
  }

  // ── Active benchmark ──
  if (screen === "benchmark" && activeBm) {
    const Comp = activeBm.component;
    return <Comp onBack={goHome} onComplete={() => {}} />;
  }

  // ── Sandbox ──
  if (screen === "sandbox") {
    return <Sandbox onBack={goHome} />;
  }

  // ── Home ──
  return (
    <div style={{
      minHeight: "100vh", background: BG, color: TEXT_BRIGHT,
      fontFamily: "'Segoe UI','Helvetica Neue',Arial,sans-serif",
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "40px 16px 60px",
    }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 32, width: "min(90vw,640px)" }}>
        <h1 style={{
          fontSize: 44, fontWeight: 900, margin: 0, letterSpacing: -1,
          background: "linear-gradient(135deg, #81b64c 0%, #5dadec 100%)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>
          Chess Benchmark
        </h1>
        <p style={{ color: TEXT, fontSize: 16, marginTop: 8 }}>
          How sharp is your chess mind? Test every layer of board mastery.
        </p>
      </div>

      {/* Composite rating */}
      <RatingPanel />

      {/* Benchmark grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: 16,
        width: "min(90vw,900px)",
      }}>
        {BENCHMARKS.map((bm) => (
          <BenchmarkCard key={bm.id} bm={bm} onPlay={() => playBenchmark(bm)} />
        ))}

        {/* Sandbox card */}
        <div
          onClick={() => setScreen("sandbox")}
          style={{
            background: CARD, border: `1px solid ${CARD_BORDER}`, borderRadius: 16, padding: 24,
            cursor: "pointer", display: "flex", flexDirection: "column", gap: 12,
            transition: "transform 0.15s ease, border-color 0.15s ease",
            opacity: 0.85,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.borderColor = "#555";
            e.currentTarget.style.opacity = "1";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.borderColor = CARD_BORDER;
            e.currentTarget.style.opacity = "0.85";
          }}
        >
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            {["wK", "bK"].map((pk) => <img key={pk} src={svgPieces[pk]} alt={pk} style={{ width: 28, height: 28 }} />)}
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: TEXT_BRIGHT }}>Sandbox</div>
            <div style={{ fontSize: 12, color: TEXT, fontWeight: 600, marginTop: 2, textTransform: "uppercase", letterSpacing: 1 }}>Free Play</div>
          </div>
          <div style={{ fontSize: 13, color: TEXT, lineHeight: 1.55 }}>
            Set up any position and play a full game with move validation.
          </div>
          <div style={{ marginTop: "auto", paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "flex-end" }}>
            <span style={{ fontSize: 13, color: TEXT, fontWeight: 700 }}>Open →</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ marginTop: 48, color: "#444", fontSize: 12, textAlign: "center" }}>
        Pieces: Lichess cburnett set (GPL-2.0) · Chess engine: chess.js
      </div>
    </div>
  );
}
