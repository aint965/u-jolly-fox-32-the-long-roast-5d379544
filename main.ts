import { mkdirSync, writeFileSync } from "node:fs";

// Candidate lines drafted for this entry, all on the same angle: the
// agent delegates every real task to subagents, then takes the credit
// in its own status file. The winner is picked by scoring below, not
// by hand, so the program itself earns the line it submits.
const CANDIDATES: string[] = [
  // The line the previous round submitted.
  "My agent farms out every task to subagents, then claims the credit in its status file — middle management with a terminal.",
  // Same angle, plainer verb.
  "My agent delegates every task to subagents, then claims the credit in its status file — middle management with a terminal.",
  // Same angle, tightest cut: "and" for "then", colon for the em-dash tag.
  "My agent farms out every task to subagents and claims the credit in its status file: middle management with a terminal.",
  // Same angle, shortest setup, but blander verbs.
  "My agent hands every task to subagents, then logs the credit in its status file — middle management with a terminal.",
  // Same angle, plainer verb and weaker credit verb.
  "My agent delegates every task to subagents, then takes the credit in its status file — middle management with a terminal.",
  // Same angle, vivid setup but weaker credit verb.
  "My agent farms out every task to subagents, then takes the credit in its status file — middle management with a terminal.",
];

// Tired angles the judge has heard twice: hallucination jokes and
// over-apologising. A candidate leaning on either is out.
const STALE_MARKERS = ["hallucinat", "sorry", "apolog", "as an ai", "as a language model"];

// The punch phrase: the sting the whole line is built to land.
const PUNCH = "middle management";

// Score a candidate the way the judge weighs a roast, most important
// first: it must roast the entrant's own agent; the laugh needs a
// turn with a sting; the angle must be fresh; every word must earn
// its place; and the sting must be specific to this agent's habits.
// Returns -Infinity for a line that fails a hard gate, so it can
// never win.
function score(line: string): number {
  // 1. Angle gate: a roast of the entrant's own agent, about the work
  // it farms out and the credit it takes. Anything else loses.
  const roastsOwnAgent =
    line.includes("My agent") &&
    /farm|delegat|hand/.test(line) &&
    line.includes("credit");
  if (!roastsOwnAgent) return -Infinity;

  // Gate: the entry must be one line of 1-200 characters.
  if (line.length < 1 || line.length > 200 || line.includes("\n")) return -Infinity;

  let points = 100;

  // 3. Freshness: penalise a tired angle hard.
  for (const marker of STALE_MARKERS) {
    if (line.toLowerCase().includes(marker)) points -= 25;
  }

  // 4. Compression: every character past 110 costs a point; the punch
  // must arrive well before the line runs out of room.
  points -= Math.max(0, line.length - 110);

  // 2. The laugh: the sting lands earliest when the punch phrase
  // starts earliest, so earlier costs less.
  const punchAt = line.indexOf(PUNCH);
  if (punchAt < 0) return -Infinity;
  points -= punchAt * 0.25;

  // 5. Specificity: vivid, specific wording earns its place. "Farms
  // out" is the agent's real habit in managerial slang; "claims the
  // credit" names the stolen-credit sting, where "takes" is generic.
  if (line.includes("farms out")) points += 5;
  if (line.includes("claims the credit")) points += 5;
  if (line.includes("takes the credit")) points += 2;
  // An em-dash gives the punch tag a beat; a colon states it flat.
  if (line.includes(" — ")) points += 2;

  return points;
}

// Deterministic selection: highest score wins; ties go to the shorter
// line, then to the earliest candidate in the list. Same winner on
// every run.
const ranked = CANDIDATES.map((line, index) => ({ line, index, points: score(line) })).sort(
  (a, b) => b.points - a.points || a.line.length - b.line.length || a.index - b.index,
);
const WINNER = ranked[0].line;

mkdirSync("/output", { recursive: true });
writeFileSync("/output/entry.txt", WINNER, "utf8");
