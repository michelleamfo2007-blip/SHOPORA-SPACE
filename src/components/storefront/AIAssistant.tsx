"use client";

import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { Button } from "@/components/ui/button";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";

export function AIAssistant({ domain, storeId, primaryColor }: { domain?: string; storeId?: string; primaryColor?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    body: { domain, storeId },
    initialMessages: [
      {
        id: 'welcome',
        role: 'assistant',
        content: "Hi! I'm your AI shopping assistant. What are you looking for today?"
      }
    ]
  });

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl z-50 hover:scale-105 transition-transform"
        style={{ backgroundColor: primaryColor || '#0f172a' }}
      >
        <MessageCircle className="h-6 w-6 text-white" />
      </Button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-[350px] sm:w-[400px] bg-white rounded-2xl shadow-2xl z-50 flex flex-col border border-slate-200 overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
      {/* Header */}
      <div 
        className="px-4 py-3 flex items-center justify-between text-white"
        style={{ backgroundColor: primaryColor || '#0f172a' }}
      >
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5" />
          <span className="font-semibold">Shopping Assistant</span>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20 rounded-full" onClick={() => setIsOpen(false)}>
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Messages Area */}
      <div className="h-[400px] overflow-y-auto p-4 flex flex-col gap-4 bg-slate-50">
        {messages.map(m => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div 
              className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                m.role === 'user' 
                  ? 'bg-slate-900 text-white rounded-br-none' 
                  : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'
              }`}
              style={m.role === 'user' ? { backgroundColor: primaryColor || '#0f172a' } : {}}
            >
              {m.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-2 text-slate-500">
              <span className="animate-pulse">●</span>
              <span className="animate-pulse delay-75">●</span>
              <span className="animate-pulse delay-150">●</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-slate-100 flex gap-2">
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Ask me anything..."
          className="flex-1 bg-slate-100 text-sm rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
        />
        <Button 
          type="submit" 
          size="icon" 
          disabled={isLoading || !input.trim()}
          className="rounded-full h-10 w-10 shrink-0"
          style={{ backgroundColor: primaryColor || '#0f172a' }}
        >
          <Send className="w-4 h-4 text-white" />
        </Button>
      </form>
    </div>
  );
}
