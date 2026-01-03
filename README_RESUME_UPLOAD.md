# 简历上传功能实现说明

## 功能概述

已实现简历PDF文件上传功能，支持自动解析简历内容并填充到个人档案表格中。

## 安装依赖

在开始使用前，需要安装PDF解析库：

```bash
pnpm add pdfjs-dist
```

## 功能特性

1. **PDF文件上传**
   - 支持PDF格式文件
   - 文件大小限制：10MB
   - 自动保存到本地存储

2. **AI自动解析**
   - 自动提取PDF文本内容
   - 使用AI解析结构化信息：
     - 学号
     - 年级
     - 专业
     - 绩点
     - 技能标签
     - 研究兴趣
     - 项目经验
     - 可用时间

3. **自动填充表单**
   - 解析成功后自动填充到表单字段
   - 用户可以检查和修改

4. **用户体验**
   - 上传进度提示
   - 解析状态显示
   - 错误提示
   - 已上传简历查看链接

## 文件结构

### 后端文件

- `server/services/resume-parser.ts` - PDF文本提取服务
- `server/services/ai/resume-ai-parser.ts` - AI简历解析服务
- `server/routes/student.ts` - 文件上传tRPC端点

### 前端文件

- `client/src/pages/student/Profile.tsx` - 个人档案页面（已更新）

### 文档

- `docs/features/resume-upload-implementation.md` - 详细实现文档

## 使用流程

1. 用户访问个人档案页面 (`/profile`)
2. 点击"选择文件"按钮
3. 选择PDF格式的简历文件
4. 系统自动上传文件
5. AI解析简历内容
6. 自动填充表单字段
7. 用户可以检查和修改后保存

## API端点

### tRPC Mutation: `student.profile.uploadResume`

**输入**:
```typescript
{
  file: string;        // Base64编码的PDF文件
  fileName: string;    // 文件名
  fileSize: number;   // 文件大小（字节）
}
```

**输出**:
```typescript
{
  success: boolean;
  resumeUrl: string;
  resumeKey: string;
  parsedData: {
    studentId?: string;
    grade?: string;
    major?: string;
    gpa?: string;
    skills?: string;
    researchInterests?: string;
    projectExperience?: string;
    availableTime?: string;
  };
}
```

## 注意事项

1. **文件存储**: 简历文件存储在 `uploads/resumes/user-{userId}/` 目录下
2. **访问权限**: 文件通过 `/uploads/` 路径公开访问，生产环境需要添加权限控制
3. **解析准确性**: AI解析可能不完全准确，用户需要检查和修改
4. **文件大小**: 前端和后端都进行了10MB限制验证

## 错误处理

- 文件格式错误：仅支持PDF格式
- 文件大小超限：超过10MB会提示错误
- PDF解析失败：显示具体错误信息
- AI解析失败：返回空结果，用户可以手动填写

## 后续优化建议

1. 添加文件访问权限控制
2. 支持Word文档格式
3. 支持图片格式简历（OCR）
4. 添加解析结果缓存
5. 优化大文件上传性能

