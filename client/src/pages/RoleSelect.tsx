import { useAuth } from "@/shared/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Shield, Users } from "lucide-react";
import { useLocation } from "wouter";

export default function RoleSelect() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const roles = [
    {
      value: "student" as const,
      icon: <GraduationCap className="w-16 h-16 text-primary" />,
      title: "学生",
      description: "浏览科研项目,申请实习机会,获得AI智能推荐",
      features: ["浏览项目广场", "AI智能匹配", "申请进度跟踪", "个人技能档案"],
    },
    {
      value: "teacher" as const,
      icon: <Users className="w-16 h-16 text-primary" />,
      title: "教师",
      description: "发布科研项目,审核学生申请,管理实习进度",
      features: ["发布项目招募", "AI辅助筛选", "申请审核管理", "实习进度看板"],
    },
    {
      value: "admin" as const,
      icon: <Shield className="w-16 h-16 text-primary" />,
      title: "管理员",
      description: "系统监控,用户管理,数据统计分析",
      features: ["系统监控大屏", "用户权限管理", "数据统计分析", "系统配置"],
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5">
      <div className="w-full max-w-5xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">角色权限说明</h1>
          <p className="text-muted-foreground">
            您好,{user?.name}! 当前账号的角色为 <span className="font-semibold">{user?.role}</span>，如需切换为其他角色，请联系系统管理员为您调整。
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {roles.map((role) => (
            <Card key={role.value}>
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">{role.icon}</div>
                <CardTitle>{role.title}</CardTitle>
                <CardDescription>{role.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {role.features.map((feature, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          如需变更角色（例如从学生升级为教师或管理员），请通过管理员账号在「用户管理」中修改。
        </p>

        <div className="mt-6 flex justify-center">
          <Button
            onClick={() => {
              if (user?.role === "student") {
                setLocation("/dashboard");
              } else if (user?.role === "teacher") {
                setLocation("/teacher/dashboard");
              } else if (user?.role === "admin") {
                setLocation("/admin/dashboard");
              } else {
                setLocation("/login");
              }
            }}
          >
            返回当前角色首页
          </Button>
        </div>
      </div>
    </div>
  );
}
