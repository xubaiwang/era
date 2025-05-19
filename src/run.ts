/**
 * @file 主要界面逻辑定义。
 */

import { saturatingSub } from "./utils.ts";
import { getConfigOrDefault } from "./config.ts";
import {
  callRain,
  concatNums,
  generateStringArray,
  makeTime,
  makeUTCTime,
} from "./time.ts";
import { GOTO_ORIGIN, initTUI, readKey, restoreTUI } from "./tui.ts";

export enum Kind {
  Clock,
  Stopwatch,
}

const TIME_WIDTH = 39;
const TIME_HEIGHT = 5;

/** 运行程序。 */
export async function run(kind: Kind) {
  // 起始时间点
  const start = new Date().getTime();
  // 加载现有配置或新建配置
  const config = await getConfigOrDefault();

  // 时间数字渲染起始点
  const timerPoint = (rows: number, columns: number) => {
    const startX = Math.floor(saturatingSub(columns, TIME_WIDTH) / 2) + 1;
    const startY = Math.floor(saturatingSub(rows, TIME_HEIGHT) / 2) + 1;

    return { startX, startY };
  };

  let { columns, rows } = Deno.consoleSize();
  let { startX, startY } = timerPoint(rows, columns);

  let rain: string[] = [];

  // 渲染函数
  const render = () => {
    const txt = (() => {
      // 分时钟和计时器
      if (kind === Kind.Clock) {
        return generateStringArray(concatNums(makeTime(new Date())));
      } else {
        const now = new Date().getTime();
        const diff = new Date(now - start);
        return generateStringArray(concatNums(makeUTCTime(diff)));
      }
    })();

    rain = callRain(rain, columns, rows, config);

    // 从原点绘制雨滴
    Deno.stdout.writeSync(GOTO_ORIGIN); //Go to home position
    for (let i = 1; i < rows; i++) {
      if (i >= startY && i < startY + TIME_HEIGHT) {
        const s = (" ".repeat(saturatingSub(startX, 1)) + txt[i - startY])
          .padEnd(columns, " ")
          .slice(0, columns);
        console.log("%c" + s, "color: " + config.timecolor);
      } else if (i < rain.length) {
        const s = rain[i]
          .padEnd(columns, " ")
          .slice(0, columns);
        console.log("%c" + s, "color: " + config.raincolor);
      } else {
        console.log();
      }
    }
  };

  initTUI();

  // 自动适应窗口大小
  if (Deno.build.os !== "windows") {
    Deno.addSignalListener("SIGWINCH", () => {
      const old_rows = rows;

      ({ columns, rows } = Deno.consoleSize());
      ({ startX, startY } = timerPoint(rows, columns));

      // Fall new rain to keep previous raindrops surrounded the timer text.
      const n = Math.floor(saturatingSub(rows, old_rows) / 2);
      [...Array(n)].forEach((_) => {
        rain = callRain(rain, columns, rows, config);
      });

      // 大小变更时重新绘制
      render();
    });
  }

  // 定时重新绘制
  const intervalRainID = setInterval(render, config.interval);

  // 读取任意按键，清理退出
  await readKey();
  clearInterval(intervalRainID);
  restoreTUI();
  return;
}
