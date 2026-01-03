import { SystemLayout } from "@/components/SystemLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useRoute, Link } from "wouter";
import { toast } from "sonner";
import { useState } from "react";

export default function ProjectApply() {
  const [, params] = useRoute("/projects/:id/apply");
  const projectId = params?.id ? Number(params.id) : NaN;

  const { data: project, isLoading: projectLoading } = trpc.project.getById.useQuery(
    { id: projectId },
    { enabled: Number.isFinite(projectId) }
  );

  const statementMutation = trpc.ai.generateStatement.useMutation();
  const applyMutation = trpc.application.create.useMutation();

  const [statement, setStatement] = useState("");

  const handleGenerateStatement = async () => {
    if (!Number.isFinite(projectId)) return;
    try {
      const result = await statementMutation.mutateAsync({ projectId });
      setStatement(result.statement);
    } catch {
      toast.error("自动生成申请陈述失败，请稍后重试");
    }
  };

  const handleApply = async () => {
    if (!Number.isFinite(projectId) || !statement.trim()) {
      toast.error("请先填写申请陈述");
      return;
    }
    try {
      await applyMutation.mutateAsync({
        projectId,
        statement,
      });
      toast.success("申请已提交");
    } catch (error: any) {
      toast.error(error?.message ?? "申请失败，请稍后重试");
    }
  };

  return (
    <SystemLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">一键申请</h1>
            <p className="text-muted-foreground">完善申请陈述后提交本项目的申请</p>
          </div>
          <Link href={`/projects/${projectId}`}>
            <Button variant="outline">返回项目详情</Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            {projectLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                正在加载项目信息...
              </div>
            ) : project ? (
              <CardTitle className="text-xl">{project.title}</CardTitle>
            ) : (
              <div className="text-muted-foreground">未找到该项目或项目已下架。</div>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">申请陈述</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateStatement}
                  disabled={statementMutation.isPending || !project}
                >
                  {statementMutation.isPending && (
                    <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  )}
                  AI 自动生成
                </Button>
              </div>
              <Textarea
                rows={8}
                value={statement}
                onChange={(e) => setStatement(e.target.value)}
                placeholder="请介绍你的背景、动机与对项目的理解..."
              />
            </div>

            <Button
              onClick={handleApply}
              disabled={applyMutation.isPending || !project}
            >
              {applyMutation.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              提交申请
            </Button>
          </CardContent>
        </Card>
      </div>
    </SystemLayout>
  );
}


