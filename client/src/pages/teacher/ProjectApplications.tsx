import { SystemLayout } from "@/components/SystemLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { useRoute, Link } from "wouter";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

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

export default function ProjectApplications() {
  const [, params] = useRoute("/teacher/projects/:id/applications");
  const projectId = params?.id ? Number(params.id) : NaN;

  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.application.projectApplications.useQuery(
    { projectId },
    { enabled: Number.isFinite(projectId) }
  );
  const { data: project } = trpc.project.getById.useQuery(
    { id: projectId },
    { enabled: Number.isFinite(projectId) }
  );

  const aiBestMutation = trpc.ai.bestApplicantsForProject.useMutation();
  const [aiDialogOpen, setAiDialogOpen] = useState(false);

  const updateMutation = trpc.application.updateStatus.useMutation({
    onSuccess: async () => {
      await utils.application.projectApplications.invalidate({ projectId });
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
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">项目申请列表</h1>
            <p className="text-muted-foreground">
              查看并处理项目「{project?.title ?? `#${projectId || ""}`}」的学生申请
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!Number.isFinite(projectId) || aiBestMutation.isPending}
                  onClick={async (e) => {
                    e.preventDefault();
                    if (!Number.isFinite(projectId)) return;
                    try {
                      await aiBestMutation.mutateAsync({
                        projectId,
                        topN: 5,
                      });
                      setAiDialogOpen(true);
                    } catch (err: any) {
                      toast.error(err?.message || "AI 分析失败，请稍后重试");
                    }
                  }}
                >
                  {aiBestMutation.isPending ? (
                    <span className="flex items-center gap-1">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      AI 分析中...
                    </span>
                  ) : (
                    "AI 分析最匹配申请人"
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>AI 申请人分析</DialogTitle>
                </DialogHeader>
                <div className="mt-2 space-y-3 max-h-[70vh] overflow-y-auto">
                  {aiBestMutation.isPending && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      正在根据申请数据进行智能分析，请稍候...
                    </div>
                  )}
                  {!aiBestMutation.isPending && aiBestMutation.data && (
                    <>
                      <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
                        <Streamdown>{aiBestMutation.data.analysis}</Streamdown>
                      </div>
                      {aiBestMutation.data.applicants?.length > 0 && (
                        <div className="text-xs text-muted-foreground">
                          <p className="font-medium mb-1">本次分析使用的候选人数据：</p>
                          <ul className="list-disc pl-4 space-y-1">
                            {aiBestMutation.data.applicants.map((a: any) => (
                              <li key={a.applicationId}>
                                {a.name}（应用ID #{a.applicationId}）
                                {typeof a.matchScore === "number" && `，AI 评分：${a.matchScore}`}
                                {a.gpa && `，GPA：${a.gpa}`}
                                {a.major && `，专业：${a.major}`}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  )}
                  {!aiBestMutation.isPending &&
                    !aiBestMutation.data && (
                      <div className="text-sm text-muted-foreground">
                        暂无可用的 AI 分析结果。
                      </div>
                    )}
                </div>
              </DialogContent>
            </Dialog>
            <Link href="/teacher/projects">
              <Button variant="outline">返回我的项目</Button>
            </Link>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>申请记录</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                正在加载申请记录...
              </div>
            )}
            {!isLoading && (data?.length ?? 0) === 0 && (
              <div className="text-sm text-muted-foreground">当前项目暂无申请。</div>
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
                      <Badge variant="secondary">申请ID #{item.id}</Badge>
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
                      const links = JSON.parse(studentProfile.projectLinks) as { name: string; url: string }[];
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
                    {item.matchAnalysis && (
                      <div className="mt-1 text-xs text-muted-foreground prose prose-sm dark:prose-invert max-w-none">
                        <Streamdown>{item.matchAnalysis}</Streamdown>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded ${statusMeta[item.status].color}`}
                    >
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
      </div>
    </SystemLayout>
  );
}


