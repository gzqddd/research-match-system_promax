import { useAuth } from "@/shared/hooks/useAuth";
import { SystemLayout } from "@/components/SystemLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Activity, TrendingUp, Users, BookOpen } from "lucide-react";
import { useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))"];

export default function AdminDashboard() {
  const { user } = useAuth();
  const { data: stats } = trpc.admin.stats.useQuery();

  // 活跃度趋势数据(模拟)
  const activityData = useMemo(() => {
    return [
      { date: "12/01", students: 120, teachers: 35 },
      { date: "12/02", students: 135, teachers: 38 },
      { date: "12/03", students: 142, teachers: 40 },
      { date: "12/04", students: 158, teachers: 42 },
      { date: "12/05", students: 165, teachers: 45 },
      { date: "12/06", students: 178, teachers: 48 },
      { date: "12/07", students: 185, teachers: 50 },
    ];
  }, []);

  // 匹配成功率漏斗数据(模拟)
  const funnelData = useMemo(() => {
    return [
      { name: "浏览", value: 1000 },
      { name: "申请", value: 650 },
      { name: "录用", value: 320 },
    ];
  }, []);

  const statusCards = [
    {
      title: "今日登录师生",
      value: "235",
      change: "+12%",
      icon: <Users className="w-5 h-5 text-blue-600" />,
      bgColor: "bg-blue-50",
    },
    {
      title: "活跃项目数",
      value: "89",
      change: "+5%",
      icon: <BookOpen className="w-5 h-5 text-green-600" />,
      bgColor: "bg-green-50",
    },
    {
      title: "匹配成功率",
      value: "85%",
      change: "+3%",
      icon: <TrendingUp className="w-5 h-5 text-purple-600" />,
      bgColor: "bg-purple-50",
    },
    {
      title: "API调用量",
      value: "12.5K",
      change: "+18%",
      icon: <Activity className="w-5 h-5 text-orange-600" />,
      bgColor: "bg-orange-50",
    },
  ];

  return (
    <SystemLayout>
      <div className="space-y-6">
        {/* 欢迎信息 */}
        <div>
          <h1 className="text-3xl font-bold mb-2">系统监控大屏</h1>
          <p className="text-muted-foreground">实时监控系统运行状态和关键指标</p>
        </div>

        {/* 数据卡片 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statusCards.map((card, index) => (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-12 h-12 rounded-lg ${card.bgColor} flex items-center justify-center`}>
                    {card.icon}
                  </div>
                  <span className="text-sm font-medium text-green-600">{card.change}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-1">{card.title}</p>
                <p className="text-2xl font-bold">{card.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 图表区域 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 活跃度趋势 */}
          <Card>
            <CardHeader>
              <CardTitle>用户活跃度趋势</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={activityData}>
                  <defs>
                    <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorTeachers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="students"
                    stroke="hsl(var(--chart-1))"
                    fillOpacity={1}
                    fill="url(#colorStudents)"
                    name="学生"
                  />
                  <Area
                    type="monotone"
                    dataKey="teachers"
                    stroke="hsl(var(--chart-2))"
                    fillOpacity={1}
                    fill="url(#colorTeachers)"
                    name="教师"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* 匹配成功率漏斗 */}
          <Card>
            <CardHeader>
              <CardTitle>匹配成功率漏斗</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={funnelData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {funnelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 text-center">
                <p className="text-sm text-muted-foreground">
                  转化率: <span className="font-semibold text-foreground">32%</span>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* API监控 */}
        <Card>
          <CardHeader>
            <CardTitle>API调用监控</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border border-border rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">Deepseek API</p>
                <p className="text-2xl font-bold mb-1">8,500</p>
                <p className="text-xs text-muted-foreground">Token消耗</p>
              </div>
              <div className="p-4 border border-border rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">文心一言 API</p>
                <p className="text-2xl font-bold mb-1">4,200</p>
                <p className="text-xs text-muted-foreground">Token消耗</p>
              </div>
              <div className="p-4 border border-border rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">响应时间</p>
                <p className="text-2xl font-bold mb-1">1.2s</p>
                <p className="text-xs text-muted-foreground">平均响应</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </SystemLayout>
  );
}
