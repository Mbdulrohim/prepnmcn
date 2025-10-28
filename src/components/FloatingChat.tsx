"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, X, Send, Bot, User, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

interface UserContext {
  name: string;
  institution: string;
  level: string;
  enrolledExamsCount: number;
  recentAttemptsCount: number;
}

export default function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userContext, setUserContext] = useState<UserContext | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    loadChatHistory();
  }, []);

  // Handle mobile viewport changes (keyboard, etc.)
  useEffect(() => {
    const handleResize = () => {
      // Force a re-render when viewport changes
      setIsOpen((prev) => prev);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Focus input when chat opens on mobile
  useEffect(() => {
    if (isOpen && window.innerWidth < 768) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300); // Delay to allow panel animation
    }
  }, [isOpen]);

  const loadChatHistory = async () => {
    try {
      console.log("Loading chat history...");
      const response = await fetch("/api/ai/chat/history");
      if (response.ok) {
        const data = await response.json();
        console.log("API Response:", data);
        console.log("Messages array:", data.messages);
        console.log(
          "Loaded chat history:",
          data.messages?.length || 0,
          "messages"
        );
        const historyMessages: Message[] = data.messages.map((msg: any) => ({
          id: msg.id,
          content: msg.content,
          role: msg.role,
          timestamp: new Date(msg.timestamp),
        }));
        setMessages(historyMessages);
      } else {
        console.error(
          "Failed to load chat history - status:",
          response.status,
          response.statusText
        );
        const errorText = await response.text();
        console.error("Error response:", errorText);
      }
    } catch (error) {
      console.error("Failed to load chat history:", error);
    }
  };

  const saveMessages = async (newMessages: Message[]) => {
    try {
      // Only save the last few messages to avoid duplicates
      const messagesToSave = newMessages.slice(-10).map((msg) => ({
        role: msg.role,
        content: msg.content,
        metadata: {
          conversationId: "default",
        },
      }));

      console.log("Saving messages:", messagesToSave.length, "messages");

      const response = await fetch("/api/ai/chat/history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: messagesToSave }),
      });

      if (!response.ok) {
        console.error(
          "Failed to save chat history - status:",
          response.status,
          response.statusText
        );
        const errorText = await response.text();
        console.error("Error response:", errorText);
        return;
      }

      const result = await response.json();
      console.log("Chat history saved successfully:", result);
    } catch (error) {
      console.error("Failed to save chat history:", error);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage.trim(),
      role: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    // Create AI message placeholder
    const aiMessageId = (Date.now() + 1).toString();
    const aiMessage: Message = {
      id: aiMessageId,
      content: "",
      role: "assistant",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, aiMessage]);

    try {
      const conversationHistory = messages.slice(-6).map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage.content,
          conversationHistory,
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get AI response");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No response body");
      }

      let accumulatedContent = "";
      let buffer = "";
      console.log("Starting to read streaming response");

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;

        // Split by double newlines to get complete SSE messages
        const messages = buffer.split("\n\n");
        buffer = messages.pop() || ""; // Keep incomplete message in buffer

        for (const message of messages) {
          const lines = message.split("\n");
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              console.log("Received SSE data:", data.substring(0, 100));

              if (data === "[DONE]") {
                reader.cancel();
                break; // Exit the streaming loop, not the entire function
              }

              try {
                const parsed = JSON.parse(data);
                if (parsed.content) {
                  accumulatedContent += parsed.content;

                  // Update the AI message with accumulated content
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === aiMessageId
                        ? { ...msg, content: accumulatedContent }
                        : msg
                    )
                  );
                }
              } catch (e) {
                console.error("Failed to parse streaming chunk:", data, e);
                // If it's not JSON, try to use it as raw content
                if (data && data.trim() && data !== "[DONE]") {
                  accumulatedContent += data;
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === aiMessageId
                        ? { ...msg, content: accumulatedContent }
                        : msg
                    )
                  );
                }
              }
            }
          }
        }
      }

      // Update user context if available
      setUserContext({
        name: "Student", // This would come from the API in a real implementation
        institution: "Institution",
        level: "Level",
        enrolledExamsCount: 0,
        recentAttemptsCount: 0,
      });

      // Save messages to database
      console.log("Streaming completed, about to save messages...");
      const updatedMessages = [
        ...messages,
        userMessage,
        { ...aiMessage, content: accumulatedContent },
      ];
      await saveMessages(updatedMessages);
    } catch (error) {
      console.error("Chat error:", error);
      toast.error("Failed to send message. Please try again.");

      // Remove the failed AI message and add error message
      setMessages((prev) => prev.filter((msg) => msg.id !== aiMessageId));

      const errorMessage: Message = {
        id: aiMessageId,
        content:
          "Sorry, I'm having trouble responding right now. Please try again later.",
        role: "assistant",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);

      // Save error message
      const updatedMessages = [...messages, userMessage, errorMessage];
      await saveMessages(updatedMessages);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = async () => {
    setMessages([]);
    setUserContext(null);

    // Clear chat history from database
    try {
      await fetch("/api/ai/chat/history", {
        method: "DELETE",
      });
    } catch (error) {
      console.error("Failed to clear chat history:", error);
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-50">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          size="lg"
          className={cn(
            "h-12 w-12 md:h-14 md:w-14 rounded-full shadow-lg transition-all duration-300 hover:scale-110 active:scale-95",
            "bg-primary hover:bg-primary/90",
            isOpen && "rotate-45"
          )}
        >
          {isOpen ? (
            <X className="h-5 w-5 md:h-6 md:w-6" />
          ) : (
            <MessageCircle className="h-5 w-5 md:h-6 md:w-6" />
          )}
        </Button>
      </div>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 left-4 md:bottom-24 md:right-6 md:left-auto z-50 w-auto md:w-96 h-[calc(100vh-8rem)] md:h-[500px] max-w-none md:max-w-md bg-background border rounded-lg shadow-xl flex flex-col touch-manipulation">
          {/* Header */}
          <div className="p-3 md:p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-foreground text-sm md:text-base truncate">
                  Exam AI Assistant
                </h3>
                <p className="text-xs text-muted-foreground hidden md:block">
                  Personalized help for your studies
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  console.log("Clear chat clicked");
                  clearChat();
                }}
                className="h-10 w-10 md:h-8 md:w-8 p-0 flex-shrink-0 touch-manipulation"
                title="Clear chat history"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  console.log("Close chat clicked");
                  setIsOpen(false);
                }}
                className="h-10 w-10 md:h-8 md:w-8 p-0 flex-shrink-0 touch-manipulation"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* User Context Info */}
          {userContext && (
            <div className="px-3 md:px-4 py-2 bg-muted/50 border-b text-xs text-muted-foreground">
              <div className="flex items-center gap-2 md:gap-4 overflow-x-auto">
                <span className="flex-shrink-0">👤 {userContext.name}</span>
                <span className="flex-shrink-0 hidden sm:inline">
                  🏫 {userContext.institution}
                </span>
                <span className="flex-shrink-0">
                  📚 {userContext.enrolledExamsCount} exams
                </span>
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 p-3 md:p-4 overflow-y-auto space-y-3 md:space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <Bot className="h-10 w-10 md:h-12 md:w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm font-medium">
                  Hi! I'm your AI Study Assistant
                </p>
                <p className="text-xs mt-1 px-4">
                  Ask me about exam preparation, study tips, or any questions
                  about your courses!
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-2 md:gap-3",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {message.role === "assistant" && (
                    <div className="flex-shrink-0 mt-1">
                      <Bot className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[85%] md:max-w-[80%] rounded-lg px-3 py-2 text-sm",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    {message.role === "assistant" ? (
                      <div className="markdown-content">
                        <ReactMarkdown
                          components={{
                            p: ({ children }) => (
                              <p className="mb-2 last:mb-0">{children}</p>
                            ),
                            strong: ({ children }) => (
                              <strong className="font-semibold">
                                {children}
                              </strong>
                            ),
                            em: ({ children }) => (
                              <em className="italic">{children}</em>
                            ),
                            code: ({ children }) => (
                              <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono">
                                {children}
                              </code>
                            ),
                            ul: ({ children }) => (
                              <ul className="list-disc list-inside mb-2 space-y-1">
                                {children}
                              </ul>
                            ),
                            ol: ({ children }) => (
                              <ol className="list-decimal list-inside mb-2 space-y-1">
                                {children}
                              </ol>
                            ),
                            li: ({ children }) => <li>{children}</li>,
                            h1: ({ children }) => (
                              <h1 className="text-lg font-bold mb-2">
                                {children}
                              </h1>
                            ),
                            h2: ({ children }) => (
                              <h2 className="text-base font-bold mb-2">
                                {children}
                              </h2>
                            ),
                            h3: ({ children }) => (
                              <h3 className="text-sm font-bold mb-1">
                                {children}
                              </h3>
                            ),
                            blockquote: ({ children }) => (
                              <blockquote className="border-l-2 border-muted pl-4 italic my-2">
                                {children}
                              </blockquote>
                            ),
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      message.content
                    )}
                  </div>
                  {message.role === "user" && (
                    <div className="flex-shrink-0 mt-1">
                      <User className="h-5 w-5 md:h-6 md:w-6 text-muted-foreground" />
                    </div>
                  )}
                </div>
              ))
            )}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="flex gap-2 md:gap-3 justify-start">
                <div className="flex-shrink-0">
                  <Bot className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                </div>
                <div className="bg-muted rounded-lg px-3 py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 md:p-4 border-t">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about your studies..."
                disabled={isLoading}
                className="flex-1 text-base md:text-sm touch-manipulation" // Larger text on mobile for better touch
                style={{
                  WebkitAppearance: "none", // Remove iOS styling
                  WebkitTapHighlightColor: "transparent", // Remove tap highlight
                }}
              />
              <Button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading}
                size="sm"
                className="px-3 h-10 md:h-9 flex-shrink-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 hidden md:block">
              Press Enter to send • AI responses are personalized to your
              profile
            </p>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 touch-manipulation"
          onClick={() => {
            console.log("Backdrop clicked");
            setIsOpen(false);
          }}
          style={{ WebkitTapHighlightColor: "transparent" }}
        />
      )}
    </>
  );
}
