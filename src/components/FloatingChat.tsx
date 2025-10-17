"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

export default function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Chat Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          size="lg"
          className={cn(
            "h-14 w-14 rounded-full shadow-lg transition-all duration-300 hover:scale-110",
            "bg-primary hover:bg-primary/90",
            isOpen && "rotate-45"
          )}
        >
          {isOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <MessageCircle className="h-6 w-6" />
          )}
        </Button>
      </div>

      {/* Chat Panel (when open) */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-80 h-96 bg-background border rounded-lg shadow-xl">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-foreground">Exam AI Assistant</h3>
            <p className="text-sm text-muted-foreground">
              Get help with your exam preparation
            </p>
          </div>
          <div className="p-4 h-64 overflow-y-auto">
            <div className="text-center text-muted-foreground">
              <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="text-sm">AI chat interface coming soon...</p>
              <p className="text-xs mt-1">
                Ask questions about exams, study tips, and more!
              </p>
            </div>
          </div>
          <div className="p-4 border-t">
            <div className="text-xs text-muted-foreground text-center">
              🚧 Under Development
            </div>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
