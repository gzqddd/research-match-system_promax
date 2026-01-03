import { useAuth } from "@/shared/hooks/useAuth";
import { SystemLayout } from "@/components/SystemLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { AlertCircle, BookOpen, CheckCircle, Users } from "lucide-react";
import { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function TeacherDashboard() {
  const { user } = useAuth();
  const { data: projects } = trpc.project.myProjects.useQuery();

  // 统计数据
  const stats = useMemo(() => {
    if (!projects) return { pending: 0, ongoing: 0, students: 0 };

    const pending = projects.reduce((sum, p) => {
      // 这里应该查询每个项目的待处理申请数,暂时模拟
      return sum + Math.floor(Math.random() * 5);
    }, 0);

    const ongoing = projects.filter((p) => p.status === "published").length;
    const students = projects.reduce((sum, p) => sum + (p.currentCount || 0), 0);

    return { pending, ongoing, students };
  }, [projects]);

  // 申请人数趋势数据(模拟)
  const trendData = useMemo(() => {
    return [
      { month: "1月", count: 12 },
      { month: "2月", count: 19 },
      { month: "3月", count: 25 },
      { month: "4月", count: 32 },
      { month: "5月", count: 28 },
      { month: "6月", count: 35 },
    ];
  }, []);

  // 学生能力分布(模拟)
  const skillsData = useMemo(() => {
    return [
      { skill: "Python", count: 45 },
      { skill: "机器学习", count: 38 },
      { skill: "数据分析", count: 32 },
      { skill: "深度学习", count: 28 },
      { skill: "Java", count: 25 },
      { skill: "算法", count: 22 },
    ];
  }, []);

  const statusCards = [
    {
      title: "待处理申请",
      value: stats.pending,
      icon: <AlertCircle className="w-5 h-5 text-red-600" />,
      bgColor: "bg-red-50",
      highlight: true,
    },
    {
      title: "进行中项目",
      value: stats.ongoing,
      icon: <BookOpen className="w-5 h-5 text-blue-600" />,
      bgColor: "bg-blue-50",
    },
    {
      title: "在岗学生数",
      value: stats.students,
      icon: <Users className="w-5 h-5 text-green-600" />,
      bgColor: "bg-green-50",
    },
    {
      title: "项目完成率",
      value: "85%",
      icon: <CheckCircle className="w-5 h-5 text-purple-600" />,
      bgColor: "bg-purple-50",
    },
  ];

  return (
    <SystemLayout>
      <div className="space-y-6">
        {/* 欢迎信息 */}
        <div>
          <h1 className="text-3xl font-bold mb-2">欢迎回来,{user?.name} 老师!</h1>
          <p className="text-muted-foreground">这是您的工作台概览</p>
        </div>

        {/* 数据卡片 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statusCards.map((card, index) => (
            <Card key={index} className={card.highlight ? "ring-2 ring-destructive" : ""}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{card.title}</p>
                    <p className={`text-2xl font-bold ${card.highlight ? "text-destructive" : ""}`}>
                      {card.value}
                    </p>
                  </div>
                  <div className={`w-12 h-12 rounded-lg ${card.bgColor} flex items-center justify-center`}>
                    {card.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 图表区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 申请人数趋势 */}
          <Card>
            <CardHeader>
              <CardTitle>申请人数趋势</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="hsl(var(--primary))" name="申请人数" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* 学生能力分布 */}
          <Card>
            <CardHeader>
              <CardTitle>学生能力分布</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={skillsData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="skill" type="category" width={80} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="hsl(var(--chart-2))" name="学生数量" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* 快速操作 */}
        <Card>
          <CardHeader>
            <CardTitle>快速操作</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <a
                href="/teacher/projects/new"
                className="p-4 border border-border rounded-lg hover:bg-accent transition-colors cursor-pointer"
              >
                <BookOpen className="w-8 h-8 text-primary mb-2" />
                <h3 className="font-semibold mb-1">发布新项目</h3>
                <p className="text-sm text-muted-foreground">创建并发布科研项目招募</p>
              </a>
              <a
                href="/teacher/applications"
                className="p-4 border border-border rounded-lg hover:bg-accent transition-colors cursor-pointer"
              >
                <Users className="w-8 h-8 text-primary mb-2" />
                <h3 className="font-semibold mb-1">审核申请</h3>
                <p className="text-sm text-muted-foreground">查看和处理学生申请</p>
              </a>
              <a
                href="/teacher/internships"
                className="p-4 border border-border rounded-lg hover:bg-accent transition-colors cursor-pointer"
              >
                <CheckCircle className="w-8 h-8 text-primary mb-2" />
                <h3 className="font-semibold mb-1">管理实习</h3>
                <p className="text-sm text-muted-foreground">跟踪学生实习进度</p>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </SystemLayout>
  );
}
