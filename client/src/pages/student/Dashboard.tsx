import { useAuth } from "@/shared/hooks/useAuth";
import { ProjectCard } from "@/components/ProjectCard";
import { SystemLayout } from "@/components/SystemLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { BookOpen, Calendar, CheckCircle, Clock } from "lucide-react";
import { useMemo } from "react";

export default function StudentDashboard() {
  const { user } = useAuth();
  const { data: profile } = trpc.studentProfile.get.useQuery();
  const { data: applications } = trpc.application.myApplications.useQuery();
  const { data: projects } = trpc.project.list.useQuery();

  // 统计数据
  const stats = useMemo(() => {
    const viewedCount = applications?.length || 0;
    const submittedCount = applications?.filter((app) => app.status !== "rejected").length || 0;
    const interviewCount = applications?.filter((app) => app.status === "interview_scheduled").length || 0;
    const acceptedCount = applications?.filter((app) => app.status === "accepted").length || 0;

    return {
      viewed: viewedCount,
      submitted: submittedCount,
      interview: interviewCount,
      accepted: acceptedCount,
      status: profile?.status || "idle",
    };
  }, [applications, profile]);

  // AI推荐项目(模拟匹配分数)
  const recommendedProjects = useMemo(() => {
    if (!projects) return [];
    
    // 模拟AI匹配算法 - 实际应该从后端获取
    return projects.slice(0, 6).map((project) => ({
      ...project,
      matchScore: Math.floor(Math.random() * 30) + 70, // 70-100的随机分数
      requiredSkills: project.requiredSkills ? JSON.parse(project.requiredSkills) : [],
    }));
  }, [projects]);

  const statusCards = [
    {
      title: "已浏览项目",
      value: stats.viewed,
      icon: <BookOpen className="w-5 h-5 text-blue-600" />,
      bgColor: "bg-blue-50",
    },
    {
      title: "已投递",
      value: stats.submitted,
      icon: <Clock className="w-5 h-5 text-yellow-600" />,
      bgColor: "bg-yellow-50",
    },
    {
      title: "面试邀请",
      value: stats.interview,
      icon: <Calendar className="w-5 h-5 text-purple-600" />,
      bgColor: "bg-purple-50",
    },
    {
      title: "当前状态",
      value: stats.status === "idle" ? "空闲" : "实习中",
      icon: <CheckCircle className="w-5 h-5 text-green-600" />,
      bgColor: "bg-green-50",
    },
  ];

  return (
    <SystemLayout>
      <div className="space-y-6">
        {/* 欢迎信息 */}
        <div>
          <h1 className="text-3xl font-bold mb-2">欢迎回来,{user?.name}!</h1>
          <p className="text-muted-foreground">
            {profile
              ? `${profile.major || "未设置专业"} · ${profile.grade || "未设置年级"}`
              : "完善您的个人档案,获得更精准的项目推荐"}
          </p>
        </div>

        {/* 数据卡片 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statusCards.map((card, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{card.title}</p>
                    <p className="text-2xl font-bold">{card.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-lg ${card.bgColor} flex items-center justify-center`}>
                    {card.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* AI智能推荐 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">🔥</span>
                  基于你的简历,为你精选
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  AI智能分析您的技能档案,推荐最匹配的科研项目
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {recommendedProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recommendedProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    id={project.id}
                    title={project.title}
                    department={project.department || undefined}
                    researchField={project.researchField || undefined}
                    duration={project.duration || undefined}
                    recruitCount={project.recruitCount || 1}
                    currentCount={project.currentCount || 0}
                    matchScore={project.matchScore}
                    requiredSkills={project.requiredSkills}
                    viewCount={project.viewCount || 0}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>暂无推荐项目</p>
                <p className="text-sm mt-1">完善您的个人档案后,系统将为您推荐合适的项目</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </SystemLayout>
  );
}
