import { SystemLayout } from "@/components/SystemLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { useRoute, Link } from "wouter";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export default function ApplicationReport() {
  const [, params] = useRoute("/applications/:id/report");
  const applicationId = params?.id ? Number(params.id) : NaN;

  const { data: detail, isLoading } = trpc.application.getMyById.useQuery(
    { id: applicationId },
    { enabled: Number.isFinite(applicationId) }
  );

  const progressQuery = trpc.internship.getProgress.useQuery(
    { applicationId },
    { enabled: Number.isFinite(applicationId) }
  );

  const submitMutation = trpc.internship.submitWeeklyReport.useMutation({
    onSuccess: async () => {
      await progressQuery.refetch();
      toast.success("周报已提交");
      setContent("");
    },
    onError: (err) => toast.error(err.message || "提交失败"),
  });

  const [content, setContent] = useState("");

  const progress = progressQuery.data;

  const parseWeeklyReports = () => {
    if (!progress?.weeklyReports) return [];
    try {
      const parsed = JSON.parse(progress.weeklyReports);
      if (Array.isArray(parsed)) return parsed;
      return [];
    } catch {
      return [];
    }
  };

  const weeklyReports = parseWeeklyReports() as Array<{ createdAt?: string; content?: string }>;

  const formatDateTime = (date: Date | string | null | undefined) => {
    if (!date) return "-";
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleSubmit = () => {
    if (!content.trim()) {
      toast.error("请先填写周报内容");
      return;
    }
    submitMutation.mutate({
      applicationId,
      content,
    });
  };

  return (
    <SystemLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">提交实习周报</h1>
            <p className="text-muted-foreground">
              为项目「{detail?.project?.title ?? `#${detail?.application?.projectId ?? ""}`}」记录本周的学习进展
            </p>
          </div>
          <Link href={`/applications/${applicationId}`}>
            <Button variant="outline">返回申请详情</Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>本周周报</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                正在加载申请信息...
              </div>
            )}

            <div className="space-y-2">
              <Textarea
                rows={8}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="请描述本周的学习内容、遇到的问题、解决方案以及下周计划..."
              />
              <div className="text-xs text-muted-foreground">
                建议从「本周完成」「遇到的困难」「收获与反思」「下周计划」几个方面来撰写。
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={submitMutation.isPending || !detail?.application}
            >
              {submitMutation.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              提交周报
            </Button>
          </CardContent>
        </Card>

        {weeklyReports.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>历史周报</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {weeklyReports.map((r, index) => (
                <div
                  key={index}
                  className="border border-border rounded-md p-3 bg-muted/40 text-sm text-muted-foreground"
                >
                  <div className="text-xs text-muted-foreground mb-1">
                    {formatDateTime(r.createdAt ?? "")}
                  </div>
                  <p className="whitespace-pre-wrap">{r.content}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </SystemLayout>
  );
}


