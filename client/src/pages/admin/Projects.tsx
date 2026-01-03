import { SystemLayout } from "@/components/SystemLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const statusMeta: Record<
  "draft" | "pending_review" | "published" | "rejected" | "closed",
  { label: string; color: string }
> = {
  draft: { label: "草稿", color: "bg-slate-100 text-slate-800" },
  pending_review: { label: "待审核", color: "bg-amber-100 text-amber-800" },
  published: { label: "已发布", color: "bg-emerald-100 text-emerald-800" },
  rejected: { label: "已驳回", color: "bg-rose-100 text-rose-800" },
  closed: { label: "已关闭", color: "bg-slate-200 text-slate-700" },
};

export default function AdminProjects() {
  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.admin.projects.useQuery({ status: ["pending_review", "published", "rejected"] });
  const reviewMutation = trpc.admin.reviewProject.useMutation({
    onSuccess: async () => {
      await utils.admin.projects.invalidate();
      toast.success("状态已更新");
    },
    onError: (err) => toast.error(err.message || "操作失败"),
  });

  const handleReview = (projectId: number, status: keyof typeof statusMeta) => {
    reviewMutation.mutate({ projectId, status });
  };

  return (
    <SystemLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">项目审核</h1>
          <p className="text-muted-foreground">审核教师提交的项目，控制发布质量</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>项目列表</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading && <div className="text-sm text-muted-foreground">加载中...</div>}
            {!isLoading && (data?.length ?? 0) === 0 && <div className="text-sm text-muted-foreground">暂无项目</div>}
            {(data ?? []).map((p) => (
              <div
                key={p.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-lg border border-border p-4"
              >
                <div>
                  <div className="font-semibold">{p.title}</div>
                  <div className="text-sm text-muted-foreground">负责人：用户 #{p.teacherId}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium px-2 py-1 rounded ${statusMeta[p.status].color}`}>
                    {statusMeta[p.status].label}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={reviewMutation.isPending}
                    onClick={() => handleReview(p.id, "published")}
                  >
                    通过
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={reviewMutation.isPending}
                    onClick={() => handleReview(p.id, "rejected")}
                  >
                    驳回
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </SystemLayout>
  );
}

