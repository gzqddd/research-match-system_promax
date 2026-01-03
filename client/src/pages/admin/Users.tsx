import { SystemLayout } from "@/components/SystemLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";

const roleLabel: Record<string, string> = {
  student: "学生",
  teacher: "教师",
  admin: "管理员",
};

const statusColor: Record<string, string> = {
  active: "bg-emerald-100 text-emerald-800",
  pending: "bg-amber-100 text-amber-800",
  banned: "bg-rose-100 text-rose-800",
};

const statusLabel: Record<string, string> = {
  active: "正常",
  pending: "待审核",
  banned: "已封禁",
};

export default function AdminUsers() {
  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.admin.users.useQuery({});
  const updateMutation = trpc.admin.updateUser.useMutation({
    onSuccess: async () => {
      await utils.admin.users.invalidate();
      toast.success("已更新用户信息");
    },
    onError: (err) => toast.error(err.message || "更新失败"),
  });

  const [editing, setEditing] = useState<Record<number, { role?: string; status?: string }>>({});

  const handleSave = (userId: number) => {
    const changes = editing[userId];
    if (!changes?.role && !changes?.status) {
      toast.info("未修改");
      return;
    }
    updateMutation.mutate({ userId, role: changes.role as any, status: changes.status as any });
  };

  const handleChange = (userId: number, field: "role" | "status", value: string) => {
    setEditing((prev) => ({
      ...prev,
      [userId]: { ...prev[userId], [field]: value },
    }));
  };

  return (
    <SystemLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">用户管理</h1>
          <p className="text-muted-foreground">查看、审核和调整用户角色/状态</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>用户列表</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading && <div className="text-sm text-muted-foreground">加载中...</div>}
            {!isLoading && (data?.length ?? 0) === 0 && <div className="text-sm text-muted-foreground">暂无用户</div>}
            {(data ?? []).map((u) => (
              <div
                key={u.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-lg border border-border p-4"
              >
                <div>
                  <div className="font-semibold">{u.name || `用户#${u.id}`}</div>
                  <div className="text-sm text-muted-foreground">{u.email || "无邮箱"}</div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary">{roleLabel[u.role] || u.role}</Badge>
                  <span className={`text-xs font-medium px-2 py-1 rounded ${statusColor[u.status || "active"]}`}>
                    {statusLabel[u.status || "active"]}
                  </span>
                  <Select
                    defaultValue={u.role}
                    onValueChange={(val) => handleChange(u.id, "role", val)}
                  >
                    <SelectTrigger className="w-28">
                      <SelectValue placeholder="角色" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">学生</SelectItem>
                      <SelectItem value="teacher">教师</SelectItem>
                      <SelectItem value="admin">管理员</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    defaultValue={u.status || "active"}
                    onValueChange={(val) => handleChange(u.id, "status", val)}
                  >
                    <SelectTrigger className="w-28">
                      <SelectValue placeholder="状态" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">正常</SelectItem>
                      <SelectItem value="pending">待审核</SelectItem>
                      <SelectItem value="banned">已封禁</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={updateMutation.isPending}
                    onClick={() => handleSave(u.id)}
                  >
                    保存
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </SystemLayout>
  );
}

