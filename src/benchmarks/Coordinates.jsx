import { useState, useEffect, useRef } from "react";
import { Board, Btn, Card, PI, PageWrap, TopBar, inputStyle, genPos, vSq, fmt, PN } from "../shared.jsx";
import { toRating, saveScore } from "../scoring.js";

const TOTAL = 5;
const OPP   = 10;

const DIFF = {
  beginner: { flash: 0,    pieces: 1 },
  easy:     { flash: 5000, pieces: 2 },
  medium:   { flash: 3000, pieces: 4 },
  hard:     { flash: 1500, pieces: 5 },
};

export default function Coordinates({ onBack, onComplete }) {
  const [phase, setPhase] = useState("intro"); // intro | playing | results
  const [pc, setPc]           = useState("w");
  const [diff, setDiff]       = useState("beginner");
  const [pieces, setPieces]   = useState([]);
  const [round, setRound]     = useState(0);
  const [inp, setInp]         = useState("");
  const [ans, setAns]         = useState([]);
  const [t0, setT0]           = useState(null);
  const [t1, setT1]           = useState(null);
  const [visible, setVisible] = useState(true);
  const flashRef = useRef(null);
  const inputRef = useRef(null);

  const cfg = DIFF[diff];
  const playerPieces = pieces.filter((p) => p.isPlayer);
  const current = playerPieces[0];
  const flipped = pc === "b";

  function startGame() {
    const p = genPos(pc, cfg.pieces, OPP);
    setPieces(p);
    setRound(0);
    setAns([]);
    setInp("");
    setT0(Date.now());
    setT1(null);
    setVisible(true);
    if (cfg.flash > 0) {
      clearTimeout(flashRef.current);
      flashRef.current = setTimeout(() => setVisible(false), cfg.flash);
    }
    setPhase("playing");
  }

  function nextRound(newAns) {
    if (round + 1 >= TOTAL) {
      const end = Date.now();
      setT1(end);
      setPhase("results");
      const ok = newAns.filter((a) => a.isCorrect).length;
      const rating = toRating(ok / TOTAL, end - t0, 30000);
      saveScore("coordinates", rating);
      onComplete?.(rating);
    } else {
      const p = genPos(pc, cfg.pieces, OPP);
      setPieces(p);
      setRound((r) => r + 1);
      setInp("");
      if (cfg.flash > 0) {
        setVisible(true);
        clearTimeout(flashRef.current);
        flashRef.current = setTimeout(() => setVisible(false), cfg.flash);
      }
    }
  }

  function submit() {
    const v = inp.trim().toLowerCase();
    if (!vSq(v) || !current) return;
    const isCorrect = current.square === v;
    const newAns = [...ans, { piece: current, attempt: v, correct: current.square, isCorrect }];
    setAns(newAns);
    nextRound(newAns);
  }

  useEffect(() => {
    if (phase === "playing" && !visible && inputRef.current) inputRef.current.focus();
    if (phase === "playing" && cfg.flash === 0 && inputRef.current) inputRef.current.focus();
  }, [phase, round, visible, cfg.flash]);

  const hl = (() => {
    const h = {};
    if (phase === "playing" && current && cfg.flash === 0) h[current.square] = "player";
    if (phase === "results") ans.forEach((a) => { h[a.correct] = a.isCorrect ? "correct" : "wrong"; });
    return h;
  })();

  // ── INTRO ──
  if (phase === "intro") {
    return (
      <PageWrap>
        <TopBar title="Coordinates" onBack={onBack} />
        <Card style={{ width: "min(90vw,400px)", display: "flex", flexDirection: "column", gap: 16 }}>
          <p style={{ margin: 0, lineHeight: 1.6, color: "#c0bfbd" }}>
            A piece will appear on the board. Type the square it's on (e.g. <code style={{ background: "rgba(255,255,255,0.1)", padding: "2px 6px", borderRadius: 4 }}>e4</code>).
            {cfg.flash > 0 && " The board flashes briefly — remember!"}
          </p>

          <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 2, color: "#c0bfbd", fontWeight: 600 }}>Play as</div>
          <div style={{ display: "flex", gap: 8 }}>
            {[["w","K","White"],["b","K","Black"]].map(([c, t, l]) => (
              <button key={c} onClick={() => setPc(c)} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: 12, borderRadius: 8, border: pc === c ? "2px solid #81b64c" : "2px solid transparent", background: pc === c ? "rgba(129,182,76,0.12)" : "rgba(255,255,255,0.04)", color: "#f0f0f0", cursor: "pointer", fontSize: 14, fontWeight: 600 }}>
                <PI type={t} color={c} size={28} /> {l}
              </button>
            ))}
          </div>

          <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 2, color: "#c0bfbd", fontWeight: 600 }}>Difficulty</div>
          <div style={{ display: "flex", gap: 6 }}>
            {Object.keys(DIFF).map((d) => (
              <button key={d} onClick={() => setDiff(d)} style={{ flex: 1, padding: "8px 4px", borderRadius: 8, border: diff === d ? "2px solid #81b64c" : "2px solid transparent", background: diff === d ? "rgba(129,182,76,0.12)" : "rgba(255,255,255,0.04)", color: "#f0f0f0", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                {d[0].toUpperCase() + d.slice(1)}
              </button>
            ))}
          </div>

          <Btn onClick={startGame} style={{ width: "100%", padding: 14, fontSize: 16 }}>Start</Btn>
        </Card>
      </PageWrap>
    );
  }

  // ── RESULTS ──
  if (phase === "results") {
    const ok = ans.filter((a) => a.isCorrect).length;
    const elapsed = t1 - t0;
    const rating = toRating(ok / TOTAL, elapsed, 30000);
    return (
      <PageWrap>
        <TopBar title="Coordinates — Results" onBack={onBack} />
        <Board
          pieces={ans.map((a) => ({ ...a.piece, square: a.correct }))}
          highlights={hl}
          flipped={flipped}
        />
        <div style={{ width: "min(88vw,560px)", marginTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
          <Card style={{ textAlign: "center" }}>
            <div style={{ fontSize: 48, fontWeight: 800, color: "#81b64c" }}>{rating}</div>
            <div style={{ fontSize: 14, color: "#c0bfbd", marginTop: 4 }}>
              {ok}/{TOTAL} correct · {fmt(elapsed)}
            </div>
          </Card>
          {ans.map((a, i) => (
            <Card key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <PI type={a.piece.type} color={a.piece.color} size={32} />
              <span style={{ fontFamily: "monospace", fontSize: 15, color: "#f0f0f0" }}>{PN[a.piece.type]}</span>
              <span style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ color: a.isCorrect ? "#81b64c" : "#e84040", fontFamily: "monospace", fontSize: 14 }}>{a.attempt}</span>
                {!a.isCorrect && <span style={{ color: "#5dadec", fontFamily: "monospace", fontSize: 14 }}>→ {a.correct}</span>}
              </span>
            </Card>
          ))}
          <div style={{ display: "flex", gap: 10 }}>
            <Btn onClick={startGame} style={{ flex: 1, padding: 14, fontSize: 15 }}>Play Again</Btn>
            <Btn onClick={onBack} variant="ghost" style={{ flex: 1, padding: 14, fontSize: 15 }}>Home</Btn>
          </div>
        </div>
      </PageWrap>
    );
  }

  // ── PLAYING ──
  return (
    <PageWrap>
      <TopBar title="Coordinates" onBack={onBack} right={
        <span style={{ fontSize: 13, color: "#c0bfbd", fontWeight: 600, background: "rgba(255,255,255,0.06)", padding: "4px 10px", borderRadius: 20 }}>
          {round + 1}/{TOTAL}
        </span>
      } />
      {visible && <Board pieces={pieces} highlights={hl} flipped={flipped} />}
      {!visible && cfg.flash > 0 && (
        <div style={{ width: "min(88vw,560px)", aspectRatio: "1", borderRadius: 6, background: "#1a1816", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ color: "#555", fontSize: 14 }}>Board hidden</span>
        </div>
      )}
      {current && (!visible || cfg.flash === 0) && (
        <Card style={{ width: "min(88vw,560px)", marginTop: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <PI type={current.type} color={current.color} size={32} />
            <span style={{ fontSize: 15, color: "#c0bfbd" }}>What square is the highlighted piece on?</span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input ref={inputRef} value={inp} onChange={(e) => setInp(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} placeholder="e.g. e4" style={inputStyle} />
            <Btn onClick={submit}>Submit</Btn>
          </div>
        </Card>
      )}
    </PageWrap>
  );
}
