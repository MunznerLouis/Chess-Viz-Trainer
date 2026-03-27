import { useState, useEffect, useRef } from "react";
import { Board, Btn, Card, PI, Tag, PageWrap, TopBar, inputStyle, genPos, getThreats, vSq, fmt, PN } from "../shared.jsx";
import { toRating, saveScore } from "../scoring.js";

const TOTAL = 5;
const OPP   = 10;

const DIFF = {
  beginner: { flash: 0,    pieces: 1 },
  easy:     { flash: 5000, pieces: 2 },
  medium:   { flash: 3000, pieces: 3 },
  hard:     { flash: 1500, pieces: 3 },
};

export default function Threats({ onBack, onComplete }) {
  const [phase, setPhase]     = useState("intro");
  const [pc, setPc]           = useState("w");
  const [diff, setDiff]       = useState("beginner");
  const [pieces, setPieces]   = useState([]);
  const [round, setRound]     = useState(0);
  const [tags, setTags]       = useState([]);
  const [inp, setInp]         = useState("");
  const [expected, setExp]    = useState([]);
  const [results, setResults] = useState([]);
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
    const pp = p.find((x) => x.isPlayer);
    setPieces(p);
    setRound(0);
    setTags([]);
    setInp("");
    setResults([]);
    setT0(Date.now());
    setT1(null);
    setExp(pp ? getThreats(pp, p) : []);
    setVisible(true);
    if (cfg.flash > 0) {
      clearTimeout(flashRef.current);
      flashRef.current = setTimeout(() => setVisible(false), cfg.flash);
    }
    setPhase("playing");
  }

  function submit() {
    if (!current) return;
    const given = [...new Set(tags.map((s) => s.trim().toLowerCase()).filter(vSq))].sort();
    const expSorted = [...expected].sort();
    const isCorrect = expSorted.length === given.length && expSorted.every((v, i) => v === given[i]);
    const newResults = [...results, { piece: current, expected: expSorted, provided: given, isCorrect }];
    setResults(newResults);

    if (round + 1 >= TOTAL) {
      const end = Date.now();
      setT1(end);
      setPhase("results");
      const ok = newResults.filter((r) => r.isCorrect).length;
      const rating = toRating(ok / TOTAL, end - t0, 60000);
      saveScore("threats", rating);
      onComplete?.(rating);
    } else {
      const p = genPos(pc, cfg.pieces, OPP);
      const pp = p.find((x) => x.isPlayer);
      setPieces(p);
      setRound((r) => r + 1);
      setTags([]);
      setInp("");
      setExp(pp ? getThreats(pp, p) : []);
      if (cfg.flash > 0) {
        setVisible(true);
        clearTimeout(flashRef.current);
        flashRef.current = setTimeout(() => setVisible(false), cfg.flash);
      }
    }
  }

  useEffect(() => {
    if (phase === "playing" && (!visible || cfg.flash === 0) && inputRef.current)
      inputRef.current.focus();
  }, [phase, round, visible, cfg.flash]);

  const hl = (() => {
    const h = {};
    if (phase === "playing" && current && cfg.flash === 0) h[current.square] = "player";
    if (phase === "results") {
      results.forEach((r) => r.expected.forEach((sq) => { h[sq] = "correct"; }));
    }
    return h;
  })();

  // ── INTRO ──
  if (phase === "intro") {
    return (
      <PageWrap>
        <TopBar title="Threats" onBack={onBack} />
        <Card style={{ width: "min(90vw,400px)", display: "flex", flexDirection: "column", gap: 16 }}>
          <p style={{ margin: 0, lineHeight: 1.6, color: "#c0bfbd" }}>
            For each highlighted piece, type every square it threatens (furthest in each direction for sliding pieces). Press Enter after each square.
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
    const ok = results.filter((r) => r.isCorrect).length;
    const elapsed = t1 - t0;
    const rating = toRating(ok / TOTAL, elapsed, 60000);
    return (
      <PageWrap>
        <TopBar title="Threats — Results" onBack={onBack} />
        <Board pieces={results.map((r) => r.piece)} highlights={hl} flipped={flipped} />
        <div style={{ width: "min(88vw,560px)", marginTop: 16, display: "flex", flexDirection: "column", gap: 12 }}>
          <Card style={{ textAlign: "center" }}>
            <div style={{ fontSize: 48, fontWeight: 800, color: "#e8912d" }}>{rating}</div>
            <div style={{ fontSize: 14, color: "#c0bfbd", marginTop: 4 }}>{ok}/{TOTAL} correct · {fmt(elapsed)}</div>
          </Card>
          {results.map((r, i) => (
            <Card key={i}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <PI type={r.piece.type} color={r.piece.color} size={28} />
                <span style={{ color: r.isCorrect ? "#81b64c" : "#e84040", fontSize: 14, fontWeight: 700 }}>
                  {r.isCorrect ? "✓ Correct" : "✗ Wrong"}
                </span>
              </div>
              {!r.isCorrect && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {r.expected.map((sq) => (
                    <Tag key={sq} sq={sq} status={r.provided.includes(sq) ? "correct" : "missing"} />
                  ))}
                  {r.provided.filter((sq) => !r.expected.includes(sq)).map((sq) => (
                    <Tag key={sq} sq={sq} status="wrong" />
                  ))}
                </div>
              )}
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
      <TopBar title="Threats" onBack={onBack} right={
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
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <PI type={current.type} color={current.color} size={32} />
              <span style={{ fontSize: 15, color: "#c0bfbd" }}>Type every square this piece threatens</span>
            </div>
          </div>
          {tags.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
              {tags.map((sq) => <Tag key={sq} sq={sq} onRemove={() => setTags((p) => p.filter((x) => x !== sq))} />)}
            </div>
          )}
          <div style={{ display: "flex", gap: 8 }}>
            <input
              ref={inputRef}
              value={inp}
              onChange={(e) => {
                const v = e.target.value.toLowerCase().trim();
                if (vSq(v)) { setTags((s) => [...new Set([...s, v])]); setInp(""); }
                else setInp(v);
              }}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="e.g. d5"
              style={inputStyle}
            />
            <Btn onClick={submit}>Submit</Btn>
          </div>
        </Card>
      )}
    </PageWrap>
  );
}
