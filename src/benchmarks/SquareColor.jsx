import { useState, useEffect, useRef } from "react";
import { Btn, Card, PageWrap, TopBar, C, R, c2p } from "../shared.jsx";
import { toSprintRating, saveScore } from "../scoring.js";

const DURATION = 60; // seconds

function randomSquare() {
  return C[Math.floor(Math.random() * 8)] + R[Math.floor(Math.random() * 8)];
}

function isLight(sq) {
  const { col, row } = c2p(sq);
  return (col + row) % 2 === 0;
}

export default function SquareColor({ onBack, onComplete }) {
  const [phase, setPhase]     = useState("intro"); // intro | playing | results
  const [square, setSquare]   = useState("e4");
  const [correct, setCorrect] = useState(0);
  const [total, setTotal]     = useState(0);
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [feedback, setFeedback] = useState(null); // "correct" | "wrong" | null
  const timerRef  = useRef(null);
  const feedbackRef = useRef(null);

  function start() {
    setCorrect(0);
    setTotal(0);
    setTimeLeft(DURATION);
    setSquare(randomSquare());
    setFeedback(null);
    setPhase("playing");
  }

  // Countdown
  useEffect(() => {
    if (phase !== "playing") return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setPhase("results");
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase]);

  // Save score when results phase begins
  useEffect(() => {
    if (phase === "results") {
      const rating = toSprintRating(correct, 50);
      saveScore("squarecolor", rating);
      onComplete?.(rating);
    }
  }, [phase]);

  function answer(guessLight) {
    if (phase !== "playing") return;
    const right = isLight(square);
    const isCorrect = guessLight === right;
    setCorrect((c) => c + (isCorrect ? 1 : 0));
    setTotal((t) => t + 1);
    setFeedback(isCorrect ? "correct" : "wrong");
    clearTimeout(feedbackRef.current);
    feedbackRef.current = setTimeout(() => setFeedback(null), 250);
    setSquare(randomSquare());
  }

  // Keyboard shortcuts: L = light, D = dark
  useEffect(() => {
    if (phase !== "playing") return;
    const handler = (e) => {
      if (e.key === "l" || e.key === "L") answer(true);
      if (e.key === "d" || e.key === "D") answer(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [phase, square]);

  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
  const timerPct = (timeLeft / DURATION) * 100;
  const timerColor = timeLeft > 20 ? "#81b64c" : timeLeft > 10 ? "#e8912d" : "#e84040";

  // ── INTRO ──
  if (phase === "intro") {
    return (
      <PageWrap>
        <TopBar title="Square Color" onBack={onBack} />
        <Card style={{ width: "min(90vw,440px)", display: "flex", flexDirection: "column", gap: 20, alignItems: "center" }}>
          <div style={{ fontSize: 64 }}>◼◻</div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#f0f0f0", marginBottom: 8 }}>60-Second Sprint</div>
            <p style={{ margin: 0, color: "#c0bfbd", lineHeight: 1.7, fontSize: 15 }}>
              A square name will appear. Answer <strong style={{ color: "#f0f0f0" }}>Light</strong> or <strong style={{ color: "#f0f0f0" }}>Dark</strong> as fast as possible.<br />
              Use the buttons or press <kbd style={{ background: "rgba(255,255,255,0.1)", padding: "2px 7px", borderRadius: 4, fontSize: 13 }}>L</kbd> / <kbd style={{ background: "rgba(255,255,255,0.1)", padding: "2px 7px", borderRadius: 4, fontSize: 13 }}>D</kbd> on your keyboard.
            </p>
          </div>
          <Btn onClick={start} style={{ width: "100%", padding: 14, fontSize: 16 }}>Start</Btn>
        </Card>
      </PageWrap>
    );
  }

  // ── RESULTS ──
  if (phase === "results") {
    const rating = toSprintRating(correct, 50);
    return (
      <PageWrap>
        <TopBar title="Square Color — Results" onBack={onBack} />
        <Card style={{ width: "min(90vw,440px)", display: "flex", flexDirection: "column", gap: 16, alignItems: "center" }}>
          <div style={{ fontSize: 64, fontWeight: 800, color: "#81b64c", lineHeight: 1 }}>{correct}</div>
          <div style={{ color: "#c0bfbd", fontSize: 16 }}>correct in 60 seconds</div>
          <div style={{ width: "100%", height: 1, background: "rgba(255,255,255,0.08)" }} />
          <div style={{ display: "flex", gap: 32, justifyContent: "center" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#f0f0f0" }}>{accuracy}%</div>
              <div style={{ fontSize: 12, color: "#c0bfbd", marginTop: 2 }}>accuracy</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#f0f0f0" }}>{total}</div>
              <div style={{ fontSize: 12, color: "#c0bfbd", marginTop: 2 }}>answered</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#5dadec" }}>{rating}</div>
              <div style={{ fontSize: 12, color: "#c0bfbd", marginTop: 2 }}>rating</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, width: "100%" }}>
            <Btn onClick={start} style={{ flex: 1, padding: 14, fontSize: 15 }}>Play Again</Btn>
            <Btn onClick={onBack} variant="ghost" style={{ flex: 1, padding: 14, fontSize: 15 }}>Home</Btn>
          </div>
        </Card>
      </PageWrap>
    );
  }

  // ── PLAYING ──
  const feedbackBg = feedback === "correct" ? "rgba(129,182,76,0.15)" : feedback === "wrong" ? "rgba(232,64,64,0.15)" : "transparent";

  return (
    <PageWrap>
      <TopBar title="Square Color" onBack={onBack} />

      {/* Timer bar */}
      <div style={{ width: "min(88vw,560px)", height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 3, marginBottom: 24, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${timerPct}%`, background: timerColor, borderRadius: 3, transition: "width 1s linear, background 0.5s ease" }} />
      </div>

      <Card style={{ width: "min(88vw,500px)", display: "flex", flexDirection: "column", alignItems: "center", gap: 24, background: feedbackBg, transition: "background 0.15s ease" }}>
        {/* Timer + score */}
        <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
          <span style={{ fontSize: 32, fontWeight: 800, color: timerColor, fontVariantNumeric: "tabular-nums" }}>{timeLeft}s</span>
          <span style={{ fontSize: 22, fontWeight: 700, color: "#81b64c" }}>{correct} <span style={{ fontSize: 14, color: "#c0bfbd", fontWeight: 400 }}>correct</span></span>
        </div>

        {/* The square */}
        <div style={{ fontSize: 72, fontWeight: 800, letterSpacing: -2, color: "#f0f0f0", fontFamily: "'JetBrains Mono','Courier New',monospace", lineHeight: 1 }}>
          {square}
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: 16, width: "100%" }}>
          <button
            onClick={() => answer(true)}
            style={{ flex: 1, padding: "20px 0", borderRadius: 10, border: "2px solid #eeeed2", background: "rgba(238,238,210,0.12)", color: "#eeeed2", fontSize: 18, fontWeight: 700, cursor: "pointer", transition: "all 0.1s ease" }}
          >
            Light <kbd style={{ fontSize: 11, opacity: 0.5, fontWeight: 400, marginLeft: 6 }}>L</kbd>
          </button>
          <button
            onClick={() => answer(false)}
            style={{ flex: 1, padding: "20px 0", borderRadius: 10, border: "2px solid #769656", background: "rgba(118,150,86,0.15)", color: "#96bc4b", fontSize: 18, fontWeight: 700, cursor: "pointer", transition: "all 0.1s ease" }}
          >
            Dark <kbd style={{ fontSize: 11, opacity: 0.5, fontWeight: 400, marginLeft: 6 }}>D</kbd>
          </button>
        </div>
      </Card>
    </PageWrap>
  );
}
