import { useState, useEffect, useRef, useMemo } from "react";
import Sandbox from "./Sandbox.jsx";

const C = "abcdefgh";
const R = "12345678";
const PN = { K: "King", Q: "Queen", R: "Rook", B: "Bishop", N: "Knight", P: "Pawn" };

const p2c = (c, r) => C[c] + R[r];
const c2p = (s) => ({ col: C.indexOf(s[0]), row: +s[1] - 1 });
const ri = (n) => Math.floor(Math.random() * n);
const shuffle = (a) => {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = ri(i + 1);
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
};
const vSq = (s) => /^[a-h][1-8]$/.test(s);

// Lichess cburnett piece SVGs (GPL-2.0, by Colin M.L. Burnett)
const pieceSVGData = {
  wK: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><g fill="none" fill-rule="evenodd" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path stroke-linejoin="miter" d="M22.5 11.63V6M20 8h5"/><path fill="#fff" stroke-linecap="butt" stroke-linejoin="miter" d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5"/><path fill="#fff" d="M11.5 37c5.5 3.5 15.5 3.5 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V27v-3.5c-3.5-7.5-13-10.5-16-4-3 6 5 10 5 10z"/><path d="M11.5 30c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0"/></g></svg>`,
  bK: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><g fill="none" fill-rule="evenodd" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path stroke-linejoin="miter" d="M22.5 11.6V6"/><path fill="#000" stroke-linecap="butt" stroke-linejoin="miter" d="M22.5 25s4.5-7.5 3-10.5c0 0-1-2.5-3-2.5s-3 2.5-3 2.5c-1.5 3 3 10.5 3 10.5"/><path fill="#000" d="M11.5 37a22.3 22.3 0 0 0 21 0v-7s9-4.5 6-10.5c-4-6.5-13.5-3.5-16 4V27v-3.5c-3.5-7.5-13-10.5-16-4-3 6 5 10 5 10z"/><path stroke-linejoin="miter" d="M20 8h5"/><path stroke="#ececec" d="M32 29.5s8.5-4 6-9.7C34.1 14 25 18 22.5 24.6v2.1-2.1C20 18 9.9 14 7 19.9c-2.5 5.6 4.8 9 4.8 9"/><path stroke="#ececec" d="M11.5 30c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0m-21 3.5c5.5-3 15.5-3 21 0"/></g></svg>`,
  wQ: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><g fill="#fff" fill-rule="evenodd" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path d="M8 12a2 2 0 1 1-4 0 2 2 0 1 1 4 0m16.5-4.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0M41 12a2 2 0 1 1-4 0 2 2 0 1 1 4 0M16 8.5a2 2 0 1 1-4 0 2 2 0 1 1 4 0M33 9a2 2 0 1 1-4 0 2 2 0 1 1 4 0"/><path stroke-linecap="butt" d="M9 26c8.5-1.5 21-1.5 27 0l2-12-7 11V11l-5.5 13.5-3-15-3 15-5.5-14V25L7 14z"/><path stroke-linecap="butt" d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 1.5-1 0-2.5 0 0 .5-1.5-1-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z"/><path fill="none" d="M11.5 30c3.5-1 18.5-1 22 0M12 33.5c6-1 15-1 21 0"/></g></svg>`,
  bQ: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><g fill-rule="evenodd" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><g stroke="none"><circle cx="6" cy="12" r="2.75"/><circle cx="14" cy="9" r="2.75"/><circle cx="22.5" cy="8" r="2.75"/><circle cx="31" cy="9" r="2.75"/><circle cx="39" cy="12" r="2.75"/></g><path stroke-linecap="butt" d="M9 26c8.5-1.5 21-1.5 27 0l2.5-12.5L31 25l-.3-14.1-5.2 13.6-3-14.5-3 14.5-5.2-13.6L14 25 6.5 13.5z"/><path stroke-linecap="butt" d="M9 26c0 2 1.5 2 2.5 4 1 1.5 1 1 .5 3.5-1.5 1-1.5 2.5-1.5 2.5-1.5 1.5.5 2.5.5 2.5 6.5 1 16.5 1 23 0 0 0 1.5-1 0-2.5 0 0 .5-1.5-1-2.5-.5-2.5-.5-2 .5-3.5 1-2 2.5-2 2.5-4-8.5-1.5-18.5-1.5-27 0z"/><path fill="none" stroke-linecap="butt" d="M11 38.5a35 35 1 0 0 23 0"/><path fill="none" stroke="#ececec" d="M11 29a35 35 1 0 1 23 0m-21.5 2.5h20m-21 3a35 35 1 0 0 22 0m-23 3a35 35 1 0 0 24 0"/></g></svg>`,
  wR: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><g fill="#fff" fill-rule="evenodd" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path stroke-linecap="butt" d="M9 39h27v-3H9zm3-3v-4h21v4zm-1-22V9h4v2h5V9h5v2h5V9h4v5"/><path d="m34 14-3 3H14l-3-3"/><path stroke-linecap="butt" stroke-linejoin="miter" d="M31 17v12.5H14V17"/><path d="m31 29.5 1.5 2.5h-20l1.5-2.5"/><path fill="none" stroke-linejoin="miter" d="M11 14h23"/></g></svg>`,
  bR: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><g fill-rule="evenodd" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path stroke-linecap="butt" d="M9 39h27v-3H9zm3.5-7 1.5-2.5h17l1.5 2.5zm-.5 4v-4h21v4z"/><path stroke-linecap="butt" stroke-linejoin="miter" d="M14 29.5v-13h17v13z"/><path stroke-linecap="butt" d="M14 16.5 11 14h23l-3 2.5zM11 14V9h4v2h5V9h5v2h5V9h4v5z"/><path fill="none" stroke="#ececec" stroke-linejoin="miter" stroke-width="1" d="M12 35.5h21m-20-4h19m-18-2h17m-17-13h17M11 14h23"/></g></svg>`,
  wB: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><g fill="none" fill-rule="evenodd" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><g fill="#fff" stroke-linecap="butt"><path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.46-13.5-1-3.39 1.46-10.11.03-13.5 1-1.35.49-2.32.47-3-.5 1.35-1.94 3-2 3-2z"/><path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z"/><path d="M25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0z"/></g><path stroke-linejoin="miter" d="M17.5 26h10M15 30h15m-7.5-14.5v5M20 18h5"/></g></svg>`,
  bB: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><g fill="none" fill-rule="evenodd" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><g fill="#000" stroke-linecap="butt"><path d="M9 36c3.4-1 10.1.4 13.5-2 3.4 2.4 10.1 1 13.5 2 0 0 1.6.5 3 2-.7 1-1.6 1-3 .5-3.4-1-10.1.5-13.5-1-3.4 1.5-10.1 0-13.5 1-1.4.5-2.3.5-3-.5 1.4-2 3-2 3-2z"/><path d="M15 32c2.5 2.5 12.5 2.5 15 0 .5-1.5 0-2 0-2 0-2.5-2.5-4-2.5-4 5.5-1.5 6-11.5-5-15.5-11 4-10.5 14-5 15.5 0 0-2.5 1.5-2.5 4 0 0-.5.5 0 2z"/><path d="M25 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 1 1 5 0z"/></g><path stroke="#ececec" stroke-linejoin="miter" d="M17.5 26h10M15 30h15m-7.5-14.5v5M20 18h5"/></g></svg>`,
  wN: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><g fill="none" fill-rule="evenodd" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path fill="#fff" d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21"/><path fill="#fff" d="M24 18c.38 2.91-5.55 7.37-8 9-3 2-2.82 4.34-5 4-1.042-.94 1.41-3.04 0-3-1 0 .19 1.23-1 2-1 0-4.003 1-4-4 0-2 6-12 6-12s1.89-1.9 2-3.5c-.73-.994-.5-2-.5-3 1-1 3 2.5 3 2.5h2s.78-1.992 2.5-3c1 0 1 3 1 3"/><path fill="#000" d="M9.5 25.5a.5.5 0 1 1-1 0 .5.5 0 1 1 1 0m5.433-9.75a.5 1.5 30 1 1-.866-.5.5 1.5 30 1 1 .866.5"/></g></svg>`,
  bN: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><g fill="none" fill-rule="evenodd" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path fill="#000" d="M22 10c10.5 1 16.5 8 16 29H15c0-9 10-6.5 8-21"/><path fill="#000" d="M24 18c.38 2.91-5.55 7.37-8 9-3 2-2.82 4.34-5 4-1.04-.94 1.41-3.04 0-3-1 0 .19 1.23-1 2-1 0-4 1-4-4 0-2 6-12 6-12s1.89-1.9 2-3.5c-.73-1-.5-2-.5-3 1-1 3 2.5 3 2.5h2s.78-2 2.5-3c1 0 1 3 1 3"/><path fill="#ececec" stroke="#ececec" d="M9.5 25.5a.5.5 0 1 1-1 0 .5.5 0 1 1 1 0m5.43-9.75a.5 1.5 30 1 1-.86-.5.5 1.5 30 1 1 .86.5"/><path fill="#ececec" stroke="none" d="m24.55 10.4-.45 1.45.5.15c3.15 1 5.65 2.49 7.9 6.75S35.75 29.06 35.25 39l-.05.5h2.25l.05-.5c.5-10.06-.88-16.85-3.25-21.34s-5.79-6.64-9.19-7.16z"/></g></svg>`,
  wP: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><path fill="#fff" stroke="#000" stroke-linecap="round" stroke-width="1.5" d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z"/></svg>`,
  bP: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45"><path stroke="#000" stroke-linecap="round" stroke-width="1.5" d="M22.5 9a4 4 0 0 0-3.22 6.38 6.48 6.48 0 0 0-.87 10.65c-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47a6.46 6.46 0 0 0-.87-10.65A4.01 4.01 0 0 0 22.5 9z"/></svg>`,
};

const makePieceURI = (color, type) => {
  const svg = pieceSVGData[color + type];
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

const svgPieces = {};
for (const c of ["w", "b"]) {
  for (const t of ["K", "Q", "R", "B", "N", "P"]) {
    svgPieces[c + t] = makePieceURI(c, t);
  }
}

// Board colors (chess.com green theme)
const LS = "#eeeed2";
const DS = "#769656";
const HP = "#f6f669";
const HC = "#96bc4b";
const HW = "#e84040";
const HT = "#ff9b3b";
const HE = "#5dadec";

// UI colors
const BG = "#262522";
const CARD = "#302e2b";
const CARD_BORDER = "#3d3a37";
const TEXT = "#c0bfbd";
const TEXT_BRIGHT = "#f0f0f0";
const ACCENT = "#81b64c";
const DANGER = "#e84040";
const INPUT_BG = "#1a1816";

const inBoard = (c, r) => c >= 0 && c < 8 && r >= 0 && r < 8;

const getThreats = (piece, all) => {
  const occ = new Map(all.map((p) => [p.square, p]));
  const { col, row } = c2p(piece.square);
  const out = new Set();
  const add = (c, r) => {
    if (!inBoard(c, r)) return false;
    const sq = p2c(c, r);
    out.add(sq);
    return occ.has(sq);
  };

  if (piece.type === "N") {
    const deltas = [
      [-2, -1], [-2, 1], [-1, -2], [-1, 2],
      [1, -2], [1, 2], [2, -1], [2, 1]
    ];
    deltas.forEach(([dc, dr]) => {
      const nc = col + dc, nr = row + dr;
      if (inBoard(nc, nr)) out.add(p2c(nc, nr));
    });
    return [...out].sort();
  }

  if (piece.type === "K") {
    for (let dc = -1; dc <= 1; dc++) {
      for (let dr = -1; dr <= 1; dr++) {
        if (!dc && !dr) continue;
        if (inBoard(col + dc, row + dr)) out.add(p2c(col + dc, row + dr));
      }
    }
    return [...out].sort();
  }

  if (piece.type === "P") {
    const d = piece.color === "w" ? 1 : -1;
    [-1, 1].forEach((dc) => {
      const nc = col + dc, nr = row + d;
      if (inBoard(nc, nr)) out.add(p2c(nc, nr));
    });
    return [...out].sort();
  }

  const dirs = [];
  if (piece.type === "R" || piece.type === "Q") {
    dirs.push([0, 1], [0, -1], [1, 0], [-1, 0]);
  }
  if (piece.type === "B" || piece.type === "Q") {
    dirs.push([1, 1], [1, -1], [-1, 1], [-1, -1]);
  }

  dirs.forEach(([dc, dr]) => {
    let nc = col + dc, nr = row + dr;
    let last = null;
    while (inBoard(nc, nr)) {
      const sq = p2c(nc, nr);
      last = sq;
      if (occ.has(sq)) break;
      nc += dc;
      nr += dr;
    }
    if (last) out.add(last);
  });

  return [...out].sort();
};

const genPos = (pc, pn, on) => {
  const opp = pc === "w" ? "b" : "w";
  const allSquares = [];
  for (const c of C) for (const r of R) allSquares.push(c + r);

  const available = shuffle(allSquares);
  const types = ["K", "Q", "R", "B", "N", "P"];
  const pieces = [];

  for (let i = 0; i < pn; i++) {
    pieces.push({
      color: pc,
      type: types[i % types.length],
      square: available.pop(),
      isPlayer: true
    });
  }

  for (let i = 0; i < on; i++) {
    pieces.push({
      color: opp,
      type: types[i % types.length],
      square: available.pop(),
      isPlayer: false
    });
  }

  return shuffle(pieces);
};

const fmt = (ms) => `${Math.floor(ms / 1000)}.${Math.floor((ms % 1000) / 100)}s`;

function Board({ pieces, highlights, flipped }) {
  const pm = useMemo(() => {
    const m = new Map();
    pieces.forEach((p) => m.set(p.square, p));
    return m;
  }, [pieces]);

  return (
    <div style={{ position: "relative", width: "min(88vw,560px)", aspectRatio: "1", borderRadius: 6, overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(8,1fr)",
          gridTemplateRows: "repeat(8,1fr)",
          width: "100%",
          height: "100%",
        }}
      >
        {Array.from({ length: 64 }, (_, i) => {
          const col = i % 8;
          const row = Math.floor(i / 8);
          const coord = p2c(col, row);
          const isDark = (col + row) % 2 === 1;
          const hl = highlights?.[coord];
          let bg = isDark ? DS : LS;
          if (hl === "player") bg = isDark ? "#baca2b" : HP;
          if (hl === "correct") bg = isDark ? "#6aaa3a" : HC;
          if (hl === "wrong") bg = isDark ? "#c73030" : HW;

          const dR = flipped ? row : 7 - row;
          const dC = flipped ? 7 - col : col;
          const piece = pm.get(coord);

          return (
            <div
              key={coord}
              style={{
                gridColumn: dC + 1,
                gridRow: dR + 1,
                background: bg,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                transition: "background 0.15s ease",
              }}
            >
              {piece && (
                <img
                  src={svgPieces[piece.color + piece.type]}
                  alt={`${piece.color}${piece.type}`}
                  style={{ width: "85%", height: "85%", filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.3))", pointerEvents: "none" }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Timer({ running, t0, t1 }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setNow(Date.now()), 100);
    return () => clearInterval(id);
  }, [running]);

  const elapsed = running ? now - t0 : (t1 || now) - (t0 || now);
  return (
    <span style={{ fontFamily: "'JetBrains Mono','Courier New',monospace", fontSize: 20, fontWeight: 700, color: TEXT_BRIGHT, letterSpacing: 1 }}>
      {fmt(elapsed)}
    </span>
  );
}

function PI({ type, color, size = 26 }) {
  return (
    <img
      src={svgPieces[color + type]}
      alt={`${color}${type}`}
      style={{ width: size, height: size }}
    />
  );
}

function Tag({ sq, onRemove, status }) {
  let bg = "rgba(255,255,255,0.06)";
  let bd = "#555";
  if (status === "correct") { bg = "rgba(129,182,76,0.15)"; bd = ACCENT; }
  if (status === "wrong") { bg = "rgba(232,64,64,0.15)"; bd = DANGER; }
  if (status === "missing") { bg = "rgba(93,173,236,0.15)"; bd = HE; }
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "4px 10px", borderRadius: 6,
      border: `1px solid ${bd}`, background: bg,
      color: TEXT_BRIGHT, fontSize: 13, fontWeight: 600, fontFamily: "'JetBrains Mono','Courier New',monospace",
    }}>
      {sq}
      {onRemove && (
        <span onClick={onRemove} style={{ cursor: "pointer", marginLeft: 2, opacity: 0.4, fontSize: 15, lineHeight: 1 }}>
          x
        </span>
      )}
    </span>
  );
}

function Btn({ children, onClick, variant = "primary", disabled, style: extraStyle }) {
  const styles = {
    primary: { background: ACCENT, color: "#1a1a1a", fontWeight: 700 },
    secondary: { background: "rgba(255,255,255,0.08)", color: TEXT, border: "1px solid rgba(255,255,255,0.12)" },
    orange: { background: "#e8912d", color: "#1a1a1a", fontWeight: 700 },
    ghost: { background: "none", border: "1px solid rgba(255,255,255,0.15)", color: TEXT },
    danger: { background: DANGER, color: "#fff", fontWeight: 700 },
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "10px 18px", borderRadius: 8, border: "none", cursor: disabled ? "default" : "pointer",
        fontSize: 14, transition: "all 0.15s ease", opacity: disabled ? 0.4 : 1,
        ...styles[variant], ...extraStyle,
      }}
    >
      {children}
    </button>
  );
}

function Card({ children, style: extraStyle }) {
  return (
    <div style={{
      background: CARD, borderRadius: 12, padding: 20,
      border: `1px solid ${CARD_BORDER}`,
      boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
      ...extraStyle,
    }}>
      {children}
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState("menu");
  const [pc, setPc] = useState("w");
  const [pieces, setPieces] = useState([]);
  const [flipped, setFl] = useState(false);
  const [curIdx, setCI] = useState(0);
  const [ans, setAns] = useState([]);
  const [inp, setInp] = useState("");
  const [t0, setT0] = useState(null);
  const [t1, setT1] = useState(null);

  const [l2i, setL2i] = useState(0);
  const [l2inp, setL2inp] = useState("");
  const [l2t, setL2t] = useState([]);
  const [l2a, setL2a] = useState([]);
  const [l2e, setL2e] = useState([]);
  const [revi, setRevi] = useState(null);

  const ref = useRef(null);
  const l2ref = useRef(null);

  const pp = pieces.filter((p) => p.isPlayer);

  const s1 = () => {
    const p = genPos(pc, 5, 10);
    setPieces(p);
    setCI(0);
    setAns([]);
    setInp("");
    setT0(Date.now());
    setT1(null);
    setScreen("l1");
  };

  const s2 = () => {
    const p = genPos(pc, 5, 10);
    const playerPositions = p.filter((x) => x.isPlayer);
    setPieces(p);
    setL2i(0);
    setL2inp("");
    setL2t([]);
    setL2a([]);
    setT0(Date.now());
    setT1(null);
    setL2e(playerPositions.map((pr) => getThreats(pr, p)));
    setScreen("l2");
  };

  const sub1 = () => {
    const v = inp.trim().toLowerCase();
    if (!vSq(v)) return;
    if (!pp[curIdx]) return;
    const piece = pp[curIdx];
    const isCorrect = piece.square === v;
    setAns((prev) => [...prev, { piece, attempt: v, correct: piece.square, isCorrect }]);
    setCI((prev) => prev + 1);
    setInp("");
    if (curIdx + 1 >= pp.length) {
      setT1(Date.now());
      setScreen("l1r");
    }
  };

  const sub2 = () => {
    if (!pp[l2i]) return;
    const exp = l2e[l2i] || [];
    const giv = Array.from(new Set(l2t.map((x) => x.trim().toLowerCase()).filter(vSq))).sort();
    const expSorted = [...exp].sort();
    const isCorrect = expSorted.length === giv.length && expSorted.every((v, i) => v === giv[i]);
    setL2a((prev) => [...prev, { piece: pp[l2i], expected: expSorted, provided: giv, isCorrect }]);
    setL2i((prev) => prev + 1);
    setL2t([]);
    setL2inp("");
    if (l2i + 1 >= pp.length) {
      setT1(Date.now());
      setScreen("l2r");
    }
  };

  useEffect(() => {
    if (screen === "l1" && ref.current) ref.current.focus();
    if (screen === "l2" && l2ref.current) l2ref.current.focus();
  }, [screen, curIdx, l2i]);

  const hl = (() => {
    const h = {};
    if (screen === "l1" && pp[curIdx]) h[pp[curIdx].square] = "player";
    if (screen === "l2" && pp[l2i]) h[pp[l2i].square] = "player";
    if (screen === "l1r") {
      ans.forEach((a) => {
        h[a.correct] = a.isCorrect ? "correct" : "wrong";
      });
    }
    if (screen === "l2r") {
      l2a.forEach((a) => {
        if (a.expected.length === 0 && a.provided.length === 0) return;
        a.expected.forEach((sq) => { h[sq] = "correct"; });
      });
      if (revi !== null && l2a[revi]) {
        h[l2a[revi].piece.square] = "player";
      }
    }
    return h;
  })();

  const isRes = screen === "l1r" || screen === "l2r";
  const isL2 = screen === "l2" || screen === "l2r";
  const data = isL2 ? l2a : ans;
  const nOk = data.filter((x) => x.isCorrect).length;
  const perfect = isRes && pp.length > 0 && nOk === pp.length;

  const inputStyle = {
    flex: 1, padding: "10px 14px", borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.12)", background: INPUT_BG,
    color: TEXT_BRIGHT, fontSize: 15, outline: "none",
    fontFamily: "'JetBrains Mono','Courier New',monospace",
    transition: "border-color 0.15s ease",
  };

  if (screen === "menu") {
    return (
      <div style={{
        minHeight: "100vh", background: BG, color: TEXT_BRIGHT,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        fontFamily: "'Segoe UI','Helvetica Neue',Arial,sans-serif", padding: 24,
      }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h1 style={{
            fontSize: 42, fontWeight: 800, margin: 0, letterSpacing: -1,
            background: "linear-gradient(135deg, #81b64c, #5dadec)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            Chess Viz Trainer
          </h1>
          <p style={{ color: TEXT, fontSize: 16, marginTop: 8 }}>Train board awareness & tactical vision</p>
        </div>

        <Card style={{ width: "min(90vw, 400px)", display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 2, color: TEXT, fontWeight: 600, marginBottom: 2 }}>
            Play as
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {[
              ["w", "wK", "White"],
              ["b", "bK", "Black"]
            ].map(([c, sk, l]) => (
              <button
                key={c}
                onClick={() => setPc(c)}
                style={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  padding: 12, borderRadius: 8, border: pc === c ? `2px solid ${ACCENT}` : "2px solid transparent",
                  background: pc === c ? "rgba(129,182,76,0.12)" : "rgba(255,255,255,0.04)",
                  color: TEXT_BRIGHT, cursor: "pointer", fontSize: 15, fontWeight: 600,
                  transition: "all 0.15s ease",
                }}
              >
                <img src={svgPieces[sk]} alt={l} style={{ width: 32, height: 32 }} />
                {l}
              </button>
            ))}
          </div>

          <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "6px 0" }} />

          <Btn onClick={s1} variant="primary" style={{ width: "100%", padding: 14, fontSize: 16 }}>
            Level 1 — Coordinates
          </Btn>
          <Btn onClick={s2} variant="orange" style={{ width: "100%", padding: 14, fontSize: 16 }}>
            Level 2 — Threats
          </Btn>

          <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "2px 0" }} />

          <Btn onClick={() => setScreen("sandbox")} variant="secondary" style={{ width: "100%", padding: 14, fontSize: 16 }}>
            Sandbox — Free Play
          </Btn>
        </Card>
      </div>
    );
  }

  if (screen === "sandbox") {
    return <Sandbox onBack={() => setScreen("menu")} />;
  }

  return (
    <div style={{
      minHeight: "100vh", background: BG, color: TEXT_BRIGHT,
      fontFamily: "'Segoe UI','Helvetica Neue',Arial,sans-serif",
      display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 16px 40px",
    }}>
      {/* Top bar */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        width: "min(88vw,560px)", marginBottom: 12,
      }}>
        <Btn onClick={() => setScreen("menu")} variant="ghost" style={{ padding: "6px 14px", fontSize: 13 }}>
          Back
        </Btn>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: TEXT }}>
            {isL2 ? "Level 2 — Threats" : "Level 1 — Coordinates"}
          </span>
          <Timer running={!isRes && t0 !== null} t0={t0} t1={t1} />
        </div>
        <Btn onClick={() => setFl((f) => !f)} variant="ghost" style={{ padding: "6px 14px", fontSize: 13 }}>
          Flip
        </Btn>
      </div>

      <Board pieces={pieces} highlights={hl} flipped={flipped} />

      <div style={{ width: "min(88vw,560px)", marginTop: 16 }}>
        {screen === "l1" && pp[curIdx] && (
          <Card>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <PI type={pp[curIdx].type} color={pp[curIdx].color} size={32} />
                <span style={{ fontSize: 15, color: TEXT }}>What square is the highlighted piece on?</span>
              </div>
              <span style={{ fontSize: 13, color: TEXT, fontWeight: 600, background: "rgba(255,255,255,0.06)", padding: "4px 10px", borderRadius: 20 }}>
                {curIdx + 1}/{pp.length}
              </span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                ref={ref}
                value={inp}
                onChange={(e) => setInp(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sub1()}
                placeholder="e.g. e4"
                style={inputStyle}
              />
              <Btn onClick={sub1}>Submit</Btn>
            </div>
          </Card>
        )}

        {screen === "l2" && pp[l2i] && (
          <Card>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <PI type={pp[l2i].type} color={pp[l2i].color} size={32} />
                <span style={{ fontSize: 15, color: TEXT }}>Type the furthest square threatened in each direction</span>
              </div>
              <span style={{ fontSize: 13, color: TEXT, fontWeight: 600, background: "rgba(255,255,255,0.06)", padding: "4px 10px", borderRadius: 20 }}>
                {l2i + 1}/{pp.length}
              </span>
            </div>
            {l2t.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
                {l2t.map((sq) => <Tag key={sq} sq={sq} onRemove={() => setL2t((p) => p.filter((x) => x !== sq))} />)}
              </div>
            )}
            <div style={{ display: "flex", gap: 8 }}>
              <input
                ref={l2ref}
                value={l2inp}
                onChange={(e) => {
                  const v = e.target.value.toLowerCase().trim();
                  if (vSq(v)) {
                    setL2t((s) => [...new Set([...s, v])]);
                    setL2inp("");
                  } else {
                    setL2inp(v);
                  }
                }}
                onKeyDown={(e) => e.key === "Enter" && sub2()}
                placeholder="e.g. d5"
                style={inputStyle}
              />
              <Btn disabled={l2t.length === 0} onClick={sub2}>Next</Btn>
            </div>
            <div style={{ color: TEXT, fontSize: 11, marginTop: 8, opacity: 0.5 }}>Auto-adds valid square on typing</div>
          </Card>
        )}

        {screen === "l1r" && (
          <Card>
            <div style={{ textAlign: "center", marginBottom: 18 }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: perfect ? ACCENT : DANGER }}>
                {perfect ? "Perfect!" : `${nOk}/${pp.length} Correct`}
              </div>
              <div style={{ color: TEXT, fontSize: 14, marginTop: 4 }}>Completed in {fmt(t1 - t0)}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 18 }}>
              {ans.map((a, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "8px 12px", borderRadius: 8,
                  background: a.isCorrect ? "rgba(129,182,76,0.08)" : "rgba(232,64,64,0.08)",
                }}>
                  <PI type={a.piece.type} color={a.piece.color} size={24} />
                  <span style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 600 }}>{a.correct}</span>
                  {!a.isCorrect && <span style={{ color: DANGER, fontSize: 13 }}>you said {a.attempt}</span>}
                  <span style={{ marginLeft: "auto", fontSize: 16, color: a.isCorrect ? ACCENT : DANGER }}>
                    {a.isCorrect ? "\u2713" : "\u2717"}
                  </span>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Btn onClick={s1} style={{ flex: 1 }}>Retry</Btn>
              <Btn onClick={() => setScreen("menu")} variant="secondary" style={{ flex: 1 }}>Menu</Btn>
            </div>
          </Card>
        )}

        {screen === "l2r" && (
          <Card>
            <div style={{ textAlign: "center", marginBottom: 18 }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: perfect ? ACCENT : DANGER }}>
                {perfect ? "Perfect!" : `${nOk}/${pp.length} Correct`}
              </div>
              <div style={{ color: TEXT, fontSize: 14, marginTop: 4 }}>Completed in {fmt(t1 - t0)}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 18 }}>
              {l2a.map((a, i) => {
                const ok = a.isCorrect;
                const isRev = revi === i;
                return (
                  <div
                    key={i}
                    onClick={() => setRevi(isRev ? null : i)}
                    style={{
                      padding: "10px 12px", borderRadius: 8, cursor: "pointer",
                      background: ok ? "rgba(129,182,76,0.08)" : "rgba(232,64,64,0.08)",
                      transition: "background 0.15s ease",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <PI type={a.piece.type} color={a.piece.color} size={24} />
                      <span style={{ fontWeight: 700, fontFamily: "'JetBrains Mono',monospace", color: ok ? ACCENT : DANGER }}>{a.piece.square}</span>
                      <span style={{ marginLeft: "auto", fontSize: 16, color: ok ? ACCENT : DANGER }}>{ok ? "\u2713" : "\u2717"}</span>
                    </div>
                    {isRev && (
                      <div style={{ marginTop: 10, fontSize: 12, color: TEXT, display: "flex", flexDirection: "column", gap: 4 }}>
                        <div>Expected: <span style={{ color: ACCENT }}>{a.expected.join(", ") || "(none)"}</span></div>
                        <div>Given: <span style={{ color: a.isCorrect ? ACCENT : DANGER }}>{a.provided.join(", ") || "(none)"}</span></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Btn onClick={s2} style={{ flex: 1 }}>Retry</Btn>
              <Btn onClick={() => setScreen("menu")} variant="secondary" style={{ flex: 1 }}>Menu</Btn>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
