import React from "react";
import { SystemLayout } from "@/components/SystemLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const stageLabel: Record<
  "literature_review" | "code_reproduction" | "experiment_improvement" | "completed" | "onboarding" | "ongoing" | "paused",
  string
> = {
  onboarding: "入职准备",
  ongoing: "进行中",
  paused: "暂停",
  literature_review: "文献调研",
  code_reproduction: "代码复现",
  experiment_improvement: "实验改进",
  completed: "已完成",
};

export default function TeacherInternships() {
  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.internship.listByTeacher.useQuery();
  const updateMutation = trpc.internship.updateStage.useMutation({
    onSuccess: async () => {
      await utils.internship.listByTeacher.invalidate();
      toast.success("进度已更新");
    },
    onError: (err) => toast.error(err.message || "操作失败"),
  });

  const handleUpdate = (applicationId: number, stage: keyof typeof stageLabel) => {
    updateMutation.mutate({ applicationId, stage });
  };

  const feedbackMutation = trpc.internship.addWeeklyFeedback.useMutation({
    onSuccess: async (_data, variables) => {
      await utils.internship.listByTeacher.invalidate();
      toast.success("反馈已保存");
    },
    onError: (err) => toast.error(err.message || "保存反馈失败"),
  });

  const parseWeeklyReports = (weeklyReports?: string | null) => {
    if (!weeklyReports) return [];
    try {
      const parsed = JSON.parse(weeklyReports);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

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

  return (
    <SystemLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">实习管理</h1>
          <p className="text-muted-foreground">跟踪学生实习进度，查看周报和阶段表现</p>
        </div>

        {isLoading && <div className="text-sm text-muted-foreground">加载中...</div>}
        {!isLoading && (data?.length ?? 0) === 0 && (
          <div className="text-sm text-muted-foreground">暂无实习记录</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(data ?? []).map((item) => {
            const reports = parseWeeklyReports(item.weeklyReports);
            const lastReport = reports.length > 0 ? reports[reports.length - 1] : null;

            return (
              <Card key={item.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>申请 #{item.applicationId}</span>
                    <Badge variant="secondary">{stageLabel[item.stage]}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm text-muted-foreground">
                    阶段：{stageLabel[item.stage]}
                  </div>
                  {typeof item.finalScore === "number" && (
                    <div className="text-sm text-muted-foreground">
                      最终评分：{item.finalScore}
                    </div>
                  )}
                  <Progress value={item.stage === "completed" ? 100 : 50} />

                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div>周报数量：{reports.length}</div>
                    {lastReport && (
                      <div>
                        <div className="text-xs">
                          最近周报时间：{formatDateTime(lastReport.createdAt)}
                        </div>
                        <div className="text-xs line-clamp-2">
                          最近周报摘要：{lastReport.content}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 周报列表 + 老师反馈入口 */}
                  {reports.length > 0 && (
                    <div className="space-y-2 text-xs text-muted-foreground border-t pt-2 mt-2">
                      <div className="font-medium text-foreground text-sm">周报与反馈</div>
                      {reports.map((report, index) => (
                        <div key={index} className="border rounded-md p-2 space-y-1 bg-muted/30">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs">
                              提交时间：{formatDateTime(report.createdAt)}
                            </span>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="xs">
                                  {report.teacherFeedback ? "编辑反馈" : "添加反馈"}
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-lg">
                                <DialogHeader>
                                  <DialogTitle>周报反馈</DialogTitle>
                                </DialogHeader>
                                <FeedbackForm
                                  applicationId={item.applicationId}
                                  index={index}
                                  report={report}
                                  onSaved={() => {
                                    // mutation 已经会刷新列表，这里只做提示
                                  }}
                                />
                              </DialogContent>
                            </Dialog>
                          </div>
                          {report.teacherFeedback && (
                            <div className="text-xs">
                              <span className="font-medium text-foreground">老师反馈：</span>
                              <span className="whitespace-pre-wrap">{report.teacherFeedback}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={updateMutation.isPending}
                      onClick={() => handleUpdate(item.applicationId, "ongoing")}
                    >
                      标记进行中
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={updateMutation.isPending}
                      onClick={() => handleUpdate(item.applicationId, "completed")}
                    >
                      标记完成
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={updateMutation.isPending}
                      onClick={() => handleUpdate(item.applicationId, "paused")}
                    >
                      暂停
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </SystemLayout>
  );
}

type FeedbackFormProps = {
  applicationId: number;
  index: number;
  report: {
    content: string;
    teacherFeedback?: string;
  };
  onSaved?: () => void;
};

function FeedbackForm({ applicationId, index, report }: FeedbackFormProps) {
  const utils = trpc.useUtils();
  const feedbackMutation = trpc.internship.addWeeklyFeedback.useMutation({
    onSuccess: async () => {
      await utils.internship.listByTeacher.invalidate();
      toast.success("反馈已保存");
    },
    onError: (err) => toast.error(err.message || "保存反馈失败"),
  });

  const [value, setValue] = React.useState(report.teacherFeedback ?? "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) {
      toast.error("反馈内容不能为空");
      return;
    }
    feedbackMutation.mutate({
      applicationId,
      index,
      feedback: trimmed,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 mt-2">
      <div>
        <div className="text-xs font-medium text-foreground mb-1">学生周报</div>
        <div className="text-xs text-muted-foreground max-h-32 overflow-y-auto whitespace-pre-wrap border rounded-md p-2 bg-background">
          {report.content}
        </div>
      </div>
      <div>
        <div className="text-xs font-medium text-foreground mb-1">老师反馈</div>
        <Textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="请输入对本周表现的评价或建议..."
          className="min-h-[120px] text-sm"
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="submit" size="sm" disabled={feedbackMutation.isPending}>
          {feedbackMutation.isPending ? "保存中..." : "保存反馈"}
        </Button>
      </div>
    </form>
  );
}

