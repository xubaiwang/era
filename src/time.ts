/**
 * @file 时间转换点阵格式。
 */

import * as nums from "./nums.ts";
import { Config } from "./config.ts";

const ATOM1 = "█";
const ATOM2 = "■";

/**
 * 生成数字列表。
 */
export function generateStringArray(num: number[][]): string[] {
  const result: string[] = [];
  num.forEach((nums) => {
    let line = "";
    nums.forEach((num) => {
      if (num == 1) {
        line = line + ATOM1;
      } else if (num == 2) {
        line = line + ATOM2;
      } else {
        line = line + " ";
      }
    });
    result.push(line);
  });
  return result;
}

/**
 * 拼接数字（时、分、秒）。
 */
export function concatNums([
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
export function makeTime(d: Date): number[][][] {
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
    numToArrays(item)
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
    numToArrays(item)
  );
}

/**
 * 位转换点阵。
 */
function numToArrays(num: number): number[][] {
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
 * 调用下雨。
 */
export function callRain(
  rain: string[],
  column: number,
  row: number,
  config: Config,
): string[] {
  if (rain.length >= row) {
    rain = rain.slice(0, row);
  }
  let newRain = "";
  for (let i = 0; i < column; i++) {
    newRain = newRain + makeDrop(getRandomInt(config.frequency), config);
  }
  rain = [newRain, ...rain];
  return rain;
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
