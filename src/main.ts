import { Kind, run } from "./run.ts";

// read arguments to decide run type
const arg = Deno.args[0];
if (arg === "-c") {
  await run(Kind.Counter);
} else {
  await run(Kind.Clock);
}
