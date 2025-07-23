
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Send, TrendingUp, AlertTriangle } from 'lucide-react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useToast } from '@/hooks/use-toast';

interface TinkMessage {
  id: string;
  type: 'user' | 'tink';
  content: string;
  timestamp: Date;
}

const TinkAssistant = () => {
  const { currentWorkspace } = useWorkspace();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<TinkMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const initializeChat = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && currentWorkspace) {
        setUserId(user.id);
        
        // Set personalized welcome message
        const welcomeMessage: TinkMessage = {
          id: '1',
          type: 'tink',
          content: `Hi! I'm Tink, your AI project assistant. I can help you with project insights, performance analytics, and resource management tailored to your workspace. What would you like to know?`,
          timestamp: new Date()
        };
        setMessages([welcomeMessage]);
      }
    };

    initializeChat();
  }, [currentWorkspace]);

  const sendMessage = async () => {
    if (!inputValue.trim() || !userId || !currentWorkspace || isLoading) return;

    const userMessage: TinkMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('tink-ai-chat', {
        body: {
          message: inputValue,
          userId: userId,
          workspaceId: currentWorkspace.id
        }
      });

      if (error) {
        throw error;
      }

      const aiResponse: TinkMessage = {
        id: (Date.now() + 1).toString(),
        type: 'tink',
        content: data.message || "I apologize, but I'm having trouble responding right now. Please try again.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error sending message to Tink:', error);
      
      const errorResponse: TinkMessage = {
        id: (Date.now() + 1).toString(),
        type: 'tink',
        content: "I'm sorry, I'm having trouble connecting right now. Please check your connection and try again.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorResponse]);
      
      toast({
        title: "Connection Error",
        description: "Unable to reach Tink AI. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Glassmorphism Floating Chat Button - Reduced Size */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={() => setIsOpen(true)}
            className="relative w-36 h-36 rounded-full bg-transparent 
                     hover:bg-white/10 hover:backdrop-blur-sm
                     shadow-lg hover:shadow-xl transition-all duration-300 ease-out
                     hover:scale-105 active:scale-[0.98] border border-white/20
                     will-change-transform"
            size="icon"
            style={{
              transform: 'translate3d(0, 0, 0)',
              boxShadow: `
                0 4px 12px rgba(0, 0, 0, 0.15),
                0 2px 4px rgba(0, 0, 0, 0.1)
              `
            }}
          >
            <DotLottieReact
              src="https://lottie.host/68f802c9-050b-4fac-bf49-eda68fc9746a/ToyFJzSmLq.json"
              loop
              autoplay
              style={{
                width: '135px',
                height: '135px',
                cursor: 'pointer'
              }}
            />
          </Button>
        </div>
      )}

      {/* Chat Interface - Keep existing */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 h-96 z-50 animate-[scale-in_300ms_ease-out]">
          <div className="relative w-full h-full bg-card border border-border rounded-xl 
                        shadow-xl backdrop-blur-sm flex flex-col will-change-transform"
               style={{
                 transform: 'translate3d(0, 0, 0)',
                 boxShadow: `
                   0 20px 25px -5px rgba(0, 0, 0, 0.1),
                   0 10px 10px -5px rgba(0, 0, 0, 0.04)
                 `
               }}>
            
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border rounded-t-xl bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center 
                                shadow-sm animate-[pulse_3s_ease-in-out_infinite]">
                    <span className="text-primary-foreground font-semibold text-sm">T</span>
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success rounded-full 
                                border border-card shadow-sm"></div>
                </div>
                
                <div>
                  <h3 className="font-medium text-foreground">Tink AI</h3>
                  <p className="text-xs text-muted-foreground">
                    AI Assistant
                  </p>
                </div>
              </div>
              
              <Button
                onClick={() => setIsOpen(false)}
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive 
                         transition-colors duration-200"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={`flex animate-[fade-in_400ms_ease-out] ${
                    message.type === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                  style={{ 
                    animationDelay: `${index * 100}ms`,
                    animationFillMode: 'both'
                  }}
                >
                  <div
                    className={`max-w-[85%] rounded-lg p-3 text-sm shadow-sm transition-transform 
                              duration-200 hover:scale-[1.02] will-change-transform
                              ${message.type === 'user'
                                ? 'bg-primary text-primary-foreground ml-4'
                                : 'bg-muted text-foreground mr-4'
                              }`}
                    style={{ transform: 'translate3d(0, 0, 0)' }}
                  >
                    {message.content}
                  </div>
                </div>
              ))}
            </div>

            {/* Input Section */}
            <div className="p-4 border-t border-border space-y-3 bg-muted/20 rounded-b-xl">
              <div className="flex gap-2">
                {[
                  { label: '📊 Performance', action: 'Show team performance' },
                  { label: '⏰ Deadlines', action: 'Deadline status' },
                  { label: '👥 Resources', action: 'Resource allocation' }
                ].map((btn, index) => (
                  <Button 
                    key={index}
                    variant="outline" 
                    size="sm" 
                    className="text-xs px-2 py-1 h-6 rounded-md border-border/50
                             hover:bg-primary/5 hover:border-primary/30 hover:text-primary
                             transition-all duration-200 hover:scale-105 active:scale-95"
                    onClick={() => setInputValue(btn.action)}
                  >
                    {btn.label}
                  </Button>
                ))}
              </div>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Ask about performance, deadlines, or resources..."
                  className="flex-1 px-3 py-2 text-sm bg-background border border-border 
                           rounded-lg focus:outline-none focus:ring-1 focus:ring-primary/50 
                           focus:border-primary/50 transition-all duration-200
                           placeholder:text-muted-foreground/60"
                />
                
                <Button 
                  onClick={sendMessage} 
                  size="icon" 
                  className="h-10 w-10 rounded-lg bg-primary hover:bg-primary/90
                           shadow-sm hover:shadow-md transition-all duration-200 
                           hover:scale-105 active:scale-95 disabled:opacity-50
                           disabled:cursor-not-allowed will-change-transform"
                  disabled={!inputValue.trim()}
                  style={{ transform: 'translate3d(0, 0, 0)' }}
                >
                  <Send className="h-4 w-4 text-primary-foreground" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TinkAssistant;
