/**
 * 认证配置
 */

import { getEnv, requireEnv } from "./env-loader";

export const AuthConfig = {
  /**
   * JWT 密钥（用于会话签名）
   */
  get jwtSecret(): string {
    return requireEnv(
      "JWT_SECRET",
      "请在 .env 文件中配置 JWT_SECRET（至少32字符）"
    );
  },

  /**
   * 管理员邮箱
   */
  get adminEmail(): string {
    return requireEnv(
      "ADMIN_EMAIL",
      "请在 .env 文件中配置 ADMIN_EMAIL"
    );
  },

  /**
   * 管理员名称
   */
  get adminName(): string {
    return getEnv("ADMIN_NAME", "Admin") || "Admin";
  },

  /**
   * 会话超时时间（秒）
   */
  get sessionTimeout(): number {
    return parseInt(getEnv("SESSION_TIMEOUT", "86400") || "86400", 10);
  },
};

