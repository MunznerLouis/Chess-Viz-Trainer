import { useState, useEffect, useRef } from "react";
import { Board, Btn, Card, PI, PageWrap, TopBar, inputStyle, shuffle, ri, allSquares, PN } from "../shared.jsx";
import { toRating, saveScore } from "../scoring.js";

const TOTAL      = 5;
const PIECE_TYPES = ["K", "Q", "R", "B", "N", "P"];
const COLORS     = ["w", "b"];

function genCountPos() {
  const sqs = shuffle(allSquares());
  const pieces = [];
  for (let i = 0; i < 18; i++) {
    const color = COLORS[i % 2];
    const type  = PIECE_TYPES[ri(PIECE_TYPES.length)];
    pieces.push({ color, type, square: sqs[i] });
  }
  return pieces;
}

function buildQuestion(pieces) {
  // Build count map
  const counts = {};
  for (const p of pieces) {
    const k = p.color + p.type;
    counts[k] = (counts[k] || 0) + 1;
  }
  // 80% ask about a present piece, 20% ask about absent piece
  if (Math.random() < 0.2) {
    const allKeys = [];
    for (const c of COLORS) for (const t of PIECE_TYPES) allKeys.push(c + t);
    const absent = allKeys.filter((k) => !counts[k]);
    if (absent.length) {
      const k = absent[ri(absent.length)];
      return { color: k[0], type: k[1], answer: 0 };
    }
  }
  const keys = Object.keys(counts);
  const k = keys[ri(keys.length)];
  return { color: k[0], type: k[1], answer: counts[k] };
}

export default function PieceCount({ onBack, onComplete }) {
  const [phase, setPhase]     = useState("intro");
  const [pieces, setPieces]   = useState([]);
  const [question, setQuestion] = useState(null);
  const [round, setRound]     = useState(0);
  const [inp, setInp]         = useState("");
  const [results, setResults] = useState([]);
  const [t0, setT0]           = useState(null);
  const [t1, setT1]           = useState(null);
  const [flash, setFlash]     = useState(null); // "correct" | "wrong"
  const inputRef = useRef(null);
  const flashRef = useRef(null);

  function newRound() {
    const p = genCountPos();
    const q = buildQuestion(p);
    setPieces(p);
    setQuestion(q);
    setInp("");
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  function startGame() {
    setRound(0);
    setResults([]);
    setT0(Date.now());
    setT1(null);
    setFlash(null);
    newRound();
    setPhase("playing");
  }

  function submit() {
    const guess = parseInt(inp.trim(), 10);
    if (isNaN(guess) || guess < 0) return;
    const isCorrect = guess === question.answer;
    setFlash(isCorrect ? "correct" : "wrong");
    clearTimeout(flashRef.current);
    flashRef.current = setTimeout(() => {
      setFlash(null);
      const newResults = [...results, { ...question, guess, isCorrect }];
      setResults(newResults);
      if (round + 1 >= TOTAL) {
        const end = Date.now();
        setT1(end);
        setPhase("results");
        const ok = newResults.filter((r) => r.isCorrect).length;
        const rating = toRating(ok / TOTAL, end - t0, 45000);
        saveScore("piececount", rating);
        onComplete?.(rating);
      } else {
        setRound((r) => r + 1);
        newRound();
      }
    }, 600);
  }

  // Highlight the counted piece type on the board
  const hl = (() => {
    if (!question || phase !== "playing") return {};
    const h = {};
    pieces.forEach((p) => {
      if (p.color === question.color && p.type === question.type) h[p.square] = "player";
    });
    return h;
  })();

  const flashBg = flash === "correct" ? "rgba(129,182,76,0.15)" : flash === "wrong" ? "rgba(232,64,64,0.15)" : undefined;

  // ── INTRO ──
  if (phase === "intro") {
    return (
      <PageWrap>
        <TopBar title="Piece Count" onBack={onBack} />
        <Card style={{ width: "min(90vw,440px)", display: "flex", flexDirection: "column", gap: 20, alignItems: "center" }}>
          <div style={{ fontSize: 56 }}>♟♙</div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#f0f0f0", marginBottom: 8 }}>Board Scanner</div>
            <p style={{ margin: 0, color: "#c0bfbd", lineHeight: 1.7, fontSize: 15 }}>
              A board with many pieces will appear. Count how many of a specific piece type are present and type the number.
            </p>
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
    const rating = toRating(ok / TOTAL, elapsed, 45000);
    return (
      <PageWrap>
        <TopBar title="Piece Count — Results" onBack={onBack} />
        <div style={{ width: "min(88vw,560px)", display: "flex", flexDirection: "column", gap: 12 }}>
          <Card style={{ textAlign: "center" }}>
            <div style={{ fontSize: 48, fontWeight: 800, color: "#5dadec" }}>{rating}</div>
            <div style={{ fontSize: 14, color: "#c0bfbd", marginTop: 4 }}>{ok}/{TOTAL} correct</div>
          </Card>
          {results.map((r, i) => (
            <Card key={i} style={{ display: "flex", alignItems: "center", gap: 12, background: r.isCorrect ? "rgba(129,182,76,0.08)" : "rgba(232,64,64,0.08)" }}>
              <PI type={r.type} color={r.color} size={32} />
              <span style={{ color: "#c0bfbd", fontSize: 14 }}>How many {r.color === "w" ? "White" : "Black"} {PN[r.type]}s?</span>
              <span style={{ marginLeft: "auto", display: "flex", gap: 12, alignItems: "center" }}>
                {!r.isCorrect && <span style={{ color: "#c0bfbd", fontSize: 13 }}>You said <strong style={{ color: "#e84040" }}>{r.guess}</strong></span>}
                <span style={{ color: r.isCorrect ? "#81b64c" : "#5dadec", fontWeight: 700, fontSize: 16 }}>{r.answer}</span>
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
      <TopBar title="Piece Count" onBack={onBack} right={
        <span style={{ fontSize: 13, color: "#c0bfbd", fontWeight: 600, background: "rgba(255,255,255,0.06)", padding: "4px 10px", borderRadius: 20 }}>
          {round + 1}/{TOTAL}
        </span>
      } />
      <Board pieces={pieces} highlights={hl} />
      {question && (
        <Card style={{ width: "min(88vw,560px)", marginTop: 16, background: flash ? flashBg : undefined, transition: "background 0.2s ease" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <PI type={question.type} color={question.color} size={36} />
            <span style={{ fontSize: 16, color: "#f0f0f0" }}>
              How many <strong>{question.color === "w" ? "White" : "Black"} {PN[question.type]}s</strong> are on the board?
            </span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              ref={inputRef}
              value={inp}
              type="number"
              min={0}
              max={16}
              onChange={(e) => setInp(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="0"
              style={{ ...inputStyle, width: 80, flex: "none", textAlign: "center", fontSize: 22, fontWeight: 700 }}
            />
            <Btn onClick={submit} disabled={!!flash} style={{ flex: 1 }}>Submit</Btn>
          </div>
        </Card>
      )}
    </PageWrap>
  );
}
