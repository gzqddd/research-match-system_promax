/**
 * 环境变量加载器
 * 负责加载和初始化环境变量
 */

import { config } from "dotenv";
import { existsSync } from "fs";
import { resolve } from "path";

/**
 * 加载环境变量文件
 * 优先加载 .env.production（生产环境），否则加载 .env
 */
export function loadEnv(): void {
  // PM2 的 cwd 设置为项目根目录（ecosystem.config.cjs 中的 cwd: path.resolve(__dirname, "..")）
  const projectRoot = process.cwd();

  // 优先尝试 .env.production，然后 .env
  const envProduction = resolve(projectRoot, ".env.production");
  const envDefault = resolve(projectRoot, ".env");

  // 调试信息
  console.log(`[Config] 当前工作目录: ${projectRoot}`);
  console.log(`[Config] NODE_ENV: ${process.env.NODE_ENV || "未设置"}`);

  let envFile: string;
  if (process.env.NODE_ENV === "production" && existsSync(envProduction)) {
    envFile = envProduction;
    console.log(`[Config] 生产环境，使用: ${envFile}`);
  } else if (existsSync(envDefault)) {
    envFile = envDefault;
    console.log(`[Config] 使用默认环境文件: ${envFile}`);
  } else if (existsSync(envProduction)) {
    envFile = envProduction;
    console.log(`[Config] 默认文件不存在，使用生产环境文件: ${envFile}`);
  } else {
    envFile = envDefault; // 最后尝试，即使不存在也会尝试加载
    console.log(`[Config] 警告: 环境文件不存在，尝试加载: ${envFile}`);
  }

  // 加载环境变量（允许文件不存在）
  const result = config({ path: envFile });
  
  if (result.error) {
    console.warn(`[Config] 警告: 加载环境变量文件失败: ${result.error.message}`);
  } else if (existsSync(envFile)) {
    console.log(`[Config] 成功加载环境变量文件: ${envFile}`);
    // 调试：检查关键环境变量是否已加载
    const openRouterKey = process.env.OPENROUTER_API_KEY;
    if (openRouterKey) {
      console.log(`[Config] OPENROUTER_API_KEY: 已加载 (长度: ${openRouterKey.length})`);
      console.log(`[Config] OPENROUTER_API_KEY 值预览: ${openRouterKey.substring(0, 10)}...${openRouterKey.substring(openRouterKey.length - 4)}`);
      // 验证值是否有效（不是空字符串或只有空白字符）
      if (!openRouterKey.trim()) {
        console.error(`[Config] 错误: OPENROUTER_API_KEY 值为空或只包含空白字符`);
      }
    } else {
      console.warn(`[Config] 警告: OPENROUTER_API_KEY 未在环境变量中找到`);
      console.warn(`[Config] 调试: process.env 中所有 OPENROUTER 相关的键:`, Object.keys(process.env).filter(k => k.includes('OPENROUTER')));
    }
  }
}

/**
 * 读取并清理环境变量值
 * 移除前后空白字符，避免从 .env 文件读取时携带的换行符等问题
 */
export function getEnv(key: string, defaultValue?: string): string | undefined {
  const value = process.env[key];
  if (!value) return defaultValue;
  return value.trim();
}

/**
 * 获取必需的环境变量，如果不存在则抛出错误
 */
export function requireEnv(key: string, description?: string): string {
  const value = getEnv(key);
  if (!value) {
    throw new Error(
      `${key} 未配置。${description ? `(${description})` : ""}`
    );
  }
  return value;
}

