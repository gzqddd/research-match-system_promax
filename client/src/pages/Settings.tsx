import { SystemLayout } from "@/components/SystemLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Settings() {
  const utils = trpc.useUtils();
  const { data: me } = trpc.auth.me.useQuery();
  const updateMutation = trpc.auth.updateProfile.useMutation({
    onSuccess: async () => {
      await utils.auth.me.invalidate();
      toast.success("已保存");
    },
    onError: (err) => toast.error(err.message || "保存失败"),
  });

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [notification, setNotification] = useState(true);

  useEffect(() => {
    if (me) {
      setName(me.name ?? "");
      setEmail(me.email ?? "");
      // @ts-expect-error notificationEnabled added in backend
      setNotification(Boolean((me as any).notificationEnabled ?? true));
    }
  }, [me]);

  const handleSave = () => {
    updateMutation.mutate({
      name,
      email,
      notificationEnabled: notification,
    });
  };

  return (
    <SystemLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">个人设置</h1>
          <p className="text-muted-foreground">管理账户信息和通知偏好</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>账户信息</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">姓名</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="请输入姓名" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">邮箱</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" />
            </div>
            <div className="space-y-2">
              <Label>通知设置</Label>
              <Button variant={notification ? "default" : "outline"} onClick={() => setNotification(!notification)}>
                {notification ? "已开启通知" : "已关闭通知"}
              </Button>
            </div>
            <Button className="w-fit" onClick={handleSave} disabled={updateMutation.isPending}>
              保存
            </Button>
          </CardContent>
        </Card>
      </div>
    </SystemLayout>
  );
}

