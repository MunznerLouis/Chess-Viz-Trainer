import { useState, useCallback, useRef, useEffect } from "react";
import { Chess } from "chess.js";

// Import shared assets — we re-declare svgPieces here to keep Sandbox self-contained
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

const svgPieces = {};
for (const c of ["w", "b"]) {
  for (const t of ["K", "Q", "R", "B", "N", "P"]) {
    svgPieces[c + t] = `data:image/svg+xml,${encodeURIComponent(pieceSVGData[c + t])}`;
  }
}

const COLS = "abcdefgh";
const ROWS = "12345678";

const LS = "#eeeed2";
const DS = "#769656";
const BG = "#262522";
const CARD = "#302e2b";
const CARD_BORDER = "#3d3a37";
const TEXT = "#c0bfbd";
const TEXT_BRIGHT = "#f0f0f0";
const ACCENT = "#81b64c";
const DANGER = "#e84040";
const MOVE_DOT = "rgba(0,0,0,0.25)";
const LAST_MOVE_LIGHT = "#f5f682";
const LAST_MOVE_DARK = "#b9ca43";
const SELECTED_LIGHT = "#f6f669";
const SELECTED_DARK = "#baca2b";
const CHECK_BG = "radial-gradient(ellipse at center, rgba(255,0,0,0.6) 0%, rgba(255,0,0,0.2) 40%, transparent 68%)";

// chess.js uses 'w'/'b' and lowercase piece types
const toKey = (color, type) => (color === "w" ? "w" : "b") + type.toUpperCase();

function Sandbox({ onBack }) {
  const [mode, setMode] = useState("setup"); // setup | play
  const [game, setGame] = useState(null);
  const [selected, setSelected] = useState(null);
  const [legalMoves, setLegalMoves] = useState([]);
  const [lastMove, setLastMove] = useState(null);
  const [flipped, setFlipped] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyIdx, setHistoryIdx] = useState(0);
  const [promoSquare, setPromoSquare] = useState(null);
  const [promoFrom, setPromoFrom] = useState(null);
  const [dragPiece, setDragPiece] = useState(null);
  const [dragPos, setDragPos] = useState(null);
  const [dragFromSq, setDragFromSq] = useState(null);
  const [moveList, setMoveList] = useState([]);

  // Setup mode state — pre-loaded with starting position
  const [setupBoard, setSetupBoard] = useState(() => {
    const g = new Chess();
    const board = g.board();
    const map = {};
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        if (p) map[p.square] = toKey(p.color, p.type);
      }
    }
    return map;
  });
  const [setupBrush, setSetupBrush] = useState(null); // e.g. "wK", "bP", null for eraser
  const [setupTurn, setSetupTurn] = useState("w");

  const boardRef = useRef(null);

  const startFromPosition = useCallback((fen) => {
    const g = new Chess(fen);
    setGame(g);
    setSelected(null);
    setLegalMoves([]);
    setLastMove(null);
    setHistory([fen]);
    setHistoryIdx(0);
    setPromoSquare(null);
    setMoveList([]);
    setMode("play");
  }, []);

  const setupToFen = useCallback(() => {
    let fen = "";
    for (let r = 7; r >= 0; r--) {
      let empty = 0;
      for (let c = 0; c < 8; c++) {
        const sq = COLS[c] + ROWS[r];
        const p = setupBoard[sq];
        if (p) {
          if (empty > 0) { fen += empty; empty = 0; }
          const letter = p[1].toLowerCase();
          fen += p[0] === "w" ? letter.toUpperCase() : letter;
        } else {
          empty++;
        }
      }
      if (empty > 0) fen += empty;
      if (r > 0) fen += "/";
    }
    fen += ` ${setupTurn} KQkq - 0 1`;
    return fen;
  }, [setupBoard, setupTurn]);

  const tryStartFromSetup = useCallback(() => {
    const fen = setupToFen();
    try {
      const g = new Chess(fen);
      startFromPosition(fen);
    } catch {
      // invalid position — try with relaxed castling
      try {
        const relaxed = fen.replace("KQkq", "-");
        const g = new Chess(relaxed);
        startFromPosition(relaxed);
      } catch (e2) {
        alert("Invalid position. Make sure both kings are on the board.");
      }
    }
  }, [setupToFen, startFromPosition]);

  // Make a move
  const makeMove = useCallback((from, to, promotion) => {
    if (!game) return false;
    const g = new Chess(game.fen());
    const move = g.move({ from, to, promotion });
    if (!move) return false;
    setGame(g);
    setSelected(null);
    setLegalMoves([]);
    setLastMove({ from: move.from, to: move.to });
    const newHist = [...history.slice(0, historyIdx + 1), g.fen()];
    setHistory(newHist);
    setHistoryIdx(newHist.length - 1);
    setMoveList((prev) => [...prev.slice(0, historyIdx), { san: move.san, color: move.color }]);
    return true;
  }, [game, history, historyIdx, moveList]);

  // Handle clicking a square in play mode
  const handleSquareClick = useCallback((sq) => {
    if (!game || promoSquare) return;

    const piece = game.get(sq);

    // Clicking the selected square deselects it
    if (selected === sq) {
      setSelected(null);
      setLegalMoves([]);
      return;
    }

    // If a piece is already selected
    if (selected) {
      // Check if this is a promotion move
      const moves = game.moves({ square: selected, verbose: true });
      const promoMove = moves.find(m => m.to === sq && m.promotion);
      if (promoMove) {
        setPromoSquare(sq);
        setPromoFrom(selected);
        return;
      }

      // Try to make the move
      if (makeMove(selected, sq)) return;

      // If clicking own piece (either color since user controls both), select it
      if (piece) {
        setSelected(sq);
        setLegalMoves(game.moves({ square: sq, verbose: true }).map(m => m.to));
        return;
      }

      // Deselect
      setSelected(null);
      setLegalMoves([]);
      return;
    }

    // Select a piece (allow selecting any piece — user controls both sides)
    // But only if it's that color's turn. To allow moving either side,
    // we check if this piece has legal moves
    if (piece) {
      const moves = game.moves({ square: sq, verbose: true });
      if (moves.length > 0) {
        setSelected(sq);
        setLegalMoves(moves.map(m => m.to));
      } else if (piece.color !== game.turn()) {
        // Not this color's turn — show a subtle hint
        setSelected(null);
        setLegalMoves([]);
      }
    }
  }, [game, selected, promoSquare, makeMove]);

  // Handle promotion choice
  const handlePromo = useCallback((type) => {
    if (promoFrom && promoSquare) {
      makeMove(promoFrom, promoSquare, type);
    }
    setPromoSquare(null);
    setPromoFrom(null);
  }, [promoFrom, promoSquare, makeMove]);

  // Undo
  const undo = useCallback(() => {
    if (historyIdx <= 0) return;
    const newIdx = historyIdx - 1;
    setHistoryIdx(newIdx);
    setGame(new Chess(history[newIdx]));
    setSelected(null);
    setLegalMoves([]);
    setLastMove(null);
  }, [historyIdx, history]);

  // Redo
  const redo = useCallback(() => {
    if (historyIdx >= history.length - 1) return;
    const newIdx = historyIdx + 1;
    setHistoryIdx(newIdx);
    setGame(new Chess(history[newIdx]));
    setSelected(null);
    setLegalMoves([]);
    setLastMove(null);
  }, [historyIdx, history]);

  // Reset
  const reset = useCallback(() => {
    if (history.length > 0) {
      const fen = history[0];
      setGame(new Chess(fen));
      setHistory([fen]);
      setHistoryIdx(0);
      setSelected(null);
      setLegalMoves([]);
      setLastMove(null);
      setMoveList([]);
    }
  }, [history]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if (mode !== "play") return;
      if (e.key === "ArrowLeft") { e.preventDefault(); undo(); }
      if (e.key === "ArrowRight") { e.preventDefault(); redo(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [mode, undo, redo]);

  // Drag and drop for play mode
  const handleDragStart = (e, sq) => {
    if (mode === "play" && game) {
      const piece = game.get(sq);
      if (!piece) return;
      const moves = game.moves({ square: sq, verbose: true });
      if (moves.length === 0) return;
      setDragFromSq(sq);
      setDragPiece(toKey(piece.color, piece.type));
      setSelected(sq);
      setLegalMoves(moves.map(m => m.to));
      // Hide the default drag image
      const img = new Image();
      img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
      e.dataTransfer.setDragImage(img, 0, 0);
    }
  };

  const handleDrag = (e) => {
    if (dragPiece && boardRef.current) {
      const rect = boardRef.current.getBoundingClientRect();
      setDragPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
  };

  const handleDragEnd = () => {
    setDragPiece(null);
    setDragPos(null);
    setDragFromSq(null);
    setSelected(null);
    setLegalMoves([]);
  };

  const handleDrop = (e, sq) => {
    e.preventDefault();
    if (mode === "play" && dragFromSq && dragFromSq !== sq) {
      // Check promotion
      if (game) {
        const moves = game.moves({ square: dragFromSq, verbose: true });
        const promoMove = moves.find(m => m.to === sq && m.promotion);
        if (promoMove) {
          setPromoSquare(sq);
          setPromoFrom(dragFromSq);
          handleDragEnd();
          return;
        }
      }
      makeMove(dragFromSq, sq);
    }
    handleDragEnd();
  };

  // Setup mode click
  const handleSetupClick = (sq) => {
    if (!setupBrush) {
      // Eraser
      setSetupBoard(prev => {
        const next = { ...prev };
        delete next[sq];
        return next;
      });
    } else {
      setSetupBoard(prev => ({ ...prev, [sq]: setupBrush }));
    }
  };

  // Setup drag from palette
  const handlePaletteDragStart = (e, pieceKey) => {
    e.dataTransfer.setData("text/plain", pieceKey);
    setDragPiece(pieceKey);
    const img = new Image();
    img.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
    e.dataTransfer.setDragImage(img, 0, 0);
  };

  const handleSetupDrop = (e, sq) => {
    e.preventDefault();
    const pieceKey = e.dataTransfer.getData("text/plain");
    if (pieceKey && svgPieces[pieceKey]) {
      setSetupBoard(prev => ({ ...prev, [sq]: pieceKey }));
    }
    handleDragEnd();
  };

  // Get the board squares for rendering
  const getBoard = () => {
    if (mode === "play" && game) {
      const board = game.board();
      const map = {};
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const p = board[r][c];
          if (p) {
            map[p.square] = toKey(p.color, p.type);
          }
        }
      }
      return map;
    }
    if (mode === "setup") return setupBoard;
    return {};
  };

  const boardMap = getBoard();
  const isCheck = mode === "play" && game && game.isCheck();
  const isCheckmate = mode === "play" && game && game.isCheckmate();
  const isDraw = mode === "play" && game && game.isDraw();
  const isStalemate = mode === "play" && game && game.isStalemate();
  const turn = game ? game.turn() : "w";

  // Find the king square if in check
  let checkSquare = null;
  if (isCheck && game) {
    const board = game.board();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        if (p && p.type === "k" && p.color === turn) {
          checkSquare = p.square;
        }
      }
    }
  }

  const renderBoard = () => (
    <div
      ref={boardRef}
      style={{
        position: "relative",
        width: "min(88vw,560px)",
        height: "min(88vw,560px)",
        borderRadius: 4,
        overflow: "hidden",
        boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
        border: "2px solid #555",
        userSelect: "none",
      }}
      onDragOver={(e) => { e.preventDefault(); handleDrag(e); }}
    >
      <div style={{ display: "grid", gridTemplateColumns: "repeat(8,1fr)", gridTemplateRows: "repeat(8,1fr)", width: "100%", height: "100%" }}>
        {Array.from({ length: 64 }, (_, i) => {
          const col = i % 8;
          const row = Math.floor(i / 8);
          const sq = COLS[col] + ROWS[row];
          const isDark = (col + row) % 2 === 1;
          const dR = flipped ? row : 7 - row;
          const dC = flipped ? 7 - col : col;

          // Base square color
          let bg = isDark ? DS : LS;

          // Last move highlight (lower priority)
          const isLastMove = lastMove && (lastMove.from === sq || lastMove.to === sq);
          if (isLastMove) bg = isDark ? LAST_MOVE_DARK : LAST_MOVE_LIGHT;

          // Selected piece highlight (higher priority)
          if (selected === sq) bg = isDark ? SELECTED_DARK : SELECTED_LIGHT;

          const isLegal = legalMoves.includes(sq);
          const hasPiece = !!boardMap[sq];
          const isCheckSq = checkSquare === sq;
          const isDragging = dragFromSq === sq && dragPiece;

          return (
            <div
              key={sq}
              style={{
                gridColumn: dC + 1,
                gridRow: dR + 1,
                background: bg,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                position: "relative",
                cursor: mode === "setup" ? "pointer" : (hasPiece ? "grab" : "default"),
              }}
              onClick={() => mode === "play" ? handleSquareClick(sq) : handleSetupClick(sq)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => mode === "play" ? handleDrop(e, sq) : handleSetupDrop(e, sq)}
            >
              {/* Check indicator */}
              {isCheckSq && (
                <div style={{
                  position: "absolute", inset: 0,
                  background: "radial-gradient(ellipse at center, rgba(255,0,0,0.55) 0%, rgba(200,0,0,0.2) 50%, transparent 70%)",
                }} />
              )}
              {/* Legal move indicator — dot for empty, ring for capture */}
              {isLegal && !hasPiece && (
                <div style={{
                  width: "28%", height: "28%", borderRadius: "50%",
                  background: MOVE_DOT, position: "absolute",
                }} />
              )}
              {isLegal && hasPiece && (
                <div style={{
                  width: "100%", height: "100%", position: "absolute",
                  borderRadius: "50%",
                  border: `5px solid ${MOVE_DOT}`,
                  boxSizing: "border-box",
                }} />
              )}
              {/* Piece */}
              {hasPiece && !isDragging && (
                <img
                  src={svgPieces[boardMap[sq]]}
                  alt={boardMap[sq]}
                  draggable
                  onDragStart={(e) => handleDragStart(e, sq)}
                  onDragEnd={handleDragEnd}
                  style={{
                    width: "85%", height: "85%",
                    filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.3))",
                    pointerEvents: "auto",
                    cursor: "grab",
                    position: "relative",
                    zIndex: 1,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
      {/* Floating drag piece */}
      {dragPiece && dragPos && (
        <img
          src={svgPieces[dragPiece]}
          alt=""
          style={{
            position: "absolute",
            left: dragPos.x - 35,
            top: dragPos.y - 35,
            width: 70, height: 70,
            pointerEvents: "none",
            filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.4))",
            zIndex: 100,
          }}
        />
      )}
      {/* Promotion dialog */}
      {promoSquare && (
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", justifyContent: "center", alignItems: "center",
          background: "rgba(0,0,0,0.5)", zIndex: 200,
        }}>
          <div style={{
            display: "flex", gap: 4, background: CARD, borderRadius: 10,
            padding: 8, boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
          }}>
            {["q", "r", "b", "n"].map(t => (
              <div
                key={t}
                onClick={() => handlePromo(t)}
                style={{
                  width: 60, height: 60, display: "flex", justifyContent: "center", alignItems: "center",
                  cursor: "pointer", borderRadius: 8, background: "rgba(255,255,255,0.05)",
                }}
              >
                <img src={svgPieces[turn + t.toUpperCase()]} alt={t} style={{ width: 48, height: 48 }} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // SETUP MODE
  if (mode === "setup") {
    const palette = [
      ["w", ["K", "Q", "R", "B", "N", "P"]],
      ["b", ["K", "Q", "R", "B", "N", "P"]],
    ];

    return (
      <div style={{
        minHeight: "100vh", background: BG, color: TEXT_BRIGHT,
        fontFamily: "'Segoe UI','Helvetica Neue',Arial,sans-serif",
        display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 16px 40px",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "min(88vw,560px)", marginBottom: 12 }}>
          <button onClick={() => onBack()} style={{ padding: "6px 14px", fontSize: 13, background: "none", border: "1px solid rgba(255,255,255,0.15)", color: TEXT, borderRadius: 8, cursor: "pointer" }}>
            Back
          </button>
          <span style={{ fontSize: 15, fontWeight: 700, color: TEXT }}>Build Position</span>
          <button onClick={() => setFlipped(f => !f)} style={{ padding: "6px 14px", fontSize: 13, background: "none", border: "1px solid rgba(255,255,255,0.15)", color: TEXT, borderRadius: 8, cursor: "pointer" }}>
            Flip
          </button>
        </div>

        {renderBoard()}

        {/* Piece palette */}
        <div style={{
          background: CARD, borderRadius: 12, padding: 16,
          border: `1px solid ${CARD_BORDER}`, boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
          width: "min(88vw,560px)", marginTop: 16,
        }}>
          <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: 2, color: TEXT, fontWeight: 600, marginBottom: 10 }}>
            Click a piece, then click squares to place
          </div>
          {palette.map(([color, types]) => (
            <div key={color} style={{ display: "flex", gap: 4, marginBottom: 6 }}>
              {types.map(t => {
                const key = color + t;
                const isActive = setupBrush === key;
                return (
                  <div
                    key={key}
                    draggable
                    onDragStart={(e) => handlePaletteDragStart(e, key)}
                    onDragEnd={handleDragEnd}
                    onClick={() => setSetupBrush(isActive ? null : key)}
                    style={{
                      width: 48, height: 48, display: "flex", justifyContent: "center", alignItems: "center",
                      borderRadius: 8, cursor: "pointer",
                      background: isActive ? "rgba(129,182,76,0.2)" : "rgba(255,255,255,0.04)",
                      border: isActive ? `2px solid ${ACCENT}` : "2px solid transparent",
                      transition: "all 0.1s ease",
                    }}
                  >
                    <img src={svgPieces[key]} alt={key} style={{ width: 36, height: 36 }} />
                  </div>
                );
              })}
              {color === "w" && (
                <div
                  onClick={() => setSetupBrush(null)}
                  style={{
                    width: 48, height: 48, display: "flex", justifyContent: "center", alignItems: "center",
                    borderRadius: 8, cursor: "pointer",
                    background: setupBrush === null ? "rgba(232,64,64,0.2)" : "rgba(255,255,255,0.04)",
                    border: setupBrush === null ? `2px solid ${DANGER}` : "2px solid transparent",
                    fontSize: 20, color: DANGER, fontWeight: 700,
                  }}
                >
                  x
                </div>
              )}
            </div>
          ))}

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12 }}>
            <span style={{ fontSize: 13, color: TEXT }}>Turn:</span>
            {["w", "b"].map(c => (
              <button
                key={c}
                onClick={() => setSetupTurn(c)}
                style={{
                  padding: "5px 14px", borderRadius: 6, cursor: "pointer", fontSize: 13, fontWeight: 600,
                  background: setupTurn === c ? "rgba(129,182,76,0.15)" : "rgba(255,255,255,0.04)",
                  border: setupTurn === c ? `1px solid ${ACCENT}` : "1px solid transparent",
                  color: TEXT_BRIGHT,
                }}
              >
                {c === "w" ? "White" : "Black"}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
            <button
              onClick={() => {
                // Load starting position into setup
                const g = new Chess();
                const board = g.board();
                const map = {};
                for (let r = 0; r < 8; r++) {
                  for (let c = 0; c < 8; c++) {
                    const p = board[r][c];
                    if (p) map[p.square] = toKey(p.color, p.type);
                  }
                }
                setSetupBoard(map);
              }}
              style={{
                flex: 1, padding: 10, borderRadius: 8, cursor: "pointer", fontSize: 13,
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: TEXT,
              }}
            >
              Load Starting Pos
            </button>
            <button
              onClick={() => setSetupBoard({})}
              style={{
                flex: 1, padding: 10, borderRadius: 8, cursor: "pointer", fontSize: 13,
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: TEXT,
              }}
            >
              Clear Board
            </button>
          </div>

          <button
            onClick={tryStartFromSetup}
            style={{
              width: "100%", padding: 12, borderRadius: 8, border: "none", cursor: "pointer",
              background: ACCENT, color: "#1a1a1a", fontSize: 15, fontWeight: 700, marginTop: 10,
            }}
          >
            Play
          </button>
        </div>
      </div>
    );
  }

  // PLAY MODE
  const status = isCheckmate
    ? `Checkmate — ${turn === "w" ? "Black" : "White"} wins`
    : isStalemate
    ? "Stalemate — Draw"
    : isDraw
    ? "Draw"
    : isCheck
    ? `${turn === "w" ? "White" : "Black"} is in check`
    : `${turn === "w" ? "White" : "Black"} to move`;

  return (
    <div style={{
      minHeight: "100vh", background: BG, color: TEXT_BRIGHT,
      fontFamily: "'Segoe UI','Helvetica Neue',Arial,sans-serif",
      display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 16px 40px",
    }}>
      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "min(88vw,560px)", marginBottom: 12 }}>
        <button onClick={() => onBack()} style={{ padding: "6px 14px", fontSize: 13, background: "none", border: "1px solid rgba(255,255,255,0.15)", color: TEXT, borderRadius: 8, cursor: "pointer" }}>
          Back
        </button>
        <span style={{
          fontSize: 14, fontWeight: 600, padding: "4px 12px", borderRadius: 20,
          background: isCheckmate || isDraw ? "rgba(232,64,64,0.15)" : isCheck ? "rgba(255,155,59,0.15)" : "rgba(255,255,255,0.06)",
          color: isCheckmate || isDraw ? DANGER : isCheck ? "#ff9b3b" : TEXT,
        }}>
          {status}
        </span>
        <button onClick={() => setFlipped(f => !f)} style={{ padding: "6px 14px", fontSize: 13, background: "none", border: "1px solid rgba(255,255,255,0.15)", color: TEXT, borderRadius: 8, cursor: "pointer" }}>
          Flip
        </button>
      </div>

      <div style={{ display: "flex", gap: 16, alignItems: "flex-start", justifyContent: "center", flexWrap: "wrap" }}>
        {renderBoard()}
        {/* Move feed */}
        <div style={{
          background: CARD, border: `1px solid ${CARD_BORDER}`, borderRadius: 8,
          width: 180, maxHeight: "min(88vw,560px)", overflowY: "auto",
          padding: "8px 0", flexShrink: 0,
        }}>
          <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1, color: TEXT, padding: "0 10px 6px", fontWeight: 600, opacity: 0.6 }}>
            Moves
          </div>
          {(() => {
            const displayed = moveList.slice(0, historyIdx);
            const pairs = [];
            for (let i = 0; i < displayed.length; i += 2) {
              pairs.push({ num: Math.floor(i / 2) + 1, white: displayed[i], black: displayed[i + 1] });
            }
            return pairs.length > 0 ? pairs.map(({ num, white, black }) => (
              <div key={num} style={{ display: "flex", gap: 4, padding: "3px 10px", fontSize: 12, fontFamily: "'JetBrains Mono',monospace" }}>
                <span style={{ color: TEXT, opacity: 0.4, minWidth: 18 }}>{num}.</span>
                <span style={{ color: TEXT_BRIGHT, flex: 1 }}>{white?.san || ""}</span>
                <span style={{ color: TEXT_BRIGHT, flex: 1 }}>{black?.san || ""}</span>
              </div>
            )) : (
              <div style={{ padding: "8px 10px", fontSize: 12, color: TEXT, opacity: 0.4 }}>No moves yet</div>
            );
          })()}
        </div>
      </div>

      {/* Controls */}
      <div style={{
        display: "flex", gap: 8, marginTop: 16, width: "min(88vw,560px)",
      }}>
        <button onClick={undo} disabled={historyIdx <= 0} style={{
          flex: 1, padding: 10, borderRadius: 8, cursor: historyIdx <= 0 ? "default" : "pointer",
          background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
          color: TEXT, fontSize: 14, fontWeight: 600, opacity: historyIdx <= 0 ? 0.3 : 1,
        }}>
          Undo
        </button>
        <button onClick={redo} disabled={historyIdx >= history.length - 1} style={{
          flex: 1, padding: 10, borderRadius: 8, cursor: historyIdx >= history.length - 1 ? "default" : "pointer",
          background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
          color: TEXT, fontSize: 14, fontWeight: 600, opacity: historyIdx >= history.length - 1 ? 0.3 : 1,
        }}>
          Redo
        </button>
        <button onClick={reset} style={{
          flex: 1, padding: 10, borderRadius: 8, cursor: "pointer",
          background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
          color: TEXT, fontSize: 14, fontWeight: 600,
        }}>
          Reset
        </button>
      </div>

      {/* Move counter */}
      <div style={{ marginTop: 10, fontSize: 12, color: TEXT, opacity: 0.6 }}>
        Move {Math.ceil(historyIdx / 2)} — Arrow keys to navigate
      </div>
    </div>
  );
}

export default Sandbox;
