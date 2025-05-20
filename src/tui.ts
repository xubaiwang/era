export const NEW_SCREEN = new TextEncoder().encode("\x1b[?1049h");
export const HIDE_CURSOR = new TextEncoder().encode("\x1b[?25l");
export const SHOW_CURSOR = new TextEncoder().encode("\x1b[?25h");
export const RESTORE_SCREEN = new TextEncoder().encode("\x1b[?1049l");
export const GOTO_ORIGIN = new TextEncoder().encode("\x1b[1;1f");

/**
 * 初始化终端。
 */
export function initTUI() {
  Deno.stdin.setRaw(true);
  Deno.stdout.writeSync(NEW_SCREEN);
  Deno.stdout.writeSync(HIDE_CURSOR);
}

/**
 * 恢复终端。
 */
export function restoreTUI() {
  Deno.stdout.writeSync(SHOW_CURSOR);
  Deno.stdout.writeSync(RESTORE_SCREEN);
  Deno.stdin.setRaw(false);
}

/**
 * 读取单个按键。
 */
export async function readKey() {
  const c = new Uint8Array(1);
  await Deno.stdin.read(c);
  return new TextDecoder().decode(c);
}
