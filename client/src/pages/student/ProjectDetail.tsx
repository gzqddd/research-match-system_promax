import { SystemLayout } from "@/components/SystemLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useRoute, Link } from "wouter";
import { toast } from "sonner";
import { Streamdown } from "streamdown";

export default function ProjectDetail() {
  const [, params] = useRoute("/projects/:id");
  const projectId = params?.id ? Number(params.id) : NaN;

  const { data: project, isLoading } = trpc.project.getById.useQuery(
    { id: projectId },
    { enabled: Number.isFinite(projectId) }
  );

  const matchMutation = trpc.ai.calculateMatch.useMutation();

  const handleCalculateMatch = async () => {
    if (!Number.isFinite(projectId)) return;
    try {
      const result = await matchMutation.mutateAsync({ projectId });
      toast.success(`匹配度：${result.score}%`);
    } catch (error) {
      toast.error("匹配度计算失败，请稍后重试");
    }
  };

  return (
    <SystemLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">项目详情</h1>
            <p className="text-muted-foreground">查看项目详细信息，并一键申请</p>
          </div>
          <div className="flex gap-2">
            <Link href={`/projects/${projectId}/apply`}>
              <Button disabled={!project}>一键申请</Button>
            </Link>
            <Button
              variant="outline"
              onClick={handleCalculateMatch}
              disabled={!project || matchMutation.isPending}
            >
              {matchMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              计算匹配度
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            {isLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                正在加载项目详情...
              </div>
            ) : project ? (
              <>
                <CardTitle className="text-2xl mb-2">{project.title}</CardTitle>
                <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                  {project.department && (
                    <Badge variant="outline">{project.department}</Badge>
                  )}
                  {project.researchField && (
                    <Badge variant="outline">{project.researchField}</Badge>
                  )}
                  {project.duration && (
                    <span>实习时长：{project.duration}</span>
                  )}
                  {project.recruitCount && (
                    <span>招募人数：{project.recruitCount}</span>
                  )}
                </div>
              </>
            ) : (
              <div className="text-muted-foreground">未找到该项目或项目已下架。</div>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {project?.description && (
              <section>
                <h2 className="font-semibold mb-2">项目简介</h2>
                <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
                  <Streamdown>{project.description}</Streamdown>
                </div>
              </section>
            )}

            {project?.requirements && (
              <section>
                <h2 className="font-semibold mb-2">招募要求</h2>
                <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
                  <Streamdown>{project.requirements}</Streamdown>
                </div>
              </section>
            )}

            {project?.requiredSkills && (
              <section>
                <h2 className="font-semibold mb-2">希望技能</h2>
                <div className="flex flex-wrap gap-2">
                  {JSON.parse(project.requiredSkills).map((skill: string, index: number) => (
                    <Badge key={index} variant="secondary">
                      {skill}
                    </Badge>
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


