const path = require("path");

/**
 * PM2 开发环境配置
 * 使用 tsx watch 模式，自动重新加载 TypeScript 文件，无需手动 build
 * 
 * 使用方法:
 *   pm2 start config/ecosystem.dev.config.cjs
 *   pm2 logs research-match-system-dev
 */
module.exports = {
  apps: [
    {
      name: "research-match-system-dev",
      script: "tsx",
      args: "watch server/core/framework/express.ts",
      cwd: path.resolve(__dirname, ".."),
      instances: 1, // 开发环境使用单实例
      exec_mode: "fork",
      env: {
        NODE_ENV: "development",
        // 数据库与认证关键变量，需在部署机上预先 export
        DATABASE_URL: process.env.DATABASE_URL,
        JWT_SECRET: process.env.JWT_SECRET,
        ADMIN_EMAIL: process.env.ADMIN_EMAIL,
        ADMIN_NAME: process.env.ADMIN_NAME,
        DB_POOL_MIN: process.env.DB_POOL_MIN,
        DB_POOL_MAX: process.env.DB_POOL_MAX,
        // 注意：AI/LLM 配置（OPENROUTER_API_KEY 等）不在这里设置
        // 这些变量应该从 .env 或 .env.production 文件加载，由 env-loader.ts 处理
      },
      // 开发环境日志
      error_file: "./logs/error-dev.log",
      out_file: "./logs/out-dev.log",
      log_file: "./logs/combined-dev.log",
      time: true,
      // 开发环境启用 watch，自动重启
      watch: true,
      watch_delay: 1000,
      ignore_watch: [
        "node_modules",
        "dist",
        "logs",
        ".git",
        "*.log",
        "client/dist",
        "config"
      ],
      // 开发环境重启策略
      max_restarts: 50,
      min_uptime: "2s",
      listen_timeout: 10000,
      kill_timeout: 3000,
      // 自动重启延迟（避免频繁重启）
      restart_delay: 2000,
    },
  ],
};

