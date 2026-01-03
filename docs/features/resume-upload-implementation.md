# 简历上传与自动解析功能实现文档

## 功能概述

实现简历PDF文件上传功能，自动解析简历内容并填充到个人档案表格中。

## 技术方案

### 架构设计

```
前端 (Profile.tsx)
  ↓ 文件选择
  ↓ Base64编码
  ↓ tRPC调用
后端 (student.ts router)
  ↓ 接收文件
  ↓ 保存到本地存储
  ↓ PDF文本提取
  ↓ AI解析结构化信息
  ↓ 返回解析结果
前端
  ↓ 自动填充表单
```

### 技术栈

- **PDF解析**: `pdf-parse` - 轻量级PDF文本提取库
- **文件存储**: 现有本地存储服务 (`server/services/storage/local.ts`)
- **AI解析**: 现有LLM服务 (`server/core/services/ai/llm.ts`)
- **文件上传**: tRPC mutation (base64编码传输)

## 实现步骤

### 阶段1: 后端基础设施

1. ✅ 安装PDF解析库
2. ✅ 创建PDF解析服务
3. ✅ 创建AI简历解析服务
4. ✅ 创建文件上传tRPC端点

### 阶段2: 前端实现

5. ✅ 实现文件选择器
6. ✅ 实现文件上传逻辑
7. ✅ 显示上传和解析进度
8. ✅ 自动填充表单

### 阶段3: 错误处理与优化

9. ✅ 添加错误处理
10. ✅ 添加用户提示

## 数据结构

### 解析结果格式

```typescript
interface ResumeParseResult {
  studentId?: string;
  grade?: string;
  major?: string;
  gpa?: string;
  skills?: string;  // 逗号分隔的技能列表
  researchInterests?: string;
  projectExperience?: string;
  availableTime?: string;
}
```

### tRPC输入格式

```typescript
{
  file: string;  // Base64编码的PDF文件
  fileName: string;
  fileSize: number;
}
```

## API设计

### tRPC Mutation: `student.profile.uploadResume`

**输入**:
- `file`: string (base64编码的PDF)
- `fileName`: string
- `fileSize`: number

**输出**:
- `success`: boolean
- `resumeUrl`: string
- `resumeKey`: string
- `parsedData`: ResumeParseResult

## 错误处理

### 前端验证
- 文件类型检查（仅PDF）
- 文件大小检查（≤10MB）
- 文件格式验证

### 后端验证
- Base64解码验证
- PDF格式验证
- 文件大小验证
- 存储空间检查

### 解析错误处理
- PDF解析失败 → 返回错误信息
- AI解析失败 → 返回部分结果或错误信息
- 网络错误 → 重试机制

## 用户体验

### 上传流程
1. 用户点击"选择文件"按钮
2. 文件选择对话框打开
3. 选择PDF文件后，自动开始上传
4. 显示上传进度（可选）
5. 显示"正在解析..."状态
6. 解析完成后，自动填充表单
7. 显示成功提示

### 状态提示
- 上传中: "正在上传简历..."
- 解析中: "AI正在解析您的简历..."
- 成功: "简历解析成功，已自动填充信息"
- 失败: 显示具体错误信息

## 注意事项

1. **文件大小限制**: 前端和后端都要验证（10MB）
2. **文件类型限制**: 仅支持PDF格式
3. **隐私安全**: 简历文件存储在本地，需要确保访问权限控制
4. **解析准确性**: AI解析可能不完全准确，用户需要检查和修改
5. **性能优化**: 大文件上传可能需要分块上传（未来优化）

## 测试计划

1. 单元测试: PDF解析服务
2. 单元测试: AI解析服务
3. 集成测试: 完整上传流程
4. 错误测试: 各种异常情况

## 未来优化

1. 支持Word文档格式
2. 支持图片格式简历（OCR）
3. 分块上传大文件
4. 解析结果缓存
5. 批量上传功能

