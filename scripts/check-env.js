#!/usr/bin/env node

/**
 * 环境变量检查脚本
 * 用于验证 .env 文件中的环境变量是否正确加载
 * 
 * 使用方法:
 *   node scripts/check-env.js
 *   或
 *   pnpm check-env
 */

// 加载 dotenv（与主应用一致）
import "dotenv/config";

console.log("==========================================");
console.log("环境变量检查");
console.log("==========================================\n");

// 检查基础环境变量
const basicVars = {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  DATABASE_URL: process.env.DATABASE_URL ? "已配置 (已隐藏)" : "未配置",
  JWT_SECRET: process.env.JWT_SECRET ? "已配置 (已隐藏)" : "未配置",
};

console.log("基础配置:");
Object.entries(basicVars).forEach(([key, value]) => {
  const status = value === "未配置" ? "❌" : "✅";
  console.log(`  ${status} ${key}: ${value}`);
});

console.log("\n------------------------------------------\n");

// 检查 AI 相关环境变量
const aiVars = {
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
  LLM_COUNCIL_BASE_URL: process.env.LLM_COUNCIL_BASE_URL,
};

console.log("AI / LLM 配置:");
Object.entries(aiVars).forEach(([key, value]) => {
  if (value) {
    // 显示前几个字符和后几个字符，中间用 ... 隐藏
    const displayValue = value.length > 20 
      ? `${value.substring(0, 10)}...${value.substring(value.length - 10)}`
      : value;
    console.log(`  ✅ ${key}: ${displayValue}`);
    console.log(`     长度: ${value.length} 字符`);
    console.log(`     是否包含空白字符: ${value !== value.trim() ? "是 (⚠️ 警告)" : "否"}`);
  } else {
    console.log(`  ❌ ${key}: 未配置`);
  }
});

console.log("\n==========================================\n");

// 总结
const missingVars = Object.entries(aiVars)
  .filter(([_, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.log("⚠️  警告: 以下环境变量未配置:");
  missingVars.forEach(key => console.log(`   - ${key}`));
  console.log("\n请在 .env 文件中添加这些配置。");
  process.exit(1);
} else {
  console.log("✅ 所有必需的环境变量已配置！");
  process.exit(0);
}

