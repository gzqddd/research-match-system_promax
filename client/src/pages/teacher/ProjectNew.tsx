import { SystemLayout } from "@/components/SystemLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useState } from "react";
import { Link } from "wouter";

export default function ProjectNew() {
  const utils = trpc.useUtils();
  const createMutation = trpc.project.create.useMutation({
    onSuccess: async () => {
      toast.success("项目已创建");
      await utils.project.myProjects.invalidate();
    },
    onError: (err) => {
      toast.error(err.message || "创建项目失败");
    },
  });

  const expandMutation = trpc.ai.expandDescription.useMutation();

  const [title, setTitle] = useState("");
  const [keywords, setKeywords] = useState("");
  const [description, setDescription] = useState("");
  const [department, setDepartment] = useState("");
  const [researchField, setResearchField] = useState("");
  const [recruitCount, setRecruitCount] = useState<string>("1");

  const handleExpandDescription = async () => {
    if (!keywords.trim()) {
      toast.error("请先输入项目关键词");
      return;
    }
    try {
      const result = await expandMutation.mutateAsync({ keywords });
      setDescription(result.description);
    } catch {
      toast.error("AI 扩写失败，请稍后重试");
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      toast.error("请至少填写项目名称和项目描述");
      return;
    }

    const count = Number(recruitCount);

    await createMutation.mutateAsync({
      title,
      description,
      department: department || undefined,
      researchField: researchField || undefined,
      recruitCount: Number.isFinite(count) ? count : undefined,
      status: "published",
    });
  };

  return (
    <SystemLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">发布新项目</h1>
            <p className="text-muted-foreground">填写项目信息并一键发布到项目广场</p>
          </div>
          <Link href="/teacher/projects">
            <Button variant="outline">返回我的项目</Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>项目信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">项目名称</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="请输入项目名称"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">所属学院</label>
                <Input
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="如：计算机学院"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">研究方向</label>
                <Input
                  value={researchField}
                  onChange={(e) => setResearchField(e.target.value)}
                  placeholder="如：机器学习 / 数据挖掘"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">招募人数</label>
                <Input
                  type="number"
                  min={1}
                  value={recruitCount}
                  onChange={(e) => setRecruitCount(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">项目描述</label>
                <div className="flex gap-2">
                  <Input
                    className="h-8 w-52"
                    placeholder="输入关键词，让 AI 帮你扩写"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleExpandDescription}
                    disabled={expandMutation.isPending}
                  >
                    {expandMutation.isPending && (
                      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                    )}
                    AI 扩写
                  </Button>
                </div>
              </div>
              <Textarea
                rows={8}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="请详细说明项目背景、研究内容、预期成果等信息..."
              />
            </div>

            <Button
              onClick={handleSubmit}
              disabled={createMutation.isPending}
            >
              {createMutation.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              发布项目
            </Button>
          </CardContent>
        </Card>
      </div>
    </SystemLayout>
  );
}


