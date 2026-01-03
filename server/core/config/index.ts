/**
 * 统一配置管理模块
 * 
 * 所有环境变量配置都通过此模块统一管理
 * 使用前必须先调用 loadEnv() 加载环境变量
 */

import { loadEnv } from "./env-loader";
import { AppConfig } from "./app";
import { DatabaseConfig } from "./database";
import { AuthConfig } from "./auth";
import { AIConfig } from "./ai";

// 自动加载环境变量（在模块加载时执行）
loadEnv();

/**
 * 统一配置对象
 * 所有配置都通过此对象访问
 */
export const Config = {
  app: AppConfig,
  database: DatabaseConfig,
  auth: AuthConfig,
  ai: AIConfig,
} as const;

// 导出各个配置模块（方便单独导入）
export { AppConfig, DatabaseConfig, AuthConfig, AIConfig };
export { loadEnv, getEnv, requireEnv } from "./env-loader";

