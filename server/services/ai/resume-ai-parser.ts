/**
 * AI简历解析服务
 * 使用LLM从简历文本中提取结构化信息
 */

import { invokeLLM } from "../../core/services/ai/llm";

export interface ResumeParseResult {
  studentId?: string;
  grade?: string;
  major?: string;
  gpa?: string;
  skills?: string;  // 逗号分隔的技能列表
  researchInterests?: string;
  projectExperience?: string;
  availableTime?: string;
}

/**
 * 使用AI解析简历文本，提取结构化信息
 * @param resumeText 简历的文本内容
 * @returns 解析后的结构化信息
 */
export async function parseResumeWithAI(resumeText: string): Promise<ResumeParseResult> {
  // 验证输入
  if (!resumeText || typeof resumeText !== "string") {
    console.warn("[AI Resume Parser] 简历文本为空或无效");
    return {};
  }

  // 清理和截断文本
  const cleanText = resumeText.trim();
  if (cleanText.length === 0) {
    console.warn("[AI Resume Parser] 简历文本为空");
    return {};
  }

  const truncatedText = cleanText.length > 8000 ? cleanText.substring(0, 8000) + "\n\n(文本已截断)" : cleanText;

  const prompt = `你是一个专业的简历解析助手。请从以下简历文本中提取学生的信息，并以JSON格式返回。

需要提取的字段：
1. studentId: 学号（如果有）
2. grade: 年级（如：2021级、大三、Junior等）
3. major: 专业（如：计算机科学与技术、软件工程等）
4. gpa: 绩点（如：3.8、3.8/4.0等）
5. skills: 技能标签（用逗号分隔，如：Python, 机器学习, 深度学习）
6. researchInterests: 研究兴趣（简要描述）
7. projectExperience: 项目经验（简要描述）
8. availableTime: 可用时间（如果有提到）

简历文本：
${truncatedText}

请以JSON格式返回，格式如下：
{
  "studentId": "学号或null",
  "grade": "年级或null",
  "major": "专业或null",
  "gpa": "绩点或null",
  "skills": "技能标签，用逗号分隔或null",
  "researchInterests": "研究兴趣或null",
  "projectExperience": "项目经验或null",
  "availableTime": "可用时间或null"
}

只返回JSON，不要其他内容。`;

  try {
    const result = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "你是一个专业的简历解析助手，擅长从简历文本中提取结构化信息。",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      // 使用 JSON mode 确保返回 JSON 格式
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "resume_parse_result",
          strict: false,
          schema: {
            type: "object",
            properties: {
              studentId: { type: "string" },
              grade: { type: "string" },
              major: { type: "string" },
              gpa: { type: "string" },
              skills: { type: "string" },
              researchInterests: { type: "string" },
              projectExperience: { type: "string" },
              availableTime: { type: "string" },
            },
          },
        },
      },
    });

    const content = result.choices[0]?.message?.content;
    if (!content) {
      throw new Error("AI返回结果为空");
    }

    // 尝试解析JSON
    let parsed: ResumeParseResult;

    if (typeof content === "string") {
      // 情况1：模型返回的是 JSON 字符串
      try {
        parsed = JSON.parse(content);
      } catch {
        // 如果不是纯 JSON，尝试用正则提取 JSON 部分
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("无法从AI响应中提取JSON");
        }
      }
    } else if (typeof content === "object") {
      // 情况2：在 JSON mode 下，有些模型会直接返回对象而不是字符串
      parsed = content as ResumeParseResult;
    } else {
      throw new Error(`AI返回了未知类型的内容: ${typeof content}`);
    }

    // 清理空值
    const cleaned: ResumeParseResult = {};
    if (parsed.studentId && parsed.studentId !== "null") cleaned.studentId = parsed.studentId;
    if (parsed.grade && parsed.grade !== "null") cleaned.grade = parsed.grade;
    if (parsed.major && parsed.major !== "null") cleaned.major = parsed.major;
    if (parsed.gpa && parsed.gpa !== "null") cleaned.gpa = parsed.gpa;
    if (parsed.skills && parsed.skills !== "null") cleaned.skills = parsed.skills;
    if (parsed.researchInterests && parsed.researchInterests !== "null") cleaned.researchInterests = parsed.researchInterests;
    if (parsed.projectExperience && parsed.projectExperience !== "null") cleaned.projectExperience = parsed.projectExperience;
    if (parsed.availableTime && parsed.availableTime !== "null") cleaned.availableTime = parsed.availableTime;

    return cleaned;
  } catch (error) {
    console.error("[AI Resume Parser] 解析失败:", error);
    // 如果AI解析失败，返回空结果而不是抛出错误
    // 这样用户仍然可以手动填写
    return {};
  }
}

