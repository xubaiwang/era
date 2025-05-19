/**
 * @file 配置文件读取。
 */

// 以下是配置文件路径。
const XDG_CONFIG_HOME = Deno.env.get("XDG_CONFIG_HOME") ||
  Deno.env.get("HOME") + "/.config";
const CONFIG_DIR = XDG_CONFIG_HOME + "/era";
export const CONFIG_PATH = CONFIG_DIR + "/config.json";

/**
 * 配置类型定义。
 */
export type Config = {
  interval: number;
  frequency: number;
  rain1: string;
  rain2: string;
  timecolor: string;
  raincolor: string;
};

/**
 * 配置示例，默认配置。
 */
export const defaultConfig: Config = {
  interval: 100,
  frequency: 40,
  rain1: "│",
  rain2: " ",
  timecolor: "#eeeeee",
  raincolor: "#e0b0ff",
};

/**
 * 读取配置，若失败则默认配置。
 */
export async function getConfigOrDefault(): Promise<Config> {
  try {
    return await getConfig(CONFIG_PATH);
  } catch {
    return defaultConfig;
  }
}

/**
 * 读取配置文件。
 * @param file_path - 文件位置
 */
async function getConfig(file_path: string): Promise<Config> {
  const j = JSON.parse(await Deno.readTextFile(file_path));
  if (j.rain1 === "") {
    j.rain1 = " ";
  }
  if (j.rain2 === "") {
    j.rain2 = " ";
  }
  return j;
}

/**
 * 创建配置文件。
 */
export async function makeConfig() {
  try {
    await Deno.stat(CONFIG_DIR);
  } catch (_error) {
    await Deno.mkdir(CONFIG_DIR, { recursive: true }).catch();
  }
  await Deno.writeTextFile(CONFIG_PATH, JSON.stringify(defaultConfig));
}
