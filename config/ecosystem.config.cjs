const path = require("path");

module.exports = {
  apps: [
    {
      name: "research-match-system",
      script: "./dist/index.js",
      cwd: path.resolve(__dirname, ".."),
      instances: "max",  // 先使用单实例，稳定后再改为 "max"
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production",
        // 数据库与认证关键变量，需在部署机上预先 export
        DATABASE_URL: process.env.DATABASE_URL,
        JWT_SECRET: process.env.JWT_SECRET,
        ADMIN_EMAIL: process.env.ADMIN_EMAIL,
        ADMIN_NAME: process.env.ADMIN_NAME,
        DB_POOL_MIN: process.env.DB_POOL_MIN,
        DB_POOL_MAX: process.env.DB_POOL_MAX,
        // 注意：AI/LLM 配置（OPENROUTER_API_KEY 等）不在这里设置
        // 这些变量应该从 .env.production 文件加载，由 env-loader.ts 处理
        // 如果在 env 块中设置为 undefined，会覆盖文件加载的值
      },
      // 将日志写到项目内，避免 /var/log 权限问题
      error_file: "./logs/error.log",
      out_file: "./logs/out.log",
      log_file: "./logs/combined.log",
      time: true,
      max_memory_restart: "1G",
      watch: false,
      ignore_watch: ["node_modules", "dist"],
      max_restarts: 10,
      min_uptime: "10s",
      // 增加启动超时时间
      listen_timeout: 10000,
      kill_timeout: 5000,
    },
  ],
};
