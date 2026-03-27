import { useMemo } from "react";

// ── Utilities ──────────────────────────────────────────────────────────────
export const C = "abcdefgh";
export const R = "12345678";
export const PN = { K: "King", Q: "Queen", R: "Rook", B: "Bishop", N: "Knight", P: "Pawn" };

export const p2c = (c, r) => C[c] + R[r];
export const c2p = (s) => ({ col: C.indexOf(s[0]), row: +s[1] - 1 });
export const ri = (n) => Math.floor(Math.random() * n);
export const vSq = (s) => /^[a-h][1-8]$/.test(s);
export const fmt = (ms) => `${Math.floor(ms / 1000)}.${Math.floor((ms % 1000) / 100)}s`;
export const inBoard = (c, r) => c >= 0 && c < 8 && r >= 0 && r < 8;

export const shuffle = (a) => {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = ri(i + 1);
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
};

export const allSquares = () => {
  const sq = [];
  for (const c of C) for (const r of R) sq.push(c + r);
  return sq;
};

export const getThreats = (piece, all) => {
  const occ = new Map(all.map((p) => [p.square, p]));
  const { col, row } = c2p(piece.square);
  const out = new Set();

  if (piece.type === "N") {
    [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]].forEach(([dc, dr]) => {
      if (inBoard(col+dc, row+dr)) out.add(p2c(col+dc, row+dr));
    });
    return [...out].sort();
  }
  if (piece.type === "K") {
    for (let dc = -1; dc <= 1; dc++)
      for (let dr = -1; dr <= 1; dr++)
        if ((dc || dr) && inBoard(col+dc, row+dr)) out.add(p2c(col+dc, row+dr));
    return [...out].sort();
  }
  if (piece.type === "P") {
    const d = piece.color === "w" ? 1 : -1;
    [-1, 1].forEach((dc) => { if (inBoard(col+dc, row+d)) out.add(p2c(col+dc, row+d)); });
    return [...out].sort();
  }
  const dirs = [];
  if (piece.type === "R" || piece.type === "Q") dirs.push([0,1],[0,-1],[1,0],[-1,0]);
  if (piece.type === "B" || piece.type === "Q") dirs.push([1,1],[1,-1],[-1,1],[-1,-1]);
  dirs.forEach(([dc, dr]) => {
    let nc = col+dc, nr = row+dr, last = null;
    while (inBoard(nc, nr)) {
      last = p2c(nc, nr);
      if (occ.has(last)) break;
      nc += dc; nr += dr;
    }
    if (last) out.add(last);
  });
  return [...out].sort();
};

export const genPos = (pc, pn, on) => {
  const available = shuffle(allSquares());
  const types = ["K", "Q", "R", "B", "N", "P"];
  const pieces = [];
  for (let i = 0; i < pn; i++) {
    const color = pc === "h" ? (i % 2 === 0 ? "w" : "b") : pc;
    pieces.push({ color, type: types[i % types.length], square: available.pop(), isPlayer: true });
  }
  const oppFor = pc === "w" ? "b" : pc === "b" ? "w" : null;
  for (let i = 0; i < on; i++) {
    const color = oppFor || (i % 2 === 0 ? "b" : "w");
    pieces.push({ color, type: types[i % types.length], square: available.pop(), isPlayer: false });
  }
  return shuffle(pieces);
};

// ── Colors ─────────────────────────────────────────────────────────────────
export const LS = "#eeeed2";
export const DS = "#769656";
export const HP = "#f6f669";
export const HC = "#96bc4b";
export const HW = "#e84040";
export const HE = "#5dadec";
export const BG = "#262522";
export const CARD = "#302e2b";
export const CARD_BORDER = "#3d3a37";
export const TEXT = "#c0bfbd";
export const TEXT_BRIGHT = "#f0f0f0";
export const ACCENT = "#81b64c";
export const DANGER = "#e84040";
export const INPUT_BG = "#1a1816";

// ── Lichess cburnett piece SVGs (GPL-2.0, Colin M.L. Burnett) ──────────────
const SVG_DATA = {
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

export const svgPieces = {};
for (const c of ["w", "b"])
  for (const t of ["K", "Q", "R", "B", "N", "P"])
    svgPieces[c + t] = `data:image/svg+xml,${encodeURIComponent(SVG_DATA[c + t])}`;

// ── Board component ─────────────────────────────────────────────────────────
export function Board({ pieces = [], highlights = {}, flipped = false, onSquareClick, size }) {
  const pm = useMemo(() => {
    const m = new Map();
    pieces.forEach((p) => m.set(p.square, p));
    return m;
  }, [pieces]);

  const w = size || "min(88vw, 560px)";

  return (
    <div style={{ position: "relative", width: w, aspectRatio: "1", borderRadius: 6, overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(8,1fr)", gridTemplateRows: "repeat(8,1fr)", width: "100%", height: "100%" }}>
        {Array.from({ length: 64 }, (_, i) => {
          const col = i % 8;
          const row = Math.floor(i / 8);
          const coord = p2c(col, row);
          const isDark = (col + row) % 2 === 1;
          const hl = highlights[coord];
          let bg = isDark ? DS : LS;
          if (hl === "player")    bg = isDark ? "#baca2b" : HP;
          if (hl === "correct")   bg = isDark ? "#6aaa3a" : HC;
          if (hl === "wrong")     bg = isDark ? "#c73030" : HW;
          if (hl === "highlight") bg = isDark ? "#4a88c0" : HE;
          const dR = flipped ? row : 7 - row;
          const dC = flipped ? 7 - col : col;
          const piece = pm.get(coord);
          return (
            <div
              key={coord}
              onClick={() => onSquareClick?.(coord)}
              style={{
                gridColumn: dC + 1, gridRow: dR + 1,
                background: bg,
                display: "flex", justifyContent: "center", alignItems: "center",
                cursor: onSquareClick ? "pointer" : "default",
                transition: "background 0.12s ease",
              }}
            >
              {piece && (
                <img
                  src={svgPieces[piece.color + piece.type]}
                  alt={piece.color + piece.type}
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

// ── UI Components ───────────────────────────────────────────────────────────
export function PI({ type, color, size = 26 }) {
  return <img src={svgPieces[color + type]} alt={color + type} style={{ width: size, height: size }} />;
}

export function Tag({ sq, onRemove, status }) {
  let bg = "rgba(255,255,255,0.06)", bd = "#555";
  if (status === "correct") { bg = "rgba(129,182,76,0.15)";  bd = ACCENT; }
  if (status === "wrong")   { bg = "rgba(232,64,64,0.15)";   bd = DANGER; }
  if (status === "missing") { bg = "rgba(93,173,236,0.15)";  bd = HE; }
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", borderRadius: 6, border: `1px solid ${bd}`, background: bg, color: TEXT_BRIGHT, fontSize: 13, fontWeight: 600, fontFamily: "'JetBrains Mono','Courier New',monospace" }}>
      {sq}
      {onRemove && <span onClick={onRemove} style={{ cursor: "pointer", marginLeft: 2, opacity: 0.4, fontSize: 15, lineHeight: 1 }}>x</span>}
    </span>
  );
}

export function Btn({ children, onClick, variant = "primary", disabled, style: extra }) {
  const s = {
    primary:   { background: ACCENT,                      color: "#1a1a1a", fontWeight: 700 },
    secondary: { background: "rgba(255,255,255,0.08)",    color: TEXT,      border: "1px solid rgba(255,255,255,0.12)" },
    orange:    { background: "#e8912d",                   color: "#1a1a1a", fontWeight: 700 },
    ghost:     { background: "none",                      border: "1px solid rgba(255,255,255,0.15)", color: TEXT },
    danger:    { background: DANGER,                      color: "#fff",    fontWeight: 700 },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{ padding: "10px 18px", borderRadius: 8, border: "none", cursor: disabled ? "default" : "pointer", fontSize: 14, transition: "all 0.15s ease", opacity: disabled ? 0.4 : 1, ...s[variant], ...extra }}>
      {children}
    </button>
  );
}

export function Card({ children, style: extra }) {
  return (
    <div style={{ background: CARD, borderRadius: 12, padding: 20, border: `1px solid ${CARD_BORDER}`, boxShadow: "0 4px 16px rgba(0,0,0,0.2)", ...extra }}>
      {children}
    </div>
  );
}

export const inputStyle = {
  flex: 1, padding: "10px 14px", borderRadius: 8,
  border: "1px solid rgba(255,255,255,0.12)", background: INPUT_BG,
  color: TEXT_BRIGHT, fontSize: 15, outline: "none",
  fontFamily: "'JetBrains Mono','Courier New',monospace",
  transition: "border-color 0.15s ease",
};

// Shared page wrapper used by all benchmarks
export function PageWrap({ children }) {
  return (
    <div style={{ minHeight: "100vh", background: BG, color: TEXT_BRIGHT, fontFamily: "'Segoe UI','Helvetica Neue',Arial,sans-serif", display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 16px 40px" }}>
      {children}
    </div>
  );
}

// Top nav bar for benchmark pages
export function TopBar({ title, onBack, right }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "min(88vw,560px)", marginBottom: 16 }}>
      <Btn onClick={onBack} variant="ghost" style={{ padding: "6px 14px", fontSize: 13 }}>Back</Btn>
      <span style={{ fontSize: 15, fontWeight: 700, color: TEXT }}>{title}</span>
      <div style={{ width: 72, display: "flex", justifyContent: "flex-end" }}>{right}</div>
    </div>
  );
}
