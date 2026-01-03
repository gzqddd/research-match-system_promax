/**
 * 应用配置
 * 端口、环境、基础设置等
 */

import { getEnv } from "./env-loader";

export const AppConfig = {
  /**
   * 应用环境
   */
  get nodeEnv(): "production" | "development" | "staging" {
    return (getEnv("NODE_ENV", "development") as any) || "development";
  },

  /**
   * 是否为生产环境
   */
  get isProduction(): boolean {
    return this.nodeEnv === "production";
  },

  /**
   * 是否为开发环境
   */
  get isDevelopment(): boolean {
    return this.nodeEnv === "development";
  },

  /**
   * 应用端口
   */
  get port(): number {
    return parseInt(getEnv("PORT", "3000") || "3000", 10);
  },

  /**
   * 应用标题
   */
  get title(): string {
    return getEnv("VITE_APP_TITLE", "智研匹配系统") || "智研匹配系统";
  },
};

