# 数据库框架梳理文档

## 📊 数据库概述

- **数据库类型**: MySQL
- **ORM框架**: Drizzle ORM
- **Schema文件**: `drizzle/schema.ts`
- **迁移文件**: `drizzle/*.sql`

---

## 🗂️ 数据表结构

### 1. 用户表 (`users`)

**作用**: 系统核心用户表，支持学生、教师、管理员三种角色

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| `id` | INT | 主键，自增 | PRIMARY KEY |
| `openId` | VARCHAR(64) | 第三方登录唯一标识 | UNIQUE, NOT NULL |
| `name` | TEXT | 用户姓名 | - |
| `email` | VARCHAR(320) | 邮箱地址 | - |
| `loginMethod` | VARCHAR(64) | 登录方式 | - |
| `passwordHash` | TEXT | 密码哈希值（bcrypt） | - |
| `role` | ENUM | 用户角色：`student`, `teacher`, `admin` | NOT NULL, DEFAULT 'student' |
| `status` | ENUM | 账户状态：`active`, `pending`, `banned` | NOT NULL, DEFAULT 'active' |
| `notificationEnabled` | BOOLEAN | 是否启用通知 | NOT NULL, DEFAULT true |
| `createdAt` | TIMESTAMP | 创建时间 | NOT NULL, DEFAULT NOW() |
| `updatedAt` | TIMESTAMP | 更新时间 | NOT NULL, ON UPDATE NOW() |
| `lastSignedIn` | TIMESTAMP | 最后登录时间 | NOT NULL, DEFAULT NOW() |

**索引**:
- `role_idx`: 基于 `role` 字段
- `status_idx`: 基于 `status` 字段

---

### 2. 学生档案表 (`student_profiles`)

**作用**: 存储学生的详细个人信息和技能档案

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| `id` | INT | 主键，自增 | PRIMARY KEY |
| `user_id` | INT | 关联用户ID | FOREIGN KEY → `users.id` (CASCADE DELETE) |
| `student_id` | VARCHAR(50) | 学号 | - |
| `grade` | VARCHAR(20) | 年级 | - |
| `major` | VARCHAR(100) | 专业 | - |
| `gpa` | VARCHAR(10) | 绩点 | - |
| `resume_url` | TEXT | 简历文件URL | - |
| `resume_key` | TEXT | 简历文件存储key（S3） | - |
| `skills` | TEXT | 技能标签（JSON格式） | - |
| `research_interests` | TEXT | 研究兴趣 | - |
| `project_experience` | TEXT | 项目经验描述（自由文本） | - |
| `project_links` | TEXT | 项目链接列表（JSON数组：`[{ name, url }]`） | - |
| `available_time` | VARCHAR(50) | 可用时间 | - |
| `status` | ENUM | 当前状态：`idle`, `internship` | NOT NULL, DEFAULT 'idle' |
| `created_at` | TIMESTAMP | 创建时间 | NOT NULL, DEFAULT NOW() |
| `updated_at` | TIMESTAMP | 更新时间 | NOT NULL, ON UPDATE NOW() |

**索引**:
- `user_idx`: 基于 `user_id` 字段
- `status_idx`: 基于 `status` 字段

**外键关系**:
- `user_id` → `users.id` (级联删除)

---

### 3. 教师信息表 (`teacher_profiles`)

**作用**: 存储教师的详细个人信息

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| `id` | INT | 主键，自增 | PRIMARY KEY |
| `user_id` | INT | 关联用户ID | FOREIGN KEY → `users.id` (CASCADE DELETE) |
| `employee_id` | VARCHAR(50) | 工号 | - |
| `title` | VARCHAR(100) | 职称 | - |
| `department` | VARCHAR(100) | 所属学院 | - |
| `research_direction` | TEXT | 研究方向 | - |
| `achievements` | TEXT | 科研成果（JSON格式） | - |
| `avatar_url` | TEXT | 头像URL | - |
| `created_at` | TIMESTAMP | 创建时间 | NOT NULL, DEFAULT NOW() |
| `updated_at` | TIMESTAMP | 更新时间 | NOT NULL, ON UPDATE NOW() |

**索引**:
- `user_idx`: 基于 `user_id` 字段

**外键关系**:
- `user_id` → `users.id` (级联删除)

---

### 4. 科研项目表 (`projects`)

**作用**: 存储教师发布的科研项目信息

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| `id` | INT | 主键，自增 | PRIMARY KEY |
| `teacher_id` | INT | 发布教师ID | FOREIGN KEY → `users.id` (CASCADE DELETE) |
| `title` | VARCHAR(200) | 项目标题 | NOT NULL |
| `description` | TEXT | 项目详细描述（支持Markdown） | NOT NULL |
| `department` | VARCHAR(100) | 所属学院 | - |
| `research_field` | VARCHAR(100) | 科研方向 | - |
| `requirements` | TEXT | 任务要求（JSON格式） | - |
| `required_skills` | TEXT | 所需技能（JSON格式） | - |
| `duration` | VARCHAR(50) | 实习时长 | - |
| `start_date` | TIMESTAMP | 开始日期 | - |
| `end_date` | TIMESTAMP | 结束日期 | - |
| `recruit_count` | INT | 招募人数 | DEFAULT 1 |
| `current_count` | INT | 当前已招募人数 | DEFAULT 0 |
| `status` | ENUM | 项目状态：`draft`, `pending_review`, `published`, `rejected`, `closed` | NOT NULL, DEFAULT 'draft' |
| `view_count` | INT | 浏览次数 | DEFAULT 0 |
| `created_at` | TIMESTAMP | 创建时间 | NOT NULL, DEFAULT NOW() |
| `updated_at` | TIMESTAMP | 更新时间 | NOT NULL, ON UPDATE NOW() |

**索引**:
- `teacher_idx`: 基于 `teacher_id` 字段
- `status_idx`: 基于 `status` 字段
- `field_idx`: 基于 `research_field` 字段

**外键关系**:
- `teacher_id` → `users.id` (级联删除)

---

### 5. 申请记录表 (`applications`)

**作用**: 存储学生对项目的申请记录

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| `id` | INT | 主键，自增 | PRIMARY KEY |
| `project_id` | INT | 申请的项目ID | FOREIGN KEY → `projects.id` (CASCADE DELETE) |
| `student_id` | INT | 申请学生ID | FOREIGN KEY → `users.id` (CASCADE DELETE) |
| `statement` | TEXT | 申请陈述（支持Markdown） | - |
| `status` | ENUM | 申请状态：`submitted`, `screening_passed`, `interview_scheduled`, `accepted`, `rejected` | NOT NULL, DEFAULT 'submitted' |
| `teacher_feedback` | TEXT | 教师反馈（支持Markdown） | - |
| `match_score` | INT | AI匹配度分数（0-100） | - |
| `match_analysis` | TEXT | 匹配分析详情（JSON格式） | - |
| `interview_time` | TIMESTAMP | 面试时间 | - |
| `created_at` | TIMESTAMP | 创建时间 | NOT NULL, DEFAULT NOW() |
| `updated_at` | TIMESTAMP | 更新时间 | NOT NULL, ON UPDATE NOW() |

**索引**:
- `project_idx`: 基于 `project_id` 字段
- `student_idx`: 基于 `student_id` 字段
- `status_idx`: 基于 `status` 字段

**外键关系**:
- `project_id` → `projects.id` (级联删除)
- `student_id` → `users.id` (级联删除)

---

### 6. 实习进度表 (`internship_progress`)

**作用**: 跟踪学生实习阶段的进度和评价

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| `id` | INT | 主键，自增 | PRIMARY KEY |
| `application_id` | INT | 关联的申请ID | FOREIGN KEY → `applications.id` (CASCADE DELETE) |
| `stage` | ENUM | 实习阶段：`onboarding`, `ongoing`, `paused`, `literature_review`, `code_reproduction`, `experiment_improvement`, `completed` | NOT NULL, DEFAULT 'onboarding' |
| `weekly_reports` | TEXT | 周报记录（JSON格式） | - |
| `stage_evaluations` | TEXT | 阶段评价（JSON格式） | - |
| `final_score` | INT | 最终评分 | - |
| `created_at` | TIMESTAMP | 创建时间 | NOT NULL, DEFAULT NOW() |
| `updated_at` | TIMESTAMP | 更新时间 | NOT NULL, ON UPDATE NOW() |

**索引**:
- `application_idx`: 基于 `application_id` 字段

**外键关系**:
- `application_id` → `applications.id` (级联删除)

**周报JSON结构**:
```json
[
  {
    "week": 1,
    "content": "周报内容",
    "createdAt": "2024-01-01T00:00:00Z",
    "teacherFeedback": "教师反馈",
    "teacherId": 1,
    "feedbackAt": "2024-01-02T00:00:00Z"
  }
]
```

---

### 7. 系统通知表 (`notifications`)

**作用**: 存储系统向用户发送的通知消息

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| `id` | INT | 主键，自增 | PRIMARY KEY |
| `user_id` | INT | 接收用户ID | FOREIGN KEY → `users.id` (CASCADE DELETE) |
| `type` | VARCHAR(50) | 通知类型 | NOT NULL |
| `title` | VARCHAR(200) | 通知标题 | NOT NULL |
| `content` | TEXT | 通知内容 | NOT NULL |
| `related_id` | INT | 关联的记录ID（如项目ID、申请ID） | - |
| `is_read` | BOOLEAN | 是否已读 | NOT NULL, DEFAULT false |
| `created_at` | TIMESTAMP | 创建时间 | NOT NULL, DEFAULT NOW() |

**索引**:
- `user_idx`: 基于 `user_id` 字段
- `read_idx`: 基于 `is_read` 字段

**外键关系**:
- `user_id` → `users.id` (级联删除)

---

### 8. AI匹配缓存表 (`match_cache`)

**作用**: 缓存AI计算的匹配结果，提高查询性能

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| `id` | INT | 主键，自增 | PRIMARY KEY |
| `student_id` | INT | 学生ID | FOREIGN KEY → `users.id` (CASCADE DELETE) |
| `project_id` | INT | 项目ID | FOREIGN KEY → `projects.id` (CASCADE DELETE) |
| `match_score` | INT | 匹配分数 | NOT NULL |
| `match_details` | TEXT | 匹配详情（JSON格式） | NOT NULL |
| `created_at` | TIMESTAMP | 创建时间 | NOT NULL, DEFAULT NOW() |
| `expires_at` | TIMESTAMP | 缓存过期时间 | NOT NULL |

**索引**:
- `student_project_idx`: 联合索引 (`student_id`, `project_id`)
- `expires_idx`: 基于 `expires_at` 字段

**外键关系**:
- `student_id` → `users.id` (级联删除)
- `project_id` → `projects.id` (级联删除)

---

### 9. 系统统计表 (`system_stats`)

**作用**: 存储系统监控和统计数据

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| `id` | INT | 主键，自增 | PRIMARY KEY |
| `date` | TIMESTAMP | 统计日期 | NOT NULL |
| `active_students` | INT | 活跃学生数 | DEFAULT 0 |
| `active_teachers` | INT | 活跃教师数 | DEFAULT 0 |
| `new_applications` | INT | 新申请数 | DEFAULT 0 |
| `match_success_rate` | INT | 匹配成功率（百分比） | DEFAULT 0 |
| `api_token_usage` | INT | API Token消耗 | DEFAULT 0 |
| `created_at` | TIMESTAMP | 创建时间 | NOT NULL, DEFAULT NOW() |

**索引**:
- `date_idx`: 基于 `date` 字段

---

## 🔗 表关系图

```
┌─────────────┐
│    users    │ (核心用户表)
└──────┬──────┘
       │
       ├─────────────────┬─────────────────┐
       │                 │                 │
       ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│student_profiles│  │teacher_profiles│  │  projects   │
└──────────────┘  └──────┬───────┘  └──────┬───────┘
                         │                 │
                         │                 │
                    ┌────▼─────────────────▼────┐
                    │      applications          │
                    └────┬───────────────────────┘
                         │
                         ▼
                    ┌─────────────────────┐
                    │internship_progress  │
                    └─────────────────────┘

┌─────────────┐
│    users    │
└──────┬──────┘
       │
       ├─────────────────┬─────────────────┐
       │                 │                 │
       ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ notifications│  │  match_cache │  │ system_stats │
└──────────────┘  └──────────────┘  └──────────────┘
```

---

## 🔑 外键关系总结

| 子表 | 外键字段 | 父表 | 级联操作 |
|------|---------|------|---------|
| `student_profiles` | `user_id` | `users` | CASCADE DELETE |
| `teacher_profiles` | `user_id` | `users` | CASCADE DELETE |
| `projects` | `teacher_id` | `users` | CASCADE DELETE |
| `applications` | `project_id` | `projects` | CASCADE DELETE |
| `applications` | `student_id` | `users` | CASCADE DELETE |
| `internship_progress` | `application_id` | `applications` | CASCADE DELETE |
| `notifications` | `user_id` | `users` | CASCADE DELETE |
| `match_cache` | `student_id` | `users` | CASCADE DELETE |
| `match_cache` | `project_id` | `projects` | CASCADE DELETE |

---

## 📝 JSON字段说明

### `student_profiles.skills`
```json
["Python", "机器学习", "深度学习", "数据分析"]
```

### `student_profiles.project_links`
```json
[
  { "name": "项目A", "url": "https://github.com/user/project-a" },
  { "name": "项目B", "url": "https://github.com/user/project-b" }
]
```

### `teacher_profiles.achievements`
```json
{
  "papers": ["论文1", "论文2"],
  "projects": ["项目1", "项目2"],
  "awards": ["奖项1", "奖项2"]
}
```

### `projects.requirements`
```json
{
  "tasks": ["任务1", "任务2"],
  "deliverables": ["交付物1", "交付物2"]
}
```

### `projects.required_skills`
```json
["Python", "TensorFlow", "PyTorch"]
```

### `applications.match_analysis`
```json
{
  "skillMatch": 85,
  "interestMatch": 90,
  "experienceMatch": 75,
  "details": "详细分析..."
}
```

### `internship_progress.weekly_reports`
```json
[
  {
    "week": 1,
    "content": "本周工作内容...",
    "createdAt": "2024-01-01T00:00:00Z",
    "teacherFeedback": "教师反馈内容",
    "teacherId": 1,
    "feedbackAt": "2024-01-02T00:00:00Z"
  }
]
```

### `internship_progress.stage_evaluations`
```json
[
  {
    "stage": "literature_review",
    "score": 85,
    "comment": "评价内容",
    "evaluatedAt": "2024-01-01T00:00:00Z"
  }
]
```

### `match_cache.match_details`
```json
{
  "skillMatch": 85,
  "interestMatch": 90,
  "experienceMatch": 75,
  "reasoning": "匹配原因分析..."
}
```

---

## 🎯 数据流说明

### 1. 用户注册流程
```
users (创建用户)
  ↓
student_profiles / teacher_profiles (创建对应档案)
```

### 2. 项目申请流程
```
projects (教师发布项目)
  ↓
applications (学生申请)
  ↓
internship_progress (申请通过后开始实习)
```

### 3. 匹配计算流程
```
student_profiles + projects
  ↓
AI匹配计算
  ↓
match_cache (缓存结果)
  ↓
applications.match_score (更新申请记录)
```

---

## 🔍 查询优化建议

1. **常用查询场景**:
   - 按角色查询用户：使用 `role_idx` 索引
   - 按状态查询申请：使用 `status_idx` 索引
   - 查询学生的所有申请：使用 `student_idx` 索引
   - 查询项目的所有申请：使用 `project_idx` 索引

2. **关联查询**:
   - 查询申请时，通常需要 JOIN `users` 和 `student_profiles` 获取学生信息
   - 查询项目时，通常需要 JOIN `users` 获取教师信息

3. **缓存策略**:
   - `match_cache` 表用于缓存AI匹配结果，减少重复计算
   - 定期清理过期的缓存记录（基于 `expires_at`）

---

## 📚 相关文件

- **Schema定义**: `drizzle/schema.ts`
- **迁移文件**: `drizzle/*.sql`
- **Repository层**: `server/repositories/*.ts`
- **路由层**: `server/routes/*.ts`

---

## 🔄 数据库迁移

### 查看当前迁移状态
```bash
pnpm db:studio  # 打开Drizzle Studio查看数据库
```

### 推送Schema变更到数据库
```bash
pnpm db:push    # 将schema.ts的变更推送到数据库
```

### 生成迁移文件
```bash
pnpm db:generate  # 生成迁移SQL文件
```

---

*最后更新: 2024年*

