/**
 * 数据库配置
 */

import { getEnv, requireEnv } from "./env-loader";

export const DatabaseConfig = {
  /**
   * 数据库连接字符串
   */
  get url(): string {
    return requireEnv("DATABASE_URL", "请在 .env 文件中配置 DATABASE_URL");
  },

  /**
   * 连接池最小连接数
   */
  get poolMin(): number {
    return parseInt(getEnv("DB_POOL_MIN", "2") || "2", 10);
  },

  /**
   * 连接池最大连接数
   */
  get poolMax(): number {
    return parseInt(getEnv("DB_POOL_MAX", "10") || "10", 10);
  },

  /**
   * 数据库查询超时时间（毫秒）
   */
  get queryTimeout(): number {
    return parseInt(getEnv("DB_QUERY_TIMEOUT", "30000") || "30000", 10);
  },
};

