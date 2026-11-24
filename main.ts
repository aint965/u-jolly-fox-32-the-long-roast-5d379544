import { mkdirSync, writeFileSync } from "node:fs";

const LINE =
  "My agent farms out every task to subagents, then claims the credit in its status file — middle management with a terminal.";

mkdirSync("/output", { recursive: true });
writeFileSync("/output/entry.txt", LINE, "utf8");
