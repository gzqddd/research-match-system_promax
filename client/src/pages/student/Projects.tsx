import { ProjectCard } from "@/components/ProjectCard";
import { SystemLayout } from "@/components/SystemLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";

export default function Projects() {
  const { data: projects, isLoading } = trpc.project.list.useQuery();
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [fieldFilter, setFieldFilter] = useState<string>("all");
  const [durationFilter, setDurationFilter] = useState<string>("all");

  // 提取唯一的学院和研究方向
  const { departments, fields } = useMemo(() => {
    if (!projects) return { departments: [], fields: [] };
    
    const depts = new Set<string>();
    const flds = new Set<string>();
    
    projects.forEach((project) => {
      if (project.department) depts.add(project.department);
      if (project.researchField) flds.add(project.researchField);
    });
    
    return {
      departments: Array.from(depts),
      fields: Array.from(flds),
    };
  }, [projects]);

  // 过滤项目
  const filteredProjects = useMemo(() => {
    if (!projects) return [];
    
    return projects.filter((project) => {
      // 搜索过滤
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchTitle = project.title.toLowerCase().includes(query);
        const matchDesc = project.description.toLowerCase().includes(query);
        if (!matchTitle && !matchDesc) return false;
      }
      
      // 学院过滤
      if (departmentFilter !== "all" && project.department !== departmentFilter) {
        return false;
      }
      
      // 研究方向过滤
      if (fieldFilter !== "all" && project.researchField !== fieldFilter) {
        return false;
      }
      
      // 时长过滤
      if (durationFilter !== "all") {
        if (!project.duration) return false;
        const duration = project.duration.toLowerCase();
        if (durationFilter === "short" && !duration.includes("月") && !duration.includes("1")) {
          return false;
        }
        if (durationFilter === "medium" && !duration.includes("3") && !duration.includes("6")) {
          return false;
        }
        if (durationFilter === "long" && !duration.includes("年") && !duration.includes("12")) {
          return false;
        }
      }
      
      return true;
    }).map((project) => ({
      ...project,
      matchScore: Math.floor(Math.random() * 40) + 60, // 模拟匹配分数
      requiredSkills: project.requiredSkills ? JSON.parse(project.requiredSkills) : [],
    }));
  }, [projects, searchQuery, departmentFilter, fieldFilter, durationFilter]);

  return (
    <SystemLayout>
      <div className="space-y-6">
        {/* 页面标题 */}
        <div>
          <h1 className="text-3xl font-bold mb-2">科研项目广场</h1>
          <p className="text-muted-foreground">浏览所有可申请的科研项目,找到最适合你的机会</p>
        </div>

        {/* 筛选栏 */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* 搜索框 */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="搜索项目名称或描述..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* 筛选器 */}
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">筛选:</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="所属学院" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部学院</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={fieldFilter} onValueChange={setFieldFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="研究方向" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部方向</SelectItem>
                    {fields.map((field) => (
                      <SelectItem key={field} value={field}>
                        {field}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={durationFilter} onValueChange={setDurationFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="实习时长" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">全部时长</SelectItem>
                    <SelectItem value="short">短期(1-2个月)</SelectItem>
                    <SelectItem value="medium">中期(3-6个月)</SelectItem>
                    <SelectItem value="long">长期(6个月以上)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 重置按钮 */}
              {(searchQuery || departmentFilter !== "all" || fieldFilter !== "all" || durationFilter !== "all") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setDepartmentFilter("all");
                    setFieldFilter("all");
                    setDurationFilter("all");
                  }}
                >
                  重置筛选
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 项目列表 */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              找到 <span className="font-semibold text-foreground">{filteredProjects.length}</span> 个项目
            </p>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-muted-foreground mt-3">加载中...</p>
            </div>
          ) : filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProjects.map((project) => (
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
            <Card>
              <CardContent className="text-center py-12">
                <Search className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">没有找到符合条件的项目</p>
                <p className="text-sm text-muted-foreground mt-1">尝试调整筛选条件</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </SystemLayout>
  );
}
