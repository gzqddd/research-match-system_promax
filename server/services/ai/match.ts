import { invokeLLM } from "../../core/services/ai/llm";
import type { StudentProfile } from "../../../drizzle/schema";

/**
 * AI智能匹配算法
 * 基于学生档案和项目需求,计算匹配度并生成分析报告
 */

interface ProjectRequirement {
  title: string;
  description: string;
  requiredSkills?: string;
  researchField?: string;
  requirements?: string;
}

interface MatchResult {
  score: number; // 0-100的匹配分数
  analysis: {
    strengths: string[]; // 优势点
    weaknesses: string[]; // 不足点
    suggestions: string[]; // 改进建议
    summary: string; // 总结
  };
}

/**
 * 计算学生与项目的匹配度
 */
export async function calculateMatch(
  studentProfile: StudentProfile,
  project: ProjectRequirement
): Promise<MatchResult> {
  try {
    const prompt = `你是一个科研项目匹配专家。请分析学生档案与项目需求的匹配度。

学生档案:
- 专业: ${studentProfile.major || "未知"}
- 年级: ${studentProfile.grade || "未知"}
- 绩点: ${studentProfile.gpa || "未知"}
- 技能: ${studentProfile.skills || "未知"}
- 研究兴趣: ${studentProfile.researchInterests || "未知"}
- 项目经验: ${studentProfile.projectExperience || "未知"}

项目需求:
- 项目名称: ${project.title}
- 项目描述: ${project.description}
- 研究方向: ${project.researchField || "未知"}
- 所需技能: ${project.requiredSkills || "未知"}
- 任务要求: ${project.requirements || "未知"}

请按照以下JSON格式输出匹配分析结果:
{
  "score": 85,
  "strengths": ["优势1", "优势2"],
  "weaknesses": ["不足1", "不足2"],
  "suggestions": ["建议1", "建议2"],
  "summary": "总体评价"
}

评分标准:
- 90-100分: 高度匹配,技能和背景完全符合
- 70-89分: 较为匹配,大部分要求符合
- 50-69分: 一般匹配,部分要求符合
- 50分以下: 不太匹配,需要大量学习`;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "你是一个专业的科研项目匹配分析专家,擅长评估学生能力与项目需求的匹配度。",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "match_result",
          strict: true,
          schema: {
            type: "object",
            properties: {
              score: {
                type: "integer",
                description: "匹配分数(0-100)",
              },
              strengths: {
                type: "array",
                items: { type: "string" },
                description: "学生的优势点",
              },
              weaknesses: {
                type: "array",
                items: { type: "string" },
                description: "学生的不足点",
              },
              suggestions: {
                type: "array",
                items: { type: "string" },
                description: "改进建议",
              },
              summary: {
                type: "string",
                description: "总体评价",
              },
            },
            required: ["score", "strengths", "weaknesses", "suggestions", "summary"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0]?.message?.content;
    if (!content || typeof content !== 'string') {
      throw new Error("AI响应为空或格式错误");
    }

    const result = JSON.parse(content);
    
    return {
      score: Math.min(100, Math.max(0, result.score)),
      analysis: {
        strengths: result.strengths || [],
        weaknesses: result.weaknesses || [],
        suggestions: result.suggestions || [],
        summary: result.summary || "匹配分析完成",
      },
    };
  } catch (error) {
    console.error("[AI Match] 匹配计算失败:", error);
    // 返回默认结果
    return {
      score: 60,
      analysis: {
        strengths: ["基础条件符合"],
        weaknesses: ["需要进一步评估"],
        suggestions: ["完善个人档案以获得更准确的匹配分析"],
        summary: "匹配分析暂时不可用,请稍后重试",
      },
    };
  }
}

/**
 * 生成申请陈述
 */
export async function generateApplicationStatement(
  studentProfile: StudentProfile,
  project: ProjectRequirement
): Promise<string> {
  try {
    const prompt = `请为学生生成一份专业的项目申请陈述。

学生背景:
- 专业: ${studentProfile.major || "未知"}
- 年级: ${studentProfile.grade || "未知"}
- 技能: ${studentProfile.skills || "未知"}
- 研究兴趣: ${studentProfile.researchInterests || "未知"}
- 项目经验: ${studentProfile.projectExperience || "未知"}

申请项目:
- 项目名称: ${project.title}
- 项目描述: ${project.description}
- 研究方向: ${project.researchField || "未知"}

要求:
1. 字数在300-500字之间
2. 突出学生的相关技能和经验
3. 表达对项目的兴趣和理解
4. 说明能为项目带来的价值
5. 语气专业、诚恳、有说服力`;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "你是一个专业的科研申请文书撰写专家,擅长撰写有说服力的申请陈述。",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = response.choices[0]?.message?.content;
    const statement = typeof content === 'string' ? content : '';
    return statement || "申请陈述生成失败,请手动填写。";
  } catch (error) {
    console.error("[AI Match] 申请陈述生成失败:", error);
    return "申请陈述生成暂时不可用,请手动填写您的申请理由。";
  }
}

/**
 * 扩写项目描述
 */
export async function expandProjectDescription(keywords: string): Promise<string> {
  try {
    const prompt = `请根据以下关键词,生成一份结构化的科研项目招募描述。

关键词: ${keywords}

要求:
1. 包含以下部分:
   - 项目背景与意义
   - 研究内容与目标
   - 岗位职责
   - 任职要求
   - 预期成果
2. 内容专业、详细、有吸引力
3. 字数在500-800字之间
4. 使用Markdown格式`;

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "你是一个科研项目描述撰写专家,擅长撰写专业且有吸引力的项目招募文案。",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = response.choices[0]?.message?.content;
    const description = typeof content === 'string' ? content : '';
    return description || "项目描述生成失败,请手动填写。";
  } catch (error) {
    console.error("[AI Match] 项目描述扩写失败:", error);
    return "项目描述生成暂时不可用,请手动填写项目详情。";
  }
}

/**
 * AI助手对话
 */
export async function chatWithAI(
  userMessage: string,
  userRole: "student" | "teacher" | "admin",
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }> = []
): Promise<string> {
  try {
    const systemPrompts = {
      student: "你是智研匹配系统的AI助手,专门为学生提供科研项目申请、技能提升、简历优化等方面的建议。",
      teacher: "你是智研匹配系统的AI助手,专门为教师提供项目管理、学生评估、面试题目生成等方面的帮助。",
      admin: "你是智研匹配系统的AI助手,专门为管理员提供系统分析、数据洞察、运营建议等方面的支持。",
    };

    const messages = [
      {
        role: "system" as const,
        content: systemPrompts[userRole],
      },
      ...conversationHistory.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      {
        role: "user" as const,
        content: userMessage,
      },
    ];

    const response = await invokeLLM({ messages });

    const content = response.choices[0]?.message?.content;
    const reply = typeof content === 'string' ? content : '';
    return reply || "抱歉,我暂时无法回答您的问题,请稍后重试。";
  } catch (error) {
    console.error("[AI Match] AI对话失败:", error);
    return "AI助手暂时不可用,请稍后重试。";
  }
}

