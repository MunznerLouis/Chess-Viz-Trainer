const KEY = "chess_benchmark_scores";

export function toRating(accuracy, timeMs, maxMs = 30000) {
  const speed = Math.max(0, 1 - timeMs / maxMs);
  return Math.round(Math.max(400, Math.min(2800, 400 + (accuracy * 0.65 + speed * 0.35) * 2400)));
}

export function toSprintRating(correct, benchmark = 50) {
  return Math.round(Math.max(400, Math.min(2800, 400 + (correct / benchmark) * 2400)));
}

export function saveScore(id, rating) {
  const all = getAll();
  const isNewBest = !all[id] || rating > all[id].rating;
  if (isNewBest) {
    all[id] = { rating, date: Date.now() };
    localStorage.setItem(KEY, JSON.stringify(all));
  }
  return isNewBest;
}

export function getScore(id) {
  return getAll()[id] || null;
}

export function getAll() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {}; }
  catch { return {}; }
}

export function composite() {
  const vals = Object.values(getAll()).map((s) => s.rating);
  return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : null;
}

export function label(r) {
  if (r >= 2500) return "Grandmaster";
  if (r >= 2300) return "Master";
  if (r >= 2000) return "Expert";
  if (r >= 1800) return "Class A";
  if (r >= 1500) return "Club Player";
  if (r >= 1200) return "Casual";
  if (r >= 900)  return "Beginner";
  return "Novice";
}

export function ratingColor(r) {
  if (r >= 2500) return "#ffd700";
  if (r >= 2300) return "#c0a060";
  if (r >= 2000) return "#e06060";
  if (r >= 1800) return "#e07030";
  if (r >= 1500) return "#81b64c";
  if (r >= 1200) return "#5dadec";
  return "#888";
}
