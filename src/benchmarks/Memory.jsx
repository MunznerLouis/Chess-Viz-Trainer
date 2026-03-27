import { useState, useEffect, useRef } from "react";
import { Board, Btn, Card, PI, PageWrap, TopBar, shuffle, ri, allSquares, PN } from "../shared.jsx";
import { saveScore } from "../scoring.js";

const TOTAL = 5;
const PIECE_TYPES = ["K", "Q", "R", "B", "N", "P"];
const COLORS = ["w", "b"];

const FLASH_TIMES = { easy: 8000, medium: 5000, hard: 3000 };

function genMemoryPos() {
  const sqs = shuffle(allSquares());
  const n = 8 + ri(5); // 8-12 pieces
  return sqs.slice(0, n).map((sq, i) => ({
    color: COLORS[i % 2],
    type: PIECE_TYPES[ri(PIECE_TYPES.length)],
    square: sq,
  }));
}

function buildQuestions(pieces) {
  const pieceMap = new Map(pieces.map((p) => [p.square, p]));
  const sqs = allSquares();
  const occupied = pieces.map((p) => p.square);
  const empty = shuffle(sqs.filter((s) => !pieceMap.has(s)));

  // 3 occupied squares + 2 empty squares
  const chosen = [
    ...shuffle(occupied).slice(0, 3),
    ...empty.slice(0, 2),
  ];

  return shuffle(chosen).map((sq) => ({
    square: sq,
    expected: pieceMap.get(sq) || null, // null = empty
  }));
}

const ALL_OPTIONS = [
  ...COLORS.flatMap((c) => PIECE_TYPES.map((t) => ({ color: c, type: t }))),
  null, // "Empty"
];

export default function Memory({ onBack, onComplete }) {
  const [phase, setPhase]       = useState("intro");
  const [diff, setDiff]         = useState("medium");
  const [pieces, setPieces]     = useState([]);
  const [questions, setQuestions] = useState([]);
  const [qIdx, setQIdx]         = useState(0);
  const [results, setResults]   = useState([]);
  const [flashLeft, setFlashLeft] = useState(0);
  const [feedback, setFeedback] = useState(null); // "correct" | "wrong"
  const timerRef  = useRef(null);
  const feedbackRef = useRef(null);

  function startGame() {
    const p = genMemoryPos();
    const qs = buildQuestions(p);
    setPieces(p);
    setQuestions(qs);
    setQIdx(0);
    setResults([]);
    setFeedback(null);
    setFlashLeft(FLASH_TIMES[diff]);
    setPhase("flash");
  }

  // Flash countdown (100ms ticks for smooth display)
  useEffect(() => {
    if (phase !== "flash") return;
    timerRef.current = setInterval(() => {
      setFlashLeft((t) => {
        if (t <= 100) {
          clearInterval(timerRef.current);
          setPhase("recall");
          return 0;
        }
        return t - 100;
      });
    }, 100);
    return () => clearInterval(timerRef.current);
  }, [phase]);

  function answer(option) {
    if (phase !== "recall" || feedback) return;
    const q = questions[qIdx];
    const isCorrect = option === null
      ? q.expected === null
      : q.expected !== null && q.expected.color === option.color && q.expected.type === option.type;

    setFeedback(isCorrect ? "correct" : "wrong");
    clearTimeout(feedbackRef.current);
    feedbackRef.current = setTimeout(() => {
      setFeedback(null);
      const newResults = [...results, { question: q, chosen: option, isCorrect }];
      setResults(newResults);
      if (qIdx + 1 >= TOTAL) {
        setPhase("results");
        const ok = newResults.filter((r) => r.isCorrect).length;
        const base = ok / TOTAL;
        const diffMult = diff === "hard" ? 1 : diff === "medium" ? 0.85 : 0.7;
        const rating = Math.round(Math.max(400, Math.min(2600, 400 + base * diffMult * 2200)));
        saveScore("memory", rating);
        onComplete?.(rating);
      } else {
        setQIdx((i) => i + 1);
      }
    }, 700);
  }

  const currentQ = questions[qIdx];
  const flashPct = flashLeft / FLASH_TIMES[diff] * 100;

  // Board highlight: show the question square during recall
  const recallHl = currentQ ? { [currentQ.square]: "highlight" } : {};

  // ── INTRO ──
  if (phase === "intro") {
    return (
      <PageWrap>
        <TopBar title="Position Memory" onBack={onBack} />
        <Card style={{ width: "min(90vw,440px)", display: "flex", flexDirection: "column", gap: 20, alignItems: "center" }}>
          <div style={{ fontSize: 56 }}>🧠</div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#f0f0f0", marginBottom: 8 }}>Position Memory</div>
            <p style={{ margin: 0, color: "#c0bfbd", lineHeight: 1.7, fontSize: 15 }}>
              A chess position will flash on screen. Memorize it, then answer {TOTAL} questions about what was on specific squares.
            </p>
          </div>

          <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 2, color: "#c0bfbd", fontWeight: 600, alignSelf: "flex-start" }}>Difficulty (flash time)</div>
          <div style={{ display: "flex", gap: 8, width: "100%" }}>
            {[["easy", "8s"], ["medium", "5s"], ["hard", "3s"]].map(([d, label]) => (
              <button key={d} onClick={() => setDiff(d)} style={{ flex: 1, padding: "10px 6px", borderRadius: 8, border: diff === d ? "2px solid #81b64c" : "2px solid transparent", background: diff === d ? "rgba(129,182,76,0.12)" : "rgba(255,255,255,0.04)", color: "#f0f0f0", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                {d[0].toUpperCase() + d.slice(1)}<br /><span style={{ fontSize: 11, opacity: 0.7 }}>{label}</span>
              </button>
            ))}
          </div>

          <Btn onClick={startGame} style={{ width: "100%", padding: 14, fontSize: 16 }}>Start</Btn>
        </Card>
      </PageWrap>
    );
  }

  // ── FLASH ──
  if (phase === "flash") {
    return (
      <PageWrap>
        <TopBar title="Position Memory — Memorize!" onBack={onBack} />
        <div style={{ width: "min(88vw,560px)", height: 8, background: "rgba(255,255,255,0.08)", borderRadius: 4, marginBottom: 16, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${flashPct}%`, background: flashPct > 40 ? "#81b64c" : flashPct > 20 ? "#e8912d" : "#e84040", borderRadius: 4, transition: "width 0.1s linear, background 0.3s ease" }} />
        </div>
        <Board pieces={pieces} />
        <div style={{ marginTop: 12, color: "#c0bfbd", fontSize: 14 }}>
          Memorize this position — {(flashLeft / 1000).toFixed(1)}s remaining
        </div>
      </PageWrap>
    );
  }

  // ── RESULTS ──
  if (phase === "results") {
    const ok = results.filter((r) => r.isCorrect).length;
    const base = ok / TOTAL;
    const diffMult = diff === "hard" ? 1 : diff === "medium" ? 0.85 : 0.7;
    const rating = Math.round(Math.max(400, Math.min(2600, 400 + base * diffMult * 2200)));

    return (
      <PageWrap>
        <TopBar title="Position Memory — Results" onBack={onBack} />
        <div style={{ width: "min(88vw,560px)", display: "flex", flexDirection: "column", gap: 12 }}>
          <Card style={{ textAlign: "center" }}>
            <div style={{ fontSize: 48, fontWeight: 800, color: "#e8912d" }}>{rating}</div>
            <div style={{ fontSize: 14, color: "#c0bfbd", marginTop: 4 }}>{ok}/{TOTAL} correct</div>
          </Card>
          {results.map((r, i) => {
            const { question: q, chosen, isCorrect } = r;
            const correct = q.expected;
            return (
              <Card key={i} style={{ display: "flex", alignItems: "center", gap: 12, background: isCorrect ? "rgba(129,182,76,0.08)" : "rgba(232,64,64,0.08)" }}>
                <div style={{ fontFamily: "monospace", fontSize: 16, fontWeight: 700, color: "#f0f0f0", minWidth: 32 }}>{q.square}</div>
                <div style={{ color: "#c0bfbd", fontSize: 13, flex: 1 }}>
                  {correct ? `${correct.color === "w" ? "White" : "Black"} ${PN[correct.type]}` : "Empty"}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {!isCorrect && (
                    <span style={{ color: "#e84040", fontSize: 13 }}>
                      You said: {chosen ? `${chosen.color === "w" ? "W" : "B"}${chosen.type}` : "Empty"}
                    </span>
                  )}
                  {correct ? <PI type={correct.type} color={correct.color} size={28} /> : <span style={{ color: "#555", fontSize: 22 }}>—</span>}
                  <span style={{ fontSize: 18 }}>{isCorrect ? "✓" : "✗"}</span>
                </div>
              </Card>
            );
          })}
          <div style={{ display: "flex", gap: 10 }}>
            <Btn onClick={startGame} style={{ flex: 1, padding: 14, fontSize: 15 }}>Play Again</Btn>
            <Btn onClick={onBack} variant="ghost" style={{ flex: 1, padding: 14, fontSize: 15 }}>Home</Btn>
          </div>
        </div>
      </PageWrap>
    );
  }

  // ── RECALL ──
  const feedbackBg = feedback === "correct" ? "rgba(129,182,76,0.12)" : feedback === "wrong" ? "rgba(232,64,64,0.12)" : undefined;

  return (
    <PageWrap>
      <TopBar title="Position Memory" onBack={onBack} right={
        <span style={{ fontSize: 13, color: "#c0bfbd", fontWeight: 600, background: "rgba(255,255,255,0.06)", padding: "4px 10px", borderRadius: 20 }}>
          {qIdx + 1}/{TOTAL}
        </span>
      } />

      {/* Blank board with highlighted square */}
      <Board pieces={[]} highlights={recallHl} />

      {currentQ && (
        <Card style={{ width: "min(88vw,560px)", marginTop: 16, background: feedbackBg, transition: "background 0.2s ease" }}>
          <div style={{ fontSize: 16, color: "#f0f0f0", marginBottom: 16, textAlign: "center" }}>
            What piece was on <strong style={{ fontFamily: "monospace", fontSize: 20, color: "#5dadec" }}>{currentQ.square}</strong>?
          </div>

          {/* White pieces */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 8, marginBottom: 8 }}>
            {PIECE_TYPES.map((t) => {
              const opt = { color: "w", type: t };
              const isChosen = feedback && questions[qIdx].expected?.color === "w" && questions[qIdx].expected?.type === t;
              return (
                <button
                  key={"w" + t}
                  onClick={() => answer(opt)}
                  disabled={!!feedback}
                  style={{
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    padding: "8px 4px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.12)",
                    background: isChosen && feedback === "correct" ? "rgba(129,182,76,0.3)" : "rgba(255,255,255,0.05)",
                    cursor: feedback ? "default" : "pointer", gap: 4,
                  }}
                >
                  <PI type={t} color="w" size={32} />
                  <span style={{ fontSize: 10, color: "#888" }}>W{t}</span>
                </button>
              );
            })}
          </div>

          {/* Black pieces */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 8, marginBottom: 8 }}>
            {PIECE_TYPES.map((t) => {
              const opt = { color: "b", type: t };
              const isChosen = feedback && questions[qIdx].expected?.color === "b" && questions[qIdx].expected?.type === t;
              return (
                <button
                  key={"b" + t}
                  onClick={() => answer(opt)}
                  disabled={!!feedback}
                  style={{
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    padding: "8px 4px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.12)",
                    background: isChosen && feedback === "correct" ? "rgba(129,182,76,0.3)" : "rgba(255,255,255,0.05)",
                    cursor: feedback ? "default" : "pointer", gap: 4,
                  }}
                >
                  <PI type={t} color="b" size={32} />
                  <span style={{ fontSize: 10, color: "#888" }}>B{t}</span>
                </button>
              );
            })}
          </div>

          {/* Empty option */}
          <button
            onClick={() => answer(null)}
            disabled={!!feedback}
            style={{
              width: "100%", padding: "10px", borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.15)",
              background: "rgba(255,255,255,0.04)",
              color: "#c0bfbd", cursor: feedback ? "default" : "pointer",
              fontSize: 14, fontWeight: 600,
            }}
          >
            Empty square
          </button>
        </Card>
      )}
    </PageWrap>
  );
}
