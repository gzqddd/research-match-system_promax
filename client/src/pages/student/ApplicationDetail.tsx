import { SystemLayout } from "@/components/SystemLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useRoute, Link } from "wouter";
import { Loader2 } from "lucide-react";
import { Streamdown } from "streamdown";

const statusMeta: Record<
  "submitted" | "screening_passed" | "interview_scheduled" | "accepted" | "rejected",
  { label: string; color: string }
> = {
  submitted: { label: "已提交", color: "bg-blue-100 text-blue-800" },
  screening_passed: { label: "初筛通过", color: "bg-green-100 text-green-800" },
  interview_scheduled: { label: "面试中", color: "bg-purple-100 text-purple-800" },
  accepted: { label: "已录用", color: "bg-emerald-100 text-emerald-800" },
  rejected: { label: "已婉拒", color: "bg-gray-100 text-gray-800" },
};

export default function ApplicationDetail() {
  const [, params] = useRoute("/applications/:id");
  const applicationId = params?.id ? Number(params.id) : NaN;

  const { data, isLoading } = trpc.application.getMyById.useQuery(
    { id: applicationId },
    { enabled: Number.isFinite(applicationId) }
  );

  const progressQuery = trpc.internship.getProgress.useQuery(
    { applicationId },
    { enabled: Number.isFinite(applicationId) }
  );

  const application = data?.application;
  const project = data?.project ?? null;
  const progress = progressQuery.data;

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

  return (
    <SystemLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">申请详情</h1>
            <p className="text-muted-foreground">
              查看您对项目「{project?.title ?? `#${application?.projectId ?? ""}`}」的申请进度
            </p>
          </div>
          <Link href="/my-applications">
            <span className="text-sm text-primary cursor-pointer">返回我的申请</span>
          </Link>
        </div>

        <Card>
          <CardHeader>
            {isLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                正在加载申请详情...
              </div>
            ) : application ? (
              <>
                <CardTitle className="text-xl mb-2">
                  {project?.title ?? `申请 #${application.id}`}
                </CardTitle>
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <span>申请时间：{formatDateTime(application.createdAt)}</span>
                  <span>当前状态：</span>
                  <Badge className={statusMeta[application.status].color}>
                    {statusMeta[application.status].label}
                  </Badge>
                  {typeof application.matchScore === "number" && (
                    <Badge
                      className={
                        application.matchScore >= 80
                          ? "bg-green-100 text-green-800"
                          : application.matchScore >= 60
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }
                    >
                      匹配度 {application.matchScore}%
                    </Badge>
                  )}
                </div>
              </>
            ) : (
              <div className="text-muted-foreground">未找到该申请记录。</div>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {application?.statement && (
              <section>
                <h2 className="font-semibold mb-2">我的申请陈述</h2>
                <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
                  <Streamdown>{application.statement}</Streamdown>
                </div>
              </section>
            )}

            {application?.teacherFeedback && (
              <section>
                <h2 className="font-semibold mb-2">导师反馈</h2>
                <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
                  <Streamdown>{application.teacherFeedback}</Streamdown>
                </div>
              </section>
            )}

            {application?.matchAnalysis && (
              <section>
                <h2 className="font-semibold mb-2">AI 匹配分析</h2>
                <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
                  <Streamdown>{application.matchAnalysis}</Streamdown>
                </div>
              </section>
            )}

            {progress && (
              <section>
                <h2 className="font-semibold mb-2">当前实习进度</h2>
                <p className="text-sm text-muted-foreground">
                  阶段：{progress.stage}
                  {typeof progress.finalScore === "number" && ` ｜ 最终评分：${progress.finalScore}`}
                </p>
              </section>
            )}

            {weeklyReports.length > 0 && (
              <section>
                <h2 className="font-semibold mb-2">周报记录</h2>
                <div className="space-y-3">
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
                </div>
              </section>
            )}
          </CardContent>
        </Card>
      </div>
    </SystemLayout>
  );
}


