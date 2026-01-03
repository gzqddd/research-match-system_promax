import { SystemLayout } from "@/components/SystemLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function AdminSettings() {
  const [enableAi, setEnableAi] = useState(true);
  const [enableMail, setEnableMail] = useState(false);
  const [rateLimit, setRateLimit] = useState(100);

  return (
    <SystemLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">系统设置</h1>
          <p className="text-muted-foreground">调整平台特性开关、限流和通知配置</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>特性开关</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">启用 AI 匹配</Label>
                <p className="text-sm text-muted-foreground">关闭后仅展示人工筛选结果</p>
              </div>
              <Switch checked={enableAi} onCheckedChange={setEnableAi} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">启用邮件通知</Label>
                <p className="text-sm text-muted-foreground">审批、录取等事件发送邮件提醒</p>
              </div>
              <Switch checked={enableMail} onCheckedChange={setEnableMail} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>限流与安全</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="rate-limit">API 速率限制（请求/分钟）</Label>
              <Input
                id="rate-limit"
                type="number"
                min={10}
                value={rateLimit}
                onChange={(e) => setRateLimit(Number(e.target.value))}
              />
            </div>
            <Button className="w-fit">保存设置</Button>
          </CardContent>
        </Card>
      </div>
    </SystemLayout>
  );
}

