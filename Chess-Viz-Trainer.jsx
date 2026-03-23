import { useState, useEffect, useRef, useMemo } from "react";

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

const pieceChar = {
  w: { K: "♔", Q: "♕", R: "♖", B: "♗", N: "♘", P: "♙" },
  b: { K: "♚", Q: "♛", R: "♜", B: "♝", N: "♞", P: "♟" }
};
const makePieceURI = (color, type) => {
  const label = pieceChar[color][type] || "?";
  const fill = color === "w" ? "#000" : "#fff";
  const stroke = color === "w" ? "#fff" : "#000";
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 45 45">
      <rect x="0" y="0" width="45" height="45" fill="none"/>
      <text x="50%" y="58%" text-anchor="middle" dominant-baseline="middle"
            font-size="28" font-family="Arial" fill="${fill}" stroke="${stroke}" stroke-width="1">${label}</text>
    </svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

const svgPieces = {
  wK: makePieceURI("w", "K"),
  wQ: makePieceURI("w", "Q"),
  wR: makePieceURI("w", "R"),
  wB: makePieceURI("w", "B"),
  wN: makePieceURI("w", "N"),
  wP: makePieceURI("w", "P"),
  bK: makePieceURI("b", "K"),
  bQ: makePieceURI("b", "Q"),
  bR: makePieceURI("b", "R"),
  bB: makePieceURI("b", "B"),
  bN: makePieceURI("b", "N"),
  bP: makePieceURI("b", "P"),
};

const LS = "#ebecd0";
const DS = "#779556";
const HP = "#f7ec59";
const HC = "#96bc4b";
const HW = "#e84040";
const HT = "#ff9b3b";
const HE = "#5dadec";
const BD = "#312e2b";
const BP = "#272522";
const TL = "#bababa";
const TW = "#ffffff";
const AG = "#81b64c";
const AR = "#e84040";

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

const fmt = (ms) => `${Math.floor(ms / 1000)}.${Math.floor((ms % 1000) / 100)} s`;

function Board({ pieces, highlights, flipped }) {
  const pm = useMemo(() => {
    const m = new Map();
    pieces.forEach((p) => m.set(p.square, p));
    return m;
  }, [pieces]);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(8,1fr)",
        gridTemplateRows: "repeat(8,1fr)",
        width: "min(90vw,720px)",
        height: "min(90vw,720px)",
        border: "1px solid #444",
      }}
    >
      {Array.from({ length: 64 }, (_, i) => {
        const col = i % 8;
        const row = Math.floor(i / 8);
        const coord = p2c(col, row);
        const isDark = (col + row) % 2 === 1;
        const hl = highlights?.[coord];
        let bg = isDark ? DS : LS;
        if (hl === "player") bg = HP;
        if (hl === "correct") bg = HC;
        if (hl === "wrong") bg = HW;

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
            }}
          >
            {piece && (
              <img
                src={svgPieces[piece.color + piece.type]}
                alt={`${piece.color}${piece.type}`}
                style={{ width: "78%", height: "78%" }}
              />
            )}
          </div>
        );
      })}
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
    <span style={{ fontFamily: "'Courier New',monospace", fontSize: 22, fontWeight: 700, color: TW }}>
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
  let bg = "#3d3a37";
  let bd = "#555";
  if (status === "correct") {
    bg = "rgba(129,182,76,0.25)";
    bd = AG;
  }
  if (status === "wrong") {
    bg = "rgba(232,64,64,0.25)";
    bd = AR;
  }
  if (status === "missing") {
    bg = "rgba(93,173,236,0.25)";
    bd = HE;
  }
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 8px", borderRadius: 6, border: `1px solid ${bd}`, background: bg, color: TL }}>
      {sq}
      {onRemove && (
        <span onClick={onRemove} style={{ cursor: "pointer", marginLeft: 2, opacity: 0.5 }}>
          ×
        </span>
      )}
    </span>
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

  if (screen === "menu") {
    return (
      <div style={{ minHeight: "100vh", background: BD, color: TW, padding: 20, fontFamily: "Arial, sans-serif" }}>
        <h1 style={{ color: TL }}>Chess Visu Trainer</h1>
        <p>Train board awareness & tactical vision.</p>
        <div style={{ maxWidth: 480, margin: "0 auto", display: "grid", gap: 10 }}>
          <div style={{ display: "flex", gap: 8 }}>
            {[
              ["w", "wK", "White"],
              ["b", "bK", "Black"]
            ].map(([c, sk, l]) => (
              <button
                key={c}
                onClick={() => setPc(c)}
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  padding: 10,
                  borderRadius: 8,
                  border: "1px solid #444",
                  background: pc === c ? AG : BP,
                  color: TW,
                }}
              >
                <img src={svgPieces[sk]} alt={l} style={{ width: 28, height: 28 }} />
                {l}
              </button>
            ))}
          </div>

          <button onClick={s1} style={{ padding: 12, borderRadius: 8, background: AG, color: BD, border: "none" }}>
            Level 1 — Coordinates
          </button>
          <button onClick={s2} style={{ padding: 12, borderRadius: 8, background: HT, color: BD, border: "none" }}>
            Level 2 — Threats
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: BD, color: TW, padding: 16, fontFamily: "Arial, sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <button onClick={() => setScreen("menu")} style={{ background: "none", border: "1px solid #444", color: TL, padding: "8px 12px", borderRadius: 6 }}>
          Back
        </button>
        <span style={{ fontSize: 18, fontWeight: 700 }}>{isL2 ? "Level 2 — Threats" : "Level 1 — Coordinates"}</span>
        <button onClick={() => setFl((f) => !f)} style={{ background: "none", border: "1px solid #444", color: TL, padding: "8px 12px", borderRadius: 6 }}>
          Flip
        </button>
      </div>

      <Board pieces={pieces} highlights={hl} flipped={flipped} />

      <div style={{ width: "min(88vw,520px)", marginTop: 12 }}>
        {screen === "l1" && pp[curIdx] && (
          <div style={{ background: BP, borderRadius: 10, padding: 16, border: "1px solid #3d3a37", color: TL }}>
            <div style={{ marginBottom: 10 }}>
              <span>Piece {curIdx + 1} / {pp.length}</span>
            </div>
            <div style={{ marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
              <PI type={pp[curIdx].type} color={pp[curIdx].color} />
              <span>What square is the highlighted piece on?</span>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                ref={ref}
                value={inp}
                onChange={(e) => setInp(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sub1()}
                style={{ flex: 1, padding: 8, borderRadius: 6, border: "1px solid #555", background: "#1f1d1b", color: TW }}
              />
              <button onClick={sub1} style={{ padding: "8px 14px", borderRadius: 6, border: "none", background: AG }}>Submit</button>
            </div>
          </div>
        )}

        {screen === "l2" && pp[l2i] && (
          <div style={{ background: BP, borderRadius: 10, padding: 16, border: "1px solid #3d3a37", color: TL }}>
            <div style={{ marginBottom: 8 }}>
              <span>Piece {l2i + 1} / {pp.length}</span>
            </div>
            <div style={{ marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
              <PI type={pp[l2i].type} color={pp[l2i].color} />
              <span>Type the furthest square threatened in each direction.</span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
              {l2t.map((sq) => <Tag key={sq} sq={sq} onRemove={() => setL2t((p) => p.filter((x) => x !== sq))} />)}
            </div>
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
                style={{ flex: 1, padding: 8, borderRadius: 6, border: "1px solid #555", background: "#1f1d1b", color: TW }}
              />
              <button disabled={l2t.length === 0} onClick={sub2} style={{ padding: "8px 14px", borderRadius: 6, border: "none", background: l2t.length ? AG : "#555" }}>
                Next
              </button>
            </div>
            <div style={{ color: TL, fontSize: 11, marginTop: 6, opacity: 0.7 }}>Auto-adds valid square on Enter</div>
          </div>
        )}

        {screen === "l1r" && (
          <div style={{ background: BP, borderRadius: 10, padding: 18, border: "1px solid #3d3a37", color: TL }}>
            <div style={{ textAlign: "center", marginBottom: 14 }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: perfect ? AG : AR }}>{perfect ? "Perfect!" : "Review results"}</div>
              <div style={{ color: TL, fontSize: 14 }}>Time: {fmt(t1 - t0)}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 14 }}>
              {ans.map((a, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <PI type={a.piece.type} color={a.piece.color} size={24} />
                  <span>{a.piece.square} ← {a.attempt} ({a.isCorrect ? "ok" : "bad"})</span>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={s1} style={{ flex: 1, background: AG, borderRadius: 6, border: "none", padding: 10 }}>Retry</button>
              <button onClick={() => setScreen("menu")} style={{ flex: 1, background: "#444", borderRadius: 6, border: "none", padding: 10 }}>Menu</button>
            </div>
          </div>
        )}

        {screen === "l2r" && (
          <div style={{ background: BP, borderRadius: 10, padding: 18, border: "1px solid #3d3a37", color: TL }}>
            <div style={{ textAlign: "center", marginBottom: 14 }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: perfect ? AG : AR }}>{perfect ? "Perfect!" : "Review results"}</div>
              <div style={{ color: TL, fontSize: 14 }}>Time: {fmt(t1 - t0)}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
              {l2a.map((a, i) => {
                const ok = a.isCorrect;
                const isRev = revi === i;
                return (
                  <div key={i} onClick={() => setRevi(isRev ? null : i)} style={{ padding: "10px 12px", borderRadius: 8, background: "#2a2927", cursor: "pointer" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <PI type={a.piece.type} color={a.piece.color} size={24} />
                      <span style={{ fontWeight: 700, color: ok ? AG : AR }}>{a.piece.square}</span>
                      <span style={{ marginLeft: "auto", fontSize: 13, color: ok ? AG : AR }}>{ok ? "✓" : "✗"}</span>
                    </div>
                    {isRev && (
                      <div style={{ marginTop: 8, fontSize: 12, color: TL }}>
                        Expected: {a.expected.join(", ") || "(none)"}<br />
                        Given: {a.provided.join(", ") || "(none)"}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={s2} style={{ flex: 1, background: AG, borderRadius: 6, border: "none", padding: 10 }}>Retry</button>
              <button onClick={() => setScreen("menu")} style={{ flex: 1, background: "#444", borderRadius: 6, border: "none", padding: 10 }}>Menu</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}