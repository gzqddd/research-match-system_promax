import { SystemLayout } from "@/components/SystemLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Streamdown } from "streamdown";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const statusMeta: Record<
  "submitted" | "screening_passed" | "interview_scheduled" | "accepted" | "rejected",
  { label: string; color: string }
> = {
  submitted: { label: "待审核", color: "bg-amber-100 text-amber-800" },
  screening_passed: { label: "通过筛选", color: "bg-blue-100 text-blue-800" },
  interview_scheduled: { label: "已约面试", color: "bg-indigo-100 text-indigo-800" },
  accepted: { label: "已录取", color: "bg-emerald-100 text-emerald-800" },
  rejected: { label: "已拒绝", color: "bg-rose-100 text-rose-800" },
};

export default function TeacherApplications() {
  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.application.listByTeacher.useQuery({});
  const updateMutation = trpc.application.updateStatus.useMutation({
    onSuccess: async () => {
      await utils.application.listByTeacher.invalidate();
      toast.success("状态已更新");
    },
    onError: (err) => toast.error(err.message || "操作失败"),
  });

  const handleUpdate = (id: number, status: keyof typeof statusMeta) => {
    updateMutation.mutate({ id, status });
  };

  return (
    <SystemLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">申请审核</h1>
          <p className="text-muted-foreground">查看并处理学生的项目申请</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>申请列表</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading && <div className="text-sm text-muted-foreground">加载中...</div>}
            {!isLoading && (data?.length ?? 0) === 0 && (
              <div className="text-sm text-muted-foreground">暂无申请</div>
            )}
            {(data ?? []).map((row) => {
              const { application: item, studentProfile, user } = row as any;
              const hasResume = !!studentProfile?.resumeUrl;
              const displayName = user?.name || `#${item.studentId}`;
              return (
                <div key={item.id} className="rounded-lg border border-border p-4 bg-card">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-lg">申请人 {displayName}</span>
                      <Badge variant="secondary">项目 #{item.projectId}</Badge>
                    </div>
                    {studentProfile && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {studentProfile.major && <span>专业：{studentProfile.major}；</span>}
                        {studentProfile.grade && <span>年级：{studentProfile.grade}；</span>}
                        {studentProfile.gpa && <span>绩点：{studentProfile.gpa}</span>}
                      </p>
                    )}
                    {/* 项目链接列表（仅显示名称，点击跳转） */}
                    {studentProfile?.projectLinks && (() => {
                      try {
                        const links = JSON.parse(
                          studentProfile.projectLinks
                        ) as { name: string; url: string }[];
                        if (!Array.isArray(links) || links.length === 0) return null;
                        return (
                          <div className="mt-1 flex flex-wrap gap-2">
                            {links
                              .filter((p) => p && (p.name?.trim() || p.url?.trim()))
                              .map((p, idx) => (
                                <Button
                                  key={idx}
                                  type="button"
                                  size="xs"
                                  variant="outline"
                                  className="text-xs"
                                  onClick={() => {
                                    if (p.url) {
                                      window.open(p.url, "_blank");
                                    }
                                  }}
                                >
                                  {p.name || "未命名项目"}
                                </Button>
                              ))}
                          </div>
                        );
                      } catch {
                        return null;
                      }
                    })()}
                    {typeof item.matchScore === "number" && (
                      <p className="text-sm text-muted-foreground mt-1">
                        AI 评分：{item.matchScore}
                      </p>
                    )}
                    {/* 申请陈述改为弹窗按钮查看，避免占满列表 */}
                    {item.statement && (
                      <div className="mt-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              查看申请陈述
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>申请陈述</DialogTitle>
                            </DialogHeader>
                            <div className="mt-2 max-h-[60vh] overflow-y-auto prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
                              <Streamdown>{item.statement}</Streamdown>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`text-xs font-medium px-2 py-1 rounded ${statusMeta[item.status].color}`}>
                      {statusMeta[item.status].label}
                    </span>
                    <div className="flex flex-wrap gap-2 justify-end">
                      {hasResume && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(studentProfile.resumeUrl, "_blank")}
                        >
                          查看简历
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={updateMutation.isPending}
                        onClick={() => handleUpdate(item.id, "screening_passed")}
                      >
                        通过筛选
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={updateMutation.isPending}
                        onClick={() => handleUpdate(item.id, "interview_scheduled")}
                      >
                        约面试
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={updateMutation.isPending}
                        onClick={() => handleUpdate(item.id, "accepted")}
                      >
                        录取
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        disabled={updateMutation.isPending}
                        onClick={() => handleUpdate(item.id, "rejected")}
                      >
                        拒绝
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              );
            })}
          </CardContent>
        </Card>

        <Separator />

        <Card>
          <CardHeader>
            <CardTitle>审核指南</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>1. 优先查看 AI 评分高的申请，核对匹配度亮点。</p>
            <p>2. 合适的申请设置为「通过筛选」或「约面试」，并与学生沟通时间。</p>
            <p>3. 确认人选后更新为「已录取」，否则标记为「已拒绝」。</p>
          </CardContent>
        </Card>
      </div>
    </SystemLayout>
  );
}

