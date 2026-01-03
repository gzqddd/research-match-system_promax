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
import { CheckCircle, Clock, FileText, XCircle } from "lucide-react";
import { Link } from "wouter";

const statusConfig = {
  submitted: {
    label: "已提交",
    color: "bg-blue-100 text-blue-800",
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  screening_passed: {
    label: "初筛通过",
    color: "bg-green-100 text-green-800",
    icon: <CheckCircle className="w-3.5 h-3.5" />,
  },
  interview_scheduled: {
    label: "面试中",
    color: "bg-purple-100 text-purple-800",
    icon: <FileText className="w-3.5 h-3.5" />,
  },
  accepted: {
    label: "已录用",
    color: "bg-green-100 text-green-800",
    icon: <CheckCircle className="w-3.5 h-3.5" />,
  },
  rejected: {
    label: "已婉拒",
    color: "bg-gray-100 text-gray-800",
    icon: <XCircle className="w-3.5 h-3.5" />,
  },
};

export default function MyApplications() {
  const { data: applications, isLoading } = trpc.application.myApplications.useQuery();
  const { data: projects } = trpc.project.list.useQuery();

  // 获取项目信息
  const getProjectInfo = (projectId: number) => {
    return projects?.find((p) => p.id === projectId);
  };

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
        <div>
          <h1 className="text-3xl font-bold mb-2">我的申请</h1>
          <p className="text-muted-foreground">查看和管理您的所有项目申请</p>
        </div>

        {/* 申请列表 */}
        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-muted-foreground mt-3">加载中...</p>
              </div>
            ) : applications && applications.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>项目名称</TableHead>
                      <TableHead>投递时间</TableHead>
                      <TableHead>匹配度</TableHead>
                      <TableHead>当前状态</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.map((application) => {
                      const project = getProjectInfo(application.projectId);
                      const status = statusConfig[application.status];
                      
                      return (
                        <TableRow key={application.id}>
                          <TableCell className="font-medium">
                            <div>
                              <div className="font-medium">{project?.title || "未知项目"}</div>
                              {project?.department && (
                                <div className="text-xs text-muted-foreground mt-0.5">
                                  {project.department}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {formatDate(application.createdAt)}
                          </TableCell>
                          <TableCell>
                            {application.matchScore ? (
                              <Badge
                                className={
                                  application.matchScore >= 80
                                    ? "bg-green-100 text-green-800"
                                    : application.matchScore >= 60
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-gray-100 text-gray-800"
                                }
                              >
                                {application.matchScore}%
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground text-sm">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge className={`${status.color} flex items-center gap-1 w-fit`}>
                              {status.icon}
                              {status.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Link href={`/applications/${application.id}`}>
                                <Button variant="ghost" size="sm">
                                  查看详情
                                </Button>
                              </Link>
                              {application.status === "accepted" && (
                                <Link href={`/applications/${application.id}/report`}>
                                  <Button variant="outline" size="sm">
                                    提交周报
                                  </Button>
                                </Link>
                              )}
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
                <FileText className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground mb-4">您还没有申请任何项目</p>
                <Link href="/projects">
                  <Button>浏览项目广场</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </SystemLayout>
  );
}
