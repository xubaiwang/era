/**
 * @file 时间转换点阵格式。
 */

import * as nums from "./nums.ts";
import { Config } from "./config.ts";

const ATOM1 = "█";
const ATOM2 = "■";

/**
 * 生成时间显示区各行。
 * @param glyphsData - 显示区字符表示
 */
export function generateTimeDisplayRows(glyphsData: number[][]): string[] {
  const result: string[] = [];
  glyphsData.forEach((nums) => {
    let line = "";
    nums.forEach((num) => {
      switch (num) {
        case 1:
          line += ATOM1;
          break;
        case 2:
          line += ATOM2;
          break;
        default:
          line += " ";
      }
    });
    result.push(line);
  });
  return result;
}

/**
 * 拼接数字（时、分、秒）。
 */
export function concatDigits([
  num1,
  num2,
  num3,
  num4,
  num5,
  num6,
]: number[][][]): number[][] {
  const result: number[][] = [];
  for (let i = 0; i < 5; i++) {
    const first = [...num1[i], 0];
    const third = [...num3[i], 0];
    const fifth = [...num5[i], 0];
    const line = first.concat(
      num2[i],
      nums.COLON[i],
      third,
      num4[i],
      nums.COLON[i],
      fifth,
      num6[i],
    );
    result.push(line);
  }
  return result;
}

/**
 * 时间转为位点阵。
 */
export function timeToDigits(d: Date): number[][][] {
  const hour = d.getHours();
  const min = d.getMinutes();
  const sec = d.getSeconds();
  // 各位数字
  const first = Math.floor(hour / 10);
  const second = hour - first * 10;
  const third = Math.floor(min / 10);
  const fourth = min - third * 10;
  const fifth = Math.floor(sec / 10);
  const sixth = sec - fifth * 10;
  return [first, second, third, fourth, fifth, sixth].map((item) =>
    digitToGlyph(item)
  );
}

export function makeUTCTime(d: Date): number[][][] {
  const hour = d.getUTCHours();
  const min = d.getUTCMinutes();
  const sec = d.getUTCSeconds();
  const first = Math.floor(hour / 10);
  const second = hour - first * 10;
  const third = Math.floor(min / 10);
  const fourth = min - third * 10;
  const fifth = Math.floor(sec / 10);
  const sixth = sec - fifth * 10;
  return [first, second, third, fourth, fifth, sixth].map((item) =>
    digitToGlyph(item)
  );
}

export function makeTimeout(d: Date): number[][][] {
  return [];
}

/**
 * 位转换点阵。
 */
function digitToGlyph(num: number): number[][] {
  switch (num) {
    case 1:
      return nums.ONE;
    case 2:
      return nums.TWO;
    case 3:
      return nums.THREE;
    case 4:
      return nums.FOUR;
    case 5:
      return nums.FIVE;
    case 6:
      return nums.SIX;
    case 7:
      return nums.SEVEN;
    case 8:
      return nums.EIGHT;
    case 9:
      return nums.NINE;
    default:
      return nums.ZERO;
  }
}

/**
 * 更新下雨状态。
 * @param rainRows - 原处更新雨滴数组
 */
export function updateRainRows(
  rainRows: string[],
  { rows, columns }: ReturnType<typeof Deno.consoleSize>,
  config: Config,
) {
  // 消除超出雨滴
  rainRows.splice(rows);
  // 在顶部新行内随机创建雨滴
  let newRainRow = "";
  for (let i = 0; i < columns; i++) {
    newRainRow += makeDrop(getRandomInt(config.frequency), config);
  }
  // 拼入新行
  rainRows.unshift(newRainRow);
}

/**
 * 随机整数。
 */
function getRandomInt(max: number): number {
  return Math.floor(Math.random() * max);
}

/**
 * 创建雨滴。
 */
function makeDrop(rand: number, config: Config): string {
  switch (rand) {
    case 0:
      return config.rain1;
    case 1:
      return config.rain2;
    default:
      return " ";
  }
}
