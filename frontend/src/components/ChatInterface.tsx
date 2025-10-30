import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Sparkles, Square, Upload } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "ai";
  content: string;
}
interface ChatInterfaceProps {
  onNavigateToAdmin: () => void;
}
const ChatInterface = ({ onNavigateToAdmin }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "ai",
      content: "Hello! I'm your AI assistant. How can I help you today?",
    },
  ]);

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [controller, setController] = useState<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 🔹 Send or Stop
  const handleSend = async () => {
    if (isTyping && controller) {
      controller.abort();
      setIsTyping(false);
      return;
    }

    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    const abortController = new AbortController();
    setController(abortController);

    try {
      const response = await fetch("http://localhost:3000/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input }),
        signal: abortController.signal,
      });

      if (!response.ok) throw new Error("Failed to fetch AI response");
      const data = await response.json();

      // 🧠 Construct message content from backend
      let aiContent = data.answer || "No response received from the server.";

      if (data.relevantData && Array.isArray(data.relevantData)) {
        const contextTexts = data.relevantData
          .map((item: any) => `• ${item.text}`)
          .join("\n");

        aiContent;
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "ai",
        content: aiContent,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      if ((error as Error).name === "AbortError") {
        console.log("Generation stopped by user");
      } else {
        console.error("Error:", error);
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "ai",
            content: "⚠️ Something went wrong. Please try again.",
          },
        ]);
      }
    } finally {
      setIsTyping(false);
      setController(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="relative min-h-screen gradient-chat flex flex-col">
      {/* Header */}
      <header className="glass-effect border-b border-vibranium-purple/20 p-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center   gap-3">
          <div className="flex-1">
            <span className="text-3xl vibranium-glow">💬</span>
            <h1 className="text-xl font-bold bg-gradient-to-r from-vibranium-blue to-vibranium-purple bg-clip-text text-transparent">
              AI Converse
            </h1>
            <p className="text-xs text-muted-foreground">
              Powered by intelligence
            </p>
          </div>
          <div className="justify-between ">
            <Button
              onClick={onNavigateToAdmin}
              variant="ghost"
              className="flex items-center space-x-2 glass text-sm text-slate-300 hover:text-white"
            >
              <Upload className="w-4 h-4" />
              <span>Admin</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              } animate-fade-in`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-6 py-4 ${
                  message.role === "user"
                    ? "glass-effect border border-vibranium-blue/30 vibranium-glow ml-auto bg-gradient-to-br from-vibranium-blue/20 to-vibranium-purple/20"
                    : "glass-effect border border-muted bg-gradient-to-br from-card to-muted/50"
                }`}
              >
                {message.role === "ai" && (
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-vibranium-purple" />
                    <span className="text-xs font-semibold text-vibranium-purple">
                      AI Assistant
                    </span>
                  </div>
                )}
                <p className="text-foreground leading-relaxed whitespace-pre-line">
                  {message.content}
                </p>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start animate-fade-in">
              <div className="glass-effect border border-muted rounded-2xl px-6 py-4 bg-gradient-to-br from-card to-muted/50">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-vibranium-purple animate-glow-pulse" />
                  <span className="text-xs font-semibold text-vibranium-purple">
                    AI Assistant
                  </span>
                </div>
                <div className="flex gap-2 mt-2">
                  <div className="w-2 h-2 bg-vibranium-purple rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-vibranium-blue rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-vibranium-glow rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="sticky bottom-0 p-4 glass-effect border-t border-vibranium-purple/20">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3 items-end">
            <div className="flex-1 glass-effect rounded-2xl border border-vibranium-purple/30 p-3 transition-all duration-300 focus-within:border-vibranium-purple/60 focus-within:vibranium-glow">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="bg-transparent border-none text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>

            {/* Send / Stop Button */}
            <Button
              onClick={handleSend}
              size="lg"
              className={`transition-all duration-300 vibranium-glow hover:scale-105 rounded-full px-6 ${
                isTyping
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-gradient-vibranium hover:opacity-90"
              }`}
            >
              {isTyping ? (
                <Square className="w-5 h-5" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-3">
            Press Enter to send
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
