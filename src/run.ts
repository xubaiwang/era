/**
 * @file 主要界面逻辑定义。
 */

import { saturatingSub } from "./utils.ts";
import { Config, getConfigOrDefault } from "./config.ts";
import {
  concatDigits,
  generateTimeDisplayRows,
  makeUTCTime,
  timeToDigits,
  updateRainRows,
} from "./time.ts";
import { GOTO_ORIGIN, initTUI, readKey, restoreTUI } from "./tui.ts";

export enum Kind {
  Clock,
  Stopwatch,
  Timeout,
}

const TIME_WIDTH = 39;
const TIME_HEIGHT = 5;

/** 运行程序。 */
export async function run(kind: Kind) {
  /* 配置 */
  const config = await getConfigOrDefault();

  /* 环境 */
  const origin = new Date().getTime(); // 起始时间点

  /* 状态 */
  const size = Deno.consoleSize(); // 命令行
  const position = calculateTimeDisplayPosition(size); // 时间显示位置
  const rainRows: string[] = []; // 下雨状态
  const state = { size, position, rainRows, notified: false };

  // 初始化 TUI
  initTUI();

  // 自动适应窗口大小
  listenAutoResize(state, config);

  // 定时重新绘制
  const rainIntervalId = setInterval(
    () => render(kind, origin, state, config),
    config.interval,
  );

  // 读取任意按键，清理退出
  await readKey();
  clearInterval(rainIntervalId);
  restoreTUI();
  return;
}

type State = {
  size: ReturnType<typeof Deno.consoleSize>;
  position: { x: number; y: number };
  rainRows: string[];
  notified: boolean;
};

/**
 * 计算时间显示区位置
 */
function calculateTimeDisplayPosition(
  { rows, columns }: ReturnType<typeof Deno.consoleSize>,
) {
  const x = Math.floor(saturatingSub(columns, TIME_WIDTH) / 2) + 1;
  const y = Math.floor(saturatingSub(rows, TIME_HEIGHT) / 2) + 1;

  return { x, y };
}

function render(
  kind: Kind,
  origin: number,
  state: State,
  config: Config,
) {
  const txt = (() => {
    // 分时钟和计时器
    switch (kind) {
      case Kind.Clock:
        return generateTimeDisplayRows(concatDigits(timeToDigits(new Date())));
      case Kind.Stopwatch: {
        const now = new Date().getTime();
        const diff = new Date(now - origin);
        return generateTimeDisplayRows(concatDigits(makeUTCTime(diff)));
      }
      case Kind.Timeout: {
        // XXX: should not read here
        const minutes = parseInt(Deno.args[1]);
        const now = new Date().getTime();
        const target = origin + minutes * 60 * 1000;
        const diff = saturatingSub(target, now);
        if (diff == 0 && !state.notified) {
          new Deno.Command("notify-send", { args: ["时迄"] }).spawn();
          state.notified = true;
        }
        return generateTimeDisplayRows(
          concatDigits(makeUTCTime(new Date(diff))),
        );
      }
    }
  })();

  updateRainRows(state.rainRows, state.size, config);

  // 从原点绘制雨滴
  Deno.stdout.writeSync(GOTO_ORIGIN);
  for (let i = 1; i < state.size.rows; i++) {
    // 排除时间显示区域
    if (i >= state.position.y && i < state.position.y + TIME_HEIGHT) {
      const s = (" ".repeat(saturatingSub(state.position.x, 1)) +
        txt[i - state.position.y])
        .padEnd(state.size.columns, " ")
        .slice(0, state.size.columns);
      console.log("%c" + s, "color: " + config.timecolor);
    } else if (i < state.rainRows.length) {
      const s = state.rainRows[i]
        .padEnd(state.size.columns, " ")
        .slice(0, state.size.columns);
      console.log("%c" + s, "color: " + config.raincolor);
    } else {
      console.log();
    }
  }
}

function listenAutoResize(
  state: State,
  config: Config,
) {
  if (Deno.build.os !== "windows") {
    Deno.addSignalListener("SIGWINCH", () => {
      const size = Deno.consoleSize();
      state.size = size;
      state.position = calculateTimeDisplayPosition(size);
      updateRainRows(state.rainRows, size, config);
    });
  }
}
