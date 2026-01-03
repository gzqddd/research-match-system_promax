/**
 * AI / LLM 配置
 */

import { getEnv, requireEnv } from "./env-loader";

export const AIConfig = {
  /**
   * OpenRouter API Key
   */
  get openRouterApiKey(): string | undefined {
    return getEnv("OPENROUTER_API_KEY");
  },

  /**
   * 获取 OpenRouter API Key（必需）
   * 如果未配置，抛出错误
   */
  requireOpenRouterApiKey(): string {
    return requireEnv(
      "OPENROUTER_API_KEY",
      "请在 .env 文件中配置 OPENROUTER_API_KEY"
    );
  },

  /**
   * 检查 OpenRouter API Key 是否已配置
   */
  hasOpenRouterApiKey(): boolean {
    return !!this.openRouterApiKey;
  },

  /**
   * LLM Council 服务地址
   */
  get llmCouncilBaseUrl(): string | undefined {
    return getEnv("LLM_COUNCIL_BASE_URL");
  },

  /**
   * 是否启用 AI 匹配功能
   */
  get enableAIMatch(): boolean {
    return getEnv("ENABLE_AI_MATCH", "true") === "true";
  },
};

