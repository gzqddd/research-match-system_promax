import { useState, useEffect, useRef } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Sparkles } from "lucide-react";
import { useAuth } from "@/shared/hooks/useAuth";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Streamdown } from "streamdown";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AIAssistantDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AIAssistantDrawer({ open, onOpenChange }: AIAssistantDrawerProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 根据角色提供不同的预设提示
  const presetPrompts = user?.role === "student" 
    ? [
        "如何提高我的匹配度?",
        "帮我润色申请理由",
        "推荐适合我的项目",
      ]
    : user?.role === "teacher"
    ? [
        "帮我生成面试题",
        "目前的申请人里谁最强?",
        "如何评估学生能力?",
      ]
    : [
        "系统使用情况分析",
        "用户活跃度趋势",
        "匹配成功率统计",
      ];

  const chatMutation = trpc.ai.chat.useMutation();

  // 自动滚动到底部
  const scrollToBottom = () => {
    const viewport = scrollAreaRef.current?.querySelector(
      '[data-slot="scroll-area-viewport"]'
    ) as HTMLDivElement;

    if (viewport) {
      requestAnimationFrame(() => {
        viewport.scrollTo({
          top: viewport.scrollHeight,
          behavior: 'smooth'
        });
      });
    }
  };

  // 当消息更新时自动滚动到底部
  useEffect(() => {
    if (messages.length > 0 || isLoading) {
      scrollToBottom();
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    const currentInput = input;
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // 立即滚动到底部
    setTimeout(() => scrollToBottom(), 100);

    try {
      const result = await chatMutation.mutateAsync({
        message: currentInput,
        history: messages,
      });
      
      const assistantMessage: Message = {
        role: "assistant",
        content: result.reply,
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      toast.error("AI助手暂时无法响应,请稍后重试");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePresetClick = (prompt: string) => {
    setInput(prompt);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:w-[400px] p-0 flex flex-col h-full">
        <SheetHeader className="p-4 border-b shrink-0">
          <SheetTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            AI 智能助手
          </SheetTitle>
        </SheetHeader>

        {/* 预设提示 */}
        {messages.length === 0 && (
          <div className="p-4 space-y-2 shrink-0">
            <p className="text-sm text-muted-foreground mb-3">快速开始:</p>
            {presetPrompts.map((prompt, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="w-full justify-start text-left h-auto py-2"
                onClick={() => handlePresetClick(prompt)}
              >
                {prompt}
              </Button>
            ))}
          </div>
        )}

        {/* 消息列表 */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <ScrollArea ref={scrollAreaRef} className="h-full">
            <div className="p-4 space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg px-4 py-2 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    {message.role === "assistant" ? (
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <Streamdown>{message.content}</Streamdown>
                      </div>
                    ) : (
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted text-muted-foreground rounded-lg px-4 py-2">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </div>

        {/* 输入框 */}
        <div className="p-4 border-t shrink-0">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="输入您的问题..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button onClick={handleSend} disabled={!input.trim() || isLoading} size="icon">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
