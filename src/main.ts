import { Kind, run } from "./run.ts";

// read arguments to decide run type
const arg = Deno.args[0];
if (arg === "-s") {
  await run(Kind.Stopwatch);
} else {
  await run(Kind.Clock);
}
