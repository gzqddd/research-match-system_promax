/**
 * LLM模块
 * 这里封装对 OpenRouter / 兼容 OpenAI Chat Completions 接口的调用
 * 上层只依赖 `invokeLLM`，方便后续替换为 llm-council 或其他网关
 */

import axios from "axios";
import { Config } from "../../config";

export type Role = "system" | "user" | "assistant" | "tool" | "function";

export type TextContent = {
  type: "text";
  text: string;
};

export type ImageContent = {
  type: "image_url";
  image_url: {
    url: string;
    detail?: "auto" | "low" | "high";
  };
};

export type FileContent = {
  type: "file_url";
  file_url: {
    url: string;
    mime_type?: "audio/mpeg" | "audio/wav" | "application/pdf" | "audio/mp4" | "video/mp4" ;
  };
};

export type MessageContent = string | TextContent | ImageContent | FileContent;

export type Message = {
  role: Role;
  content: MessageContent | MessageContent[];
  name?: string;
  tool_call_id?: string;
};

export type Tool = {
  type: "function";
  function: {
    name: string;
    description?: string;
    parameters?: Record<string, unknown>;
  };
};

export type ToolChoicePrimitive = "none" | "auto" | "required";
export type ToolChoiceByName = { name: string };
export type ToolChoiceExplicit = {
  type: "function";
  function: {
    name: string;
  };
};

export type ToolChoice = ToolChoicePrimitive | ToolChoiceExplicit;

export type InvokeParams = {
  messages: Message[];
  tools?: Tool[];
  tool_choice?: ToolChoice;
  response_format?: {
    type: "json_schema";
    json_schema: {
      name: string;
      strict: boolean;
      schema: Record<string, unknown>;
    };
  };
};

export type InvokeResult = {
  choices: Array<{
    message: {
      content: string | null;
      tool_calls?: Array<{
        id: string;
        type: "function";
        function: {
          name: string;
          arguments: string;
        };
      }>;
    };
  }>;
};

/**
 * 调用LLM
 * 当前实现：直接调用 OpenRouter Chat Completions 接口
 * 要求在环境变量中配置 OPENROUTER_API_KEY
 */
export async function invokeLLM(params: InvokeParams): Promise<InvokeResult> {
  // 使用统一的配置读取 API Key（已自动清理空白字符）
  const apiKey = Config.ai.requireOpenRouterApiKey();

  // OpenRouter 的 Chat Completions 端点（与 OpenAI 兼容）
  const apiUrl = "https://openrouter.ai/api/v1/chat/completions";
  
  // 默认使用的模型
  const defaultModel = "deepseek/deepseek-chat-v3.1";
  
  // 调试：输出实际使用的 URL
  console.log("[LLM] 调试信息:", {
    apiUrl,
    apiUrlType: typeof apiUrl,
    apiUrlLength: apiUrl.length,
    isValidUrl: apiUrl.startsWith("http"),
    defaultModel,
  });

  // 将当前项目的 MessageContent 转换为 OpenAI 兼容格式
  const mappedMessages = params.messages.map((msg) => {
    // 简化处理：只支持纯文本/字符串内容，其它类型先转换为字符串
    const normalizeContent = (content: MessageContent | MessageContent[]): string => {
      if (Array.isArray(content)) {
        return content
          .map((c) =>
            typeof c === "string"
              ? c
              : c.type === "text"
              ? c.text
              : JSON.stringify(c)
          )
          .join("\n");
      }
      if (typeof content === "string") return content;
      if ((content as TextContent).type === "text") return (content as TextContent).text;
      return JSON.stringify(content);
    };

    return {
      role: msg.role === "function" ? "assistant" : msg.role, // OpenRouter 不支持 function/tool 角色，简单归为 assistant
      content: normalizeContent(msg.content),
      name: msg.name,
    };
  });

  // 验证 URL 格式
  if (!apiUrl || typeof apiUrl !== "string" || !apiUrl.startsWith("http")) {
    const errorMsg = `无效的 API URL: ${JSON.stringify(apiUrl)} (类型: ${typeof apiUrl})`;
    console.error("[LLM] URL 验证失败:", errorMsg);
    throw new Error(errorMsg);
  }

  try {
    console.log("[LLM] 准备发送请求到:", apiUrl);
    const response = await axios.post(
      apiUrl,
      {
        model: defaultModel,
        messages: mappedMessages,

        response_format: params.response_format,
      },
      {
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        timeout: 60_000,
      }
    );

    const data = response.data;

    // 映射为当前项目内部使用的 InvokeResult 结构
    const choices = (data.choices || []).map((choice: any) => ({
      message: {
        content: choice?.message?.content ?? null,
        tool_calls: choice?.message?.tool_calls,
      },
    }));

    return { choices };
  } catch (error: any) {
    // 详细的错误日志
    if (error.response) {
      // 服务器返回了错误响应
      console.error("[LLM] OpenRouter API 错误响应:", {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        url: apiUrl,
      });
    } else if (error.request) {
      // 请求已发送但没有收到响应
      console.error("[LLM] OpenRouter API 无响应:", {
        message: error.message,
        url: apiUrl,
      });
    } else {
      // 请求配置错误
      console.error("[LLM] OpenRouter API 请求配置错误:", {
        message: error.message,
        url: apiUrl,
      });
    }
    
    throw new Error(`LLM 调用失败: ${error?.response?.data?.error?.message || error?.message || "未知错误"}。请检查 OPENROUTER_API_KEY 配置和网络连接。`);
  }
}

