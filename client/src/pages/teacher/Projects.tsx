import { SystemLayout } from "@/components/SystemLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { BookOpen, Edit, Eye, Plus } from "lucide-react";
import { Link } from "wouter";

const statusConfig = {
  draft: {
    label: "草稿",
    color: "bg-gray-100 text-gray-800",
  },
  published: {
    label: "已发布",
    color: "bg-green-100 text-green-800",
  },
  closed: {
    label: "已关闭",
    color: "bg-red-100 text-red-800",
  },
};

export default function TeacherProjects() {
  const { data: projects, isLoading } = trpc.project.myProjects.useQuery();

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  return (
    <SystemLayout>
      <div className="space-y-6">
        {/* 页面标题 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">我的项目</h1>
            <p className="text-muted-foreground">管理您发布的所有科研项目</p>
          </div>
          <Link href="/teacher/projects/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              发布新项目
            </Button>
          </Link>
        </div>

        {/* 项目列表 */}
        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-muted-foreground mt-3">加载中...</p>
              </div>
            ) : projects && projects.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>项目名称</TableHead>
                      <TableHead>研究方向</TableHead>
                      <TableHead>招募人数</TableHead>
                      <TableHead>浏览次数</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>发布时间</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projects.map((project) => {
                      const status = statusConfig[project.status];
                      
                      return (
                        <TableRow key={project.id}>
                          <TableCell className="font-medium">
                            <div>
                              <div className="font-medium">{project.title}</div>
                              {project.department && (
                                <div className="text-xs text-muted-foreground mt-0.5">
                                  {project.department}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {project.researchField ? (
                              <Badge variant="outline">{project.researchField}</Badge>
                            ) : (
                              <span className="text-muted-foreground text-sm">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">
                              {project.currentCount || 0}/{project.recruitCount || 1}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm">
                              <Eye className="w-3.5 h-3.5" />
                              {project.viewCount || 0}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={status.color}>{status.label}</Badge>
                          </TableCell>
                          <TableCell>{formatDate(project.createdAt)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Link href={`/teacher/projects/${project.id}/edit`}>
                                <Button variant="ghost" size="sm">
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </Link>
                              <Link href={`/teacher/projects/${project.id}/applications`}>
                                <Button variant="outline" size="sm">
                                  查看申请
                                </Button>
                              </Link>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground mb-4">您还没有发布任何项目</p>
                <Link href="/teacher/projects/new">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    发布第一个项目
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </SystemLayout>
  );
}
