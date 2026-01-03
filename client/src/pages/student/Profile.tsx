import { SystemLayout } from "@/components/SystemLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Upload, Loader2, FileText, Plus, Trash2 } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { toast } from "sonner";

type ProjectLink = {
  name: string;
  url: string;
};

export default function StudentProfile() {
  const { data: profile, isLoading } = trpc.studentProfile.get.useQuery();
  const createMutation = trpc.studentProfile.create.useMutation();
  const updateMutation = trpc.studentProfile.update.useMutation();
  const uploadResumeMutation = trpc.studentProfile.uploadResume.useMutation();
  const utils = trpc.useUtils();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    studentId: "",
    grade: "",
    major: "",
    gpa: "",
    skills: "",
    researchInterests: "",
    projectExperience: "",
    availableTime: "",
  });

  const [projectLinks, setProjectLinks] = useState<ProjectLink[]>([]);

  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "parsing" | "success">("idle");

  useEffect(() => {
    if (profile) {
      setFormData({
        studentId: profile.studentId || "",
        grade: profile.grade || "",
        major: profile.major || "",
        gpa: profile.gpa || "",
        skills: profile.skills || "",
        researchInterests: profile.researchInterests || "",
        projectExperience: profile.projectExperience || "",
        availableTime: profile.availableTime || "",
      });

      // 解析项目链接（JSON 数组）
      if (profile.projectLinks) {
        try {
          const parsed = JSON.parse(profile.projectLinks) as ProjectLink[];
          if (Array.isArray(parsed)) {
            setProjectLinks(
              parsed.filter((p) => p && (p.name?.trim() || p.url?.trim()))
            );
          }
        } catch {
          // 旧数据或非 JSON，忽略
          setProjectLinks([]);
        }
      } else {
        setProjectLinks([]);
      }
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const payload = {
        ...formData,
        projectLinks:
          projectLinks.length > 0
            ? JSON.stringify(
                projectLinks.filter((p) => p.name.trim() || p.url.trim())
              )
            : undefined,
      };

      if (profile) {
        await updateMutation.mutateAsync(payload);
        toast.success("档案更新成功");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("档案创建成功");
      }
      utils.studentProfile.get.invalidate();
    } catch (error) {
      toast.error("保存失败,请重试");
    }
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      toast.error("仅支持PDF格式文件");
      return;
    }

    // 验证文件大小 (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("文件大小不能超过10MB");
      return;
    }

    try {
      setUploadStatus("uploading");
      
      // 读取文件并转换为Base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      setUploadStatus("parsing");
      
      // 调用上传接口
      const result = await uploadResumeMutation.mutateAsync({
        file: base64,
        fileName: file.name,
        fileSize: file.size,
      });

      // 自动填充表单
      if (result.parsedData) {
        setFormData((prev) => ({
          ...prev,
          ...(result.parsedData.studentId && { studentId: result.parsedData.studentId }),
          ...(result.parsedData.grade && { grade: result.parsedData.grade }),
          ...(result.parsedData.major && { major: result.parsedData.major }),
          ...(result.parsedData.gpa && { gpa: result.parsedData.gpa }),
          ...(result.parsedData.skills && { skills: result.parsedData.skills }),
          ...(result.parsedData.researchInterests && { researchInterests: result.parsedData.researchInterests }),
          ...(result.parsedData.projectExperience && { projectExperience: result.parsedData.projectExperience }),
          ...(result.parsedData.availableTime && { availableTime: result.parsedData.availableTime }),
        }));

        // 暂不自动填充 projectLinks，避免误判链接
      }

      setUploadStatus("success");
      toast.success("简历上传成功，已自动填充信息");
      
      // 刷新档案数据
      utils.studentProfile.get.invalidate();
      
      // 重置文件输入
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      setUploadStatus("idle");
      toast.error(
        error instanceof Error 
          ? error.message 
          : "简历上传失败，请重试"
      );
    }
  };

  if (isLoading) {
    return (
      <SystemLayout>
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground mt-3">加载中...</p>
        </div>
      </SystemLayout>
    );
  }

  return (
    <SystemLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 页面标题 */}
        <div>
          <h1 className="text-3xl font-bold mb-2">个人档案</h1>
          <p className="text-muted-foreground">完善您的个人信息,获得更精准的项目推荐</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 基本信息 */}
          <Card>
            <CardHeader>
              <CardTitle>基本信息</CardTitle>
              <CardDescription>填写您的基本学业信息</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="studentId">学号</Label>
                  <Input
                    id="studentId"
                    value={formData.studentId}
                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                    placeholder="请输入学号"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="grade">年级</Label>
                  <Input
                    id="grade"
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    placeholder="如: 2021级"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="major">专业</Label>
                  <Input
                    id="major"
                    value={formData.major}
                    onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                    placeholder="如: 计算机科学与技术"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gpa">绩点</Label>
                  <Input
                    id="gpa"
                    value={formData.gpa}
                    onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
                    placeholder="如: 3.8/4.0"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 技能与兴趣 */}
          <Card>
            <CardHeader>
              <CardTitle>技能与研究兴趣</CardTitle>
              <CardDescription>详细描述您的技能和研究方向</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="skills">技能标签</Label>
                <Input
                  id="skills"
                  value={formData.skills}
                  onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                  placeholder="如: Python, 机器学习, 数据分析 (用逗号分隔)"
                />
                <p className="text-xs text-muted-foreground">
                  请用逗号分隔不同的技能,这将帮助AI更好地为您匹配项目
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="researchInterests">研究兴趣</Label>
                <Textarea
                  id="researchInterests"
                  value={formData.researchInterests}
                  onChange={(e) => setFormData({ ...formData, researchInterests: e.target.value })}
                  placeholder="描述您感兴趣的研究领域和方向..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="projectExperience">项目经验</Label>
                <Textarea
                  id="projectExperience"
                  value={formData.projectExperience}
                  onChange={(e) => setFormData({ ...formData, projectExperience: e.target.value })}
                  placeholder="描述您参与过的项目经验..."
                  rows={4}
                />
              </div>

              {/* 项目链接（GitHub 等） */}
              <div className="space-y-2">
                <Label>项目链接（GitHub 等，可选）</Label>
                <p className="text-xs text-muted-foreground mb-1">
                  为每个项目填写一个名称和链接。老师端将只显示项目名称，点击后跳转到对应链接。
                </p>
                <div className="space-y-2">
                  {projectLinks.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      当前没有项目链接，点击下方“添加项目”开始添加。
                    </p>
                  )}
                  {projectLinks.map((link, index) => (
                    <div
                      key={index}
                      className="flex flex-col md:flex-row gap-2 items-start md:items-center"
                    >
                      <Input
                        className="md:w-1/3"
                        placeholder="项目名称，如：多模态推荐系统"
                        value={link.name}
                        onChange={(e) => {
                          const next = [...projectLinks];
                          next[index] = { ...next[index], name: e.target.value };
                          setProjectLinks(next);
                        }}
                      />
                      <Input
                        className="md:flex-1"
                        placeholder="项目链接，如：https://github.com/xxx/project"
                        value={link.url}
                        onChange={(e) => {
                          const next = [...projectLinks];
                          next[index] = { ...next[index], url: e.target.value };
                          setProjectLinks(next);
                        }}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => {
                          setProjectLinks(projectLinks.filter((_, i) => i !== index));
                        }}
                        aria-label="删除项目"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-1"
                  onClick={() =>
                    setProjectLinks((prev) => [...prev, { name: "", url: "" }])
                  }
                >
                  <Plus className="w-4 h-4 mr-1" />
                  添加项目
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="availableTime">可用时间</Label>
                <Input
                  id="availableTime"
                  value={formData.availableTime}
                  onChange={(e) => setFormData({ ...formData, availableTime: e.target.value })}
                  placeholder="如: 每周20小时"
                />
              </div>
            </CardContent>
          </Card>

          {/* 简历上传 */}
          <Card>
            <CardHeader>
              <CardTitle>简历上传</CardTitle>
              <CardDescription>上传您的简历,AI将自动解析您的技能档案</CardDescription>
            </CardHeader>
            <CardContent>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                {uploadStatus === "uploading" || uploadStatus === "parsing" ? (
                  <>
                    <Loader2 className="w-12 h-12 mx-auto mb-3 text-primary animate-spin" />
                    <p className="text-sm text-muted-foreground mb-2">
                      {uploadStatus === "uploading" ? "正在上传简历..." : "AI正在解析您的简历..."}
                    </p>
                  </>
                ) : (
                  <>
                    <Upload className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-4">
                      支持 PDF 格式,文件大小不超过 10MB
                    </p>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleFileUpload}
                      disabled={uploadStatus === "uploading" || uploadStatus === "parsing"}
                    >
                      选择文件
                    </Button>
                  </>
                )}
              </div>
              {profile?.resumeUrl && (
                <div className="mt-4 p-3 bg-accent/50 rounded-lg flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  <p className="text-sm">
                    已上传简历:{" "}
                    <a 
                      href={profile.resumeUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      查看
                    </a>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 提交按钮 */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline">
              取消
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending ? "保存中..." : "保存档案"}
            </Button>
          </div>
        </form>
      </div>
    </SystemLayout>
  );
}
