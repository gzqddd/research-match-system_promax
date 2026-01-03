import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Redirect } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useAuth } from "@/shared/hooks/useAuth";
import { Loader2 } from "lucide-react";

// 公共页面
import Login from "./pages/Login";
import RoleSelect from "./pages/RoleSelect";

// 学生端页面
import StudentDashboard from "./pages/student/Dashboard";
import StudentProjects from "./pages/student/Projects";
import StudentApplications from "./pages/student/MyApplications";
import StudentProfile from "./pages/student/Profile";
import ProjectDetail from "./pages/student/ProjectDetail";
import ProjectApply from "./pages/student/ProjectApply";
import ApplicationDetail from "./pages/student/ApplicationDetail";
import ApplicationReport from "./pages/student/ApplicationReport";

// 教师端页面
import TeacherDashboard from "./pages/teacher/Dashboard";
import TeacherProjects from "./pages/teacher/Projects";
import TeacherApplications from "./pages/teacher/Applications";
import TeacherInternships from "./pages/teacher/Internships";
import ProjectNew from "./pages/teacher/ProjectNew";
import ProjectApplications from "./pages/teacher/ProjectApplications";

// 管理员端页面
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsers from "./pages/admin/Users";
import AdminProjects from "./pages/admin/Projects";
import AdminSettings from "./pages/admin/Settings";

// 通用设置页面
import Settings from "./pages/Settings";

function ProtectedRoute({ component: Component, allowedRoles }: { component: React.ComponentType; allowedRoles?: string[] }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-primary" />
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Redirect to="/role-select" />;
  }

  return <Component />;
}

function Router() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-primary" />
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      {/* 公共页面 */}
      <Route path="/login" component={Login} />
      <Route path="/role-select">
        {() => <ProtectedRoute component={RoleSelect} />}
      </Route>

      {/* 首页重定向 */}
      <Route path="/">
        {() => {
          if (!user) return <Redirect to="/login" />;
          if (user.role === "student") return <Redirect to="/dashboard" />;
          if (user.role === "teacher") return <Redirect to="/teacher/dashboard" />;
          if (user.role === "admin") return <Redirect to="/admin/dashboard" />;
          return <Redirect to="/role-select" />;
        }}
      </Route>

      {/* 学生端路由 */}
      <Route path="/dashboard">
        {() => <ProtectedRoute component={StudentDashboard} allowedRoles={["student"]} />}
      </Route>
      <Route path="/projects">
        {() => <ProtectedRoute component={StudentProjects} allowedRoles={["student"]} />}
      </Route>
      <Route path="/projects/:id">
        {() => <ProtectedRoute component={ProjectDetail} allowedRoles={["student"]} />}
      </Route>
      <Route path="/projects/:id/apply">
        {() => <ProtectedRoute component={ProjectApply} allowedRoles={["student"]} />}
      </Route>
      <Route path="/applications/:id/report">
        {() => <ProtectedRoute component={ApplicationReport} allowedRoles={["student"]} />}
      </Route>
      <Route path="/applications/:id">
        {() => <ProtectedRoute component={ApplicationDetail} allowedRoles={["student"]} />}
      </Route>
      <Route path="/my-applications">
        {() => <ProtectedRoute component={StudentApplications} allowedRoles={["student"]} />}
      </Route>
      <Route path="/profile">
        {() => <ProtectedRoute component={StudentProfile} allowedRoles={["student"]} />}
      </Route>

      {/* 教师端路由 */}
      <Route path="/teacher/dashboard">
        {() => <ProtectedRoute component={TeacherDashboard} allowedRoles={["teacher"]} />}
      </Route>
      <Route path="/teacher/projects">
        {() => <ProtectedRoute component={TeacherProjects} allowedRoles={["teacher"]} />}
      </Route>
      <Route path="/teacher/projects/new">
        {() => <ProtectedRoute component={ProjectNew} allowedRoles={["teacher"]} />}
      </Route>
      <Route path="/teacher/projects/:id/applications">
        {() => <ProtectedRoute component={ProjectApplications} allowedRoles={["teacher"]} />}
      </Route>
      <Route path="/teacher/applications">
        {() => <ProtectedRoute component={TeacherApplications} allowedRoles={["teacher"]} />}
      </Route>
      <Route path="/teacher/internships">
        {() => <ProtectedRoute component={TeacherInternships} allowedRoles={["teacher"]} />}
      </Route>

      {/* 管理员端路由 */}
      <Route path="/admin/dashboard">
        {() => <ProtectedRoute component={AdminDashboard} allowedRoles={["admin"]} />}
      </Route>
      <Route path="/admin/users">
        {() => <ProtectedRoute component={AdminUsers} allowedRoles={["admin"]} />}
      </Route>
      <Route path="/admin/projects">
        {() => <ProtectedRoute component={AdminProjects} allowedRoles={["admin"]} />}
      </Route>
      <Route path="/admin/settings">
        {() => <ProtectedRoute component={AdminSettings} allowedRoles={["admin"]} />}
      </Route>

      {/* 通用设置 */}
      <Route path="/settings">
        {() => <ProtectedRoute component={Settings} allowedRoles={["student", "teacher", "admin"]} />}
      </Route>

      {/* 404页面 */}
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
