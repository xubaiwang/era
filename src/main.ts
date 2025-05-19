import { Kind, run } from "./run.ts";

switch (Deno.args[0]) {
  case "-s":
    await run(Kind.Stopwatch);
    break;
  case undefined:
  case "-c":
    await run(Kind.Clock);
    break;
  default:
    console.error(`unknown option ${Deno.args[0]}, expected -c or -s`);
}
