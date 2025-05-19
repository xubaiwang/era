/**
 * @file 主要界面逻辑定义。
 */

import {
  config_example,
  CONFIG_PATH,
  get_config,
  make_config,
} from "./config.ts";
import {
  call_rain,
  concat_nums,
  generate_string_array,
  make_time,
  make_UTCtime,
} from "./time.ts";

export enum Kind {
  Clock,
  Counter,
}

// If the result of subtraction is lesser than 0, then returns 0, otherwise
// return the result.
const saturating_sub = (lhs: number, rhs: number): number => {
  if (lhs - rhs < 0) {
    return 0;
  } else {
    return lhs - rhs;
  }
};

const TIME_WIDTH = 39;
const TIME_HEIGHT = 5;

const NEW_SCREEN = new TextEncoder().encode("\x1b[?1049h");
const HIDE_CURSOR = new TextEncoder().encode("\x1b[?25l");
const SHOW_CURSOR = new TextEncoder().encode("\x1b[?25h");
const RESTORE_SCREEN = new TextEncoder().encode("\x1b[?1049l");
const GOTO_ORIGIN = new TextEncoder().encode("\x1b[1;1f");

/** 运行程序。 */
export const run = async (kind: Kind) => {
  // 起始时间点
  const start = new Date().getTime();
  // 加载现有配置或新建配置
  const config = await get_config(CONFIG_PATH).catch(async (_) => {
    await make_config();
    return config_example;
  });

  // 时间数字渲染起始点
  const timer_point = (rows: number, columns: number) => {
    const start_x = Math.floor(saturating_sub(columns, TIME_WIDTH) / 2) + 1;
    const start_y = Math.floor(saturating_sub(rows, TIME_HEIGHT) / 2) + 1;

    return { start_x, start_y };
  };

  let { columns, rows } = Deno.consoleSize();
  let { start_x, start_y } = timer_point(rows, columns);

  let rain: string[] = [];

  // 渲染函数
  const render = () => {
    const txt = (() => {
      // 分时钟和计时器
      if (kind === Kind.Clock) {
        return generate_string_array(concat_nums(make_time(new Date())));
      } else {
        const now = new Date().getTime();
        const diff = new Date(now - start);
        return generate_string_array(concat_nums(make_UTCtime(diff)));
      }
    })();

    rain = call_rain(rain, columns, rows, config);

    // 从原点绘制雨滴
    Deno.stdout.writeSync(GOTO_ORIGIN); //Go to home position
    for (let i = 1; i < rows; i++) {
      if (i >= start_y && i < start_y + TIME_HEIGHT) {
        const s = (" ".repeat(saturating_sub(start_x, 1)) + txt[i - start_y])
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

  // 进入副屏
  Deno.stdin.setRaw(true); //Enter raw mode
  Deno.stdout.writeSync(NEW_SCREEN); //Enter new screen
  Deno.stdout.writeSync(HIDE_CURSOR); //Hide cursor

  // 自动适应窗口大小
  if (Deno.build.os !== "windows") {
    Deno.addSignalListener("SIGWINCH", () => {
      const old_rows = rows;

      ({ columns, rows } = Deno.consoleSize());
      ({ start_x, start_y } = timer_point(rows, columns));

      // Fall new rain to keep previous raindrops surrounded the timer text.
      const n = Math.floor(saturating_sub(rows, old_rows) / 2);
      [...Array(n)].forEach((_) => {
        rain = call_rain(rain, columns, rows, config);
      });

      // 大小变更时重新绘制
      render();
    });
  }

  // 定时重新绘制
  const interval_rainID = setInterval(render, config.interval);

  // 读取任意按键，清理退出
  const c = new Uint8Array(1);
  await Deno.stdin.read(c);
  clearInterval(interval_rainID);
  Deno.stdout.writeSync(SHOW_CURSOR); //Show cursor
  Deno.stdout.writeSync(RESTORE_SCREEN); //Restore main screen
  Deno.stdin.setRaw(false); //Exit raw mode
  return;
};
