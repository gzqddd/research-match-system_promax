import { useAuth } from "@/shared/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { trpc } from "@/lib/trpc";
import {
  Bell,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  FileText,
  Home,
  LayoutDashboard,
  Menu,
  MessageSquare,
  Settings,
  User,
  Users,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { AIAssistantDrawer } from "./AIAssistantDrawer";

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  path: string;
  roles: ("student" | "teacher" | "admin")[];
}

const menuItems: MenuItem[] = [
  {
    icon: <Home className="w-5 h-5" />,
    label: "首页",
    path: "/dashboard",
    roles: ["student"],
  },
  {
    icon: <BookOpen className="w-5 h-5" />,
    label: "项目广场",
    path: "/projects",
    roles: ["student"],
  },
  {
    icon: <FileText className="w-5 h-5" />,
    label: "我的申请",
    path: "/my-applications",
    roles: ["student"],
  },
  {
    icon: <User className="w-5 h-5" />,
    label: "个人档案",
    path: "/profile",
    roles: ["student"],
  },
  {
    icon: <LayoutDashboard className="w-5 h-5" />,
    label: "工作台",
    path: "/teacher/dashboard",
    roles: ["teacher"],
  },
  {
    icon: <BookOpen className="w-5 h-5" />,
    label: "我的项目",
    path: "/teacher/projects",
    roles: ["teacher"],
  },
  {
    icon: <Users className="w-5 h-5" />,
    label: "申请审核",
    path: "/teacher/applications",
    roles: ["teacher"],
  },
  {
    icon: <FileText className="w-5 h-5" />,
    label: "实习管理",
    path: "/teacher/internships",
    roles: ["teacher"],
  },
  {
    icon: <LayoutDashboard className="w-5 h-5" />,
    label: "系统监控",
    path: "/admin/dashboard",
    roles: ["admin"],
  },
  {
    icon: <Users className="w-5 h-5" />,
    label: "用户管理",
    path: "/admin/users",
    roles: ["admin"],
  },
  {
    icon: <BookOpen className="w-5 h-5" />,
    label: "项目审核",
    path: "/admin/projects",
    roles: ["admin"],
  },
  {
    icon: <Settings className="w-5 h-5" />,
    label: "系统设置",
    path: "/admin/settings",
    roles: ["admin"],
  },
];

interface SystemLayoutProps {
  children: React.ReactNode;
}

export function SystemLayout({ children }: SystemLayoutProps) {
  const { user } = useAuth();
  const [location] = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);
  const logoutMutation = trpc.auth.logout.useMutation();
  const { data: unreadCount } = trpc.notification.unreadCount.useQuery(undefined, {
    enabled: !!user,
    refetchInterval: 30000, // 每30秒刷新一次
  });

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      window.location.href = "/";
    } catch (error) {
      toast.error("退出登录失败");
    }
  };

  const filteredMenuItems = menuItems.filter((item) => user && item.roles.includes(user.role));

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-sidebar">
      {/* Logo区域 */}
      <div className="flex items-center gap-3 p-4 border-b border-sidebar-border">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
          智
        </div>
        {!sidebarCollapsed && <span className="font-semibold text-sidebar-foreground">智研匹配系统</span>}
      </div>

      {/* 菜单列表 */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {filteredMenuItems.map((item) => {
          const isActive = location === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground border-l-4 border-primary"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
            >
              {item.icon}
              {!sidebarCollapsed && <span className="text-sm font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* 折叠按钮 */}
      <div className="p-3 border-t border-sidebar-border">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-center"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        >
          {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* 桌面端侧边栏 */}
      <aside
        className={`hidden lg:block border-r border-sidebar-border transition-all duration-300 ${
          sidebarCollapsed ? "w-20" : "w-64"
        }`}
      >
        <SidebarContent />
      </aside>

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 顶部状态栏 */}
        <header className="h-16 border-b border-border bg-card flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-4">
            {/* 移动端菜单按钮 */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64">
                <SidebarContent />
              </SheetContent>
            </Sheet>

            {/* 面包屑导航 */}
            <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
              <Home className="w-4 h-4" />
              <span>/</span>
              <span className="text-foreground">
                {filteredMenuItems.find((item) => item.path === location)?.label || "首页"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* AI助手按钮 */}
            <Button variant="ghost" size="icon" onClick={() => setAiDrawerOpen(true)} className="relative">
              <MessageSquare className="w-5 h-5" />
            </Button>

            {/* 通知按钮 */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              {unreadCount && unreadCount > 0 ? (
                <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
              ) : null}
            </Button>

            {/* 用户菜单 */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                    {user?.name?.[0] || "U"}
                  </div>
                  <span className="hidden sm:inline text-sm">{user?.name || "用户"}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5 text-sm">
                  <div className="font-medium">{user?.name}</div>
                  <div className="text-xs text-muted-foreground">{user?.email}</div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center gap-2 w-full">
                    <User className="w-4 h-4" />
                    个人中心
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center gap-2 w-full">
                    <Settings className="w-4 h-4" />
                    设置
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  退出登录
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* 内容区域 */}
        <main className="flex-1 overflow-y-auto bg-background p-4 lg:p-6">{children}</main>
      </div>

      {/* AI助手抽屉 */}
      <AIAssistantDrawer open={aiDrawerOpen} onOpenChange={setAiDrawerOpen} />
    </div>
  );
}
