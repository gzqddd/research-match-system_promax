import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, Users, Shield, Sparkles, Mail, Lock, User } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";


export default function Login() {
  const [selectedRole, setSelectedRole] = useState<"student" | "teacher" | "admin">("student");
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const utils = trpc.useUtils();
  // 使用window.location进行导航

  const roleInfo = {
    student: {
      icon: <GraduationCap className="w-12 h-12 text-primary" />,
      title: isLogin ? "学生登录" : "学生注册",
      description: isLogin 
        ? "浏览科研项目,申请实习机会,AI智能推荐匹配"
        : "创建账号,开启科研匹配之旅",
      features: [
        "🔍 浏览海量科研项目",
        "🎯 AI智能匹配推荐",
        "📝 一键生成申请陈述",
        "📊 实时跟踪申请进度",
      ],
    },
    teacher: {
      icon: <Users className="w-12 h-12 text-primary" />,
      title: isLogin ? "教师登录" : "教师注册",
      description: isLogin
        ? "发布科研项目,审核学生申请,管理实习进度"
        : "创建账号,发布科研项目",
      features: [
        "📢 发布科研项目招募",
        "🤖 AI辅助筛选申请人",
        "📋 智能生成面试题目",
        "📈 看板管理实习进度",
      ],
    },
    admin: {
      icon: <Shield className="w-12 h-12 text-primary" />,
      title: isLogin ? "管理员登录" : "管理员注册",
      description: isLogin
        ? "系统监控,用户管理,数据统计分析"
        : "创建管理员账号",
      features: [
        "📊 系统监控大屏",
        "👥 用户权限管理",
        "📈 数据统计分析",
        "⚙️ 系统配置管理",
      ],
    },
  };

  const currentRole = roleInfo[selectedRole];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("请填写邮箱和密码");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // 确保发送 Cookie
        body: JSON.stringify({ email, password, role: selectedRole }), // 传递选择的角色
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || "登录失败");
        return;
      }

      const data = await response.json();
      const userFromResponse = data?.user ?? null;
      toast.success("登录成功！");
      
      // 刷新用户状态，确保认证信息正确加载
      await utils.auth.me.invalidate();
      
      // 等待用户状态刷新完成，然后根据角色跳转（带兜底，避免 refetch 返回 undefined 导致报错）
      let refreshedUser = null;
      try {
        const refetchResult = await utils.auth.me.refetch();
        refreshedUser = refetchResult?.data ?? null;
      } catch (err) {
        console.error("[Login] refresh user failed", err);
      }
      const user = refreshedUser ?? userFromResponse;
      
      // 延迟导航，确保cookie已设置和用户状态已刷新
      setTimeout(() => {
        if (user) {
          // 根据角色跳转到对应的仪表板
          if (user.role === "student") {
            window.location.href = "/dashboard";
          } else if (user.role === "teacher") {
            window.location.href = "/teacher/dashboard";
          } else if (user.role === "admin") {
            window.location.href = "/admin/dashboard";
          } else {
            window.location.href = "/role-select";
          }
        } else {
          window.location.href = "/";
        }
      }, 300);
    } catch (error) {
      toast.error("登录失败，请检查网络连接");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !name) {
      toast.error("请填写所有字段");
      return;
    }

    if (password.length < 6) {
      toast.error("密码至少需要6个字符");
      return;
    }

    if (!email.includes("@")) {
      toast.error("请输入有效的邮箱地址");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // 确保发送 Cookie
        body: JSON.stringify({ email, password, name, role: selectedRole }), // 传递选择的角色
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || "注册失败");
        return;
      }

      const data = await response.json();
      const userFromResponse = data?.user ?? null;
      toast.success("注册成功！");
      
      // 刷新用户状态，确保认证信息正确加载
      await utils.auth.me.invalidate();
      
      // 等待用户状态刷新完成，然后根据角色跳转（带兜底，避免 refetch 返回 undefined 导致报错）
      let refreshedUser = null;
      try {
        const refetchResult = await utils.auth.me.refetch();
        refreshedUser = refetchResult?.data ?? null;
      } catch (err) {
        console.error("[Register] refresh user failed", err);
      }
      const user = refreshedUser ?? userFromResponse;
      
      // 延迟导航，确保cookie已设置和用户状态已刷新
      setTimeout(() => {
        if (user) {
          // 根据角色跳转到对应的仪表板
          if (user.role === "student") {
            window.location.href = "/dashboard";
          } else if (user.role === "teacher") {
            window.location.href = "/teacher/dashboard";
          } else if (user.role === "admin") {
            window.location.href = "/admin/dashboard";
          } else {
            window.location.href = "/role-select";
          }
        } else {
          window.location.href = "/";
        }
      }, 300);
    } catch (error) {
      toast.error("注册失败，请检查网络连接");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* 左侧宣传区 */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 p-12 flex-col justify-center">
        <div className="max-w-xl">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold">
              智
            </div>
            <h1 className="text-3xl font-bold text-foreground">智研匹配系统</h1>
          </div>

          <h2 className="text-4xl font-bold text-foreground mb-6">
            AI驱动的科研项目
            <br />
            智能匹配平台
          </h2>

          <p className="text-lg text-muted-foreground mb-8">
            基于人工智能技术,为学生和导师搭建高效的科研项目匹配桥梁。
            智能分析技能档案,精准推荐最适合的科研机会,让每一次申请都更有价值。
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-card/50 backdrop-blur rounded-lg p-4 border border-border">
              <div className="text-3xl font-bold text-primary mb-1">10,000+</div>
              <div className="text-sm text-muted-foreground">活跃用户</div>
            </div>
            <div className="bg-card/50 backdrop-blur rounded-lg p-4 border border-border">
              <div className="text-3xl font-bold text-primary mb-1">5,000+</div>
              <div className="text-sm text-muted-foreground">科研项目</div>
            </div>
            <div className="bg-card/50 backdrop-blur rounded-lg p-4 border border-border">
              <div className="text-3xl font-bold text-primary mb-1">95%</div>
              <div className="text-sm text-muted-foreground">匹配成功率</div>
            </div>
            <div className="bg-card/50 backdrop-blur rounded-lg p-4 border border-border">
              <div className="text-3xl font-bold text-primary mb-1">4.8/5</div>
              <div className="text-sm text-muted-foreground">用户评分</div>
            </div>
          </div>

          <div className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="w-4 h-4 text-primary" />
            <span>由先进的AI技术驱动,为您提供最佳匹配体验</span>
          </div>
        </div>
      </div>

      {/* 右侧登录区 */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">{currentRole.icon}</div>
            <CardTitle className="text-2xl">{currentRole.title}</CardTitle>
            <CardDescription>{currentRole.description}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* 角色切换 */}
            <Tabs value={selectedRole} onValueChange={(value) => setSelectedRole(value as any)} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="student">学生</TabsTrigger>
                <TabsTrigger value="teacher">教师</TabsTrigger>
                <TabsTrigger value="admin">管理员</TabsTrigger>
              </TabsList>

              <TabsContent value={selectedRole} className="space-y-4 mt-6">
                {/* 功能特性 */}
                <div className="space-y-2 mb-6">
                  {currentRole.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                {/* 登录/注册表单 */}
                <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-4">
                  {!isLogin && (
                    <div className="space-y-2">
                      <Label htmlFor="name" className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        姓名
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="请输入您的姓名"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      邮箱
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="请输入邮箱地址"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      密码
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="请输入密码"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                    />
                    {!isLogin && (
                      <p className="text-xs text-muted-foreground">
                        密码至少需要6个字符
                      </p>
                    )}
                  </div>

                  <Button type="submit" className="w-full" size="lg" disabled={loading}>
                    {loading ? "处理中..." : (isLogin ? "登录" : "注册")}
                  </Button>
                </form>

                {/* 切换登录/注册 */}
                <div className="text-center text-sm">
                  <span className="text-muted-foreground">
                    {isLogin ? "还没有账号？" : "已有账号？"}
                  </span>
                  <button
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setEmail("");
                      setPassword("");
                      setName("");
                    }}
                    className="ml-1 text-primary hover:underline font-medium"
                  >
                    {isLogin ? "立即注册" : "返回登录"}
                  </button>
                </div>

                <p className="text-xs text-center text-muted-foreground">
                  {isLogin ? "登录" : "注册"}即表示您同意我们的服务条款和隐私政策
                </p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
