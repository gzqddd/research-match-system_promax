/**
 * 本地AI匹配算法 - 不依赖外部LLM服务
 * 基于规则的匹配算法，计算学生与项目的匹配度
 */

import type { StudentProfile } from "../../../../drizzle/schema";

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
 * 本地规则引擎：计算学生与项目的匹配度
 */
export async function calculateMatch(
  studentProfile: StudentProfile,
  project: ProjectRequirement
): Promise<MatchResult> {
  let score = 50; // 基础分数
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const suggestions: string[] = [];

  // 专业匹配度（30分）
  if (studentProfile.major && project.researchField) {
    const majorLower = studentProfile.major.toLowerCase();
    const fieldLower = project.researchField.toLowerCase();
    if (majorLower.includes(fieldLower) || fieldLower.includes(majorLower)) {
      score += 20;
      strengths.push("专业方向高度匹配");
    } else {
      score += 5;
      weaknesses.push("专业方向不完全匹配");
      suggestions.push("建议补充相关领域知识");
    }
  }

  // 技能匹配度（30分）
  if (studentProfile.skills && project.requiredSkills) {
    const studentSkills = studentProfile.skills.toLowerCase().split(/[,\s]+/);
    const requiredSkills = project.requiredSkills.toLowerCase().split(/[,\s]+/);
    const matchedSkills = requiredSkills.filter(skill => 
      studentSkills.some(s => s.includes(skill) || skill.includes(s))
    );
    const matchRatio = matchedSkills.length / requiredSkills.length;
    score += Math.floor(matchRatio * 30);
    
    if (matchRatio > 0.7) {
      strengths.push(`掌握了大部分所需技能（${matchedSkills.length}/${requiredSkills.length}）`);
    } else if (matchRatio > 0.4) {
      weaknesses.push(`部分技能缺失（仅掌握 ${matchedSkills.length}/${requiredSkills.length}）`);
      suggestions.push("建议学习缺失的技能：" + requiredSkills.filter(s => !matchedSkills.includes(s)).join("、"));
    } else {
      weaknesses.push(`技能匹配度较低（仅掌握 ${matchedSkills.length}/${requiredSkills.length}）`);
      suggestions.push("需要大量学习新技能");
    }
  }

  // 研究兴趣匹配度（20分）
  if (studentProfile.researchInterests && project.description) {
    const interests = studentProfile.researchInterests.toLowerCase();
    const description = project.description.toLowerCase();
    const keywords = interests.split(/[,\s]+/).filter(k => k.length > 2);
    const matchedKeywords = keywords.filter(keyword => description.includes(keyword));
    if (matchedKeywords.length > 0) {
      score += 15;
      strengths.push("研究兴趣与项目方向一致");
    } else {
      score += 5;
      weaknesses.push("研究兴趣与项目方向不完全一致");
    }
  }

  // 项目经验（20分）
  if (studentProfile.projectExperience) {
    score += 15;
    strengths.push("具备相关项目经验");
  } else {
    weaknesses.push("缺少项目经验");
    suggestions.push("建议参与相关项目积累经验");
  }

  // 确保分数在 0-100 范围内
  score = Math.min(100, Math.max(0, score));

  // 生成总结
  let summary = "";
  if (score >= 80) {
    summary = "高度匹配，强烈推荐申请";
  } else if (score >= 60) {
    summary = "较为匹配，建议申请";
  } else if (score >= 40) {
    summary = "一般匹配，需要补充相关能力";
  } else {
    summary = "匹配度较低，建议寻找更合适的项目";
  }

  return {
    score,
    analysis: {
      strengths,
      weaknesses,
      suggestions,
      summary,
    },
  };
}

/**
 * 生成申请陈述（本地版本 - 简单模板）
 */
export async function generateApplicationStatement(
  studentProfile: StudentProfile,
  project: ProjectRequirement
): Promise<string> {
  return `尊敬的老师：

我是${studentProfile.major || "相关专业"}的${studentProfile.grade || "学生"}，对${project.title}项目非常感兴趣。

${studentProfile.skills ? `我具备以下技能：${studentProfile.skills}。` : ""}
${studentProfile.researchInterests ? `我的研究兴趣包括：${studentProfile.researchInterests}。` : ""}
${studentProfile.projectExperience ? `我参与过以下项目：${studentProfile.projectExperience}。` : ""}

我相信我的背景和经验能够为项目带来价值，期待能够加入您的团队。

此致
敬礼！`;
}

/**
 * 扩写项目描述（本地版本 - 简单模板）
 */
export async function expandProjectDescription(keywords: string): Promise<string> {
  return `# 项目背景

${keywords}是当前研究领域的重要方向。

## 研究内容

本项目旨在${keywords}，通过系统性的研究和实验，探索相关理论和实践应用。

## 岗位职责

- 参与项目研究
- 完成相关实验
- 撰写研究报告

## 任职要求

- 相关专业背景
- 具备${keywords}相关技能
- 有研究热情和责任心

## 预期成果

- 完成项目研究目标
- 发表相关研究成果
- 积累研究经验`;
}

/**
 * AI助手对话（本地版本 - 简单回复）
 */
export async function chatWithAI(
  userMessage: string,
  userRole: "student" | "teacher" | "admin",
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }> = []
): Promise<string> {
  // 简单的关键词匹配回复
  const lowerMessage = userMessage.toLowerCase();
  
  if (lowerMessage.includes("申请") || lowerMessage.includes("如何申请")) {
    return "您可以在项目详情页面点击「申请」按钮，填写申请陈述后提交。建议在申请前完善个人档案，提高匹配度。";
  }
  
  if (lowerMessage.includes("匹配") || lowerMessage.includes("推荐")) {
    return "系统会根据您的专业、技能、研究兴趣等信息，智能计算与项目的匹配度。匹配度越高，申请成功率越大。";
  }
  
  if (lowerMessage.includes("档案") || lowerMessage.includes("资料")) {
    return "您可以在个人中心完善档案信息，包括专业、技能、研究兴趣、项目经验等。完善的档案有助于获得更准确的匹配推荐。";
  }
  
  return "感谢您的提问。我是智研匹配系统的AI助手，可以为您提供项目申请、匹配分析、档案完善等方面的帮助。请告诉我您需要什么帮助？";
}

