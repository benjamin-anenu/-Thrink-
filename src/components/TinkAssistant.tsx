import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Send, Bold, Italic, List, Code, Database, MessageCircle } from 'lucide-react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useToast } from '@/hooks/use-toast';

interface TinkMessage {
  id: string;
  type: 'user' | 'tink';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

type ChatMode = 'agent' | 'chat';

const TinkAssistant = () => {
  const { currentWorkspace } = useWorkspace();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<TinkMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [chatMode, setChatMode] = useState<ChatMode>('agent');
  
  // Text formatting states
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isCode, setIsCode] = useState(false);

  useEffect(() => {
    const initializeChat = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user && currentWorkspace) {
        setUserId(user.id);
        
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

  const formatText = (text: string): string => {
    let formatted = text;
    if (isBold) formatted = `**${formatted}**`;
    if (isItalic) formatted = `*${formatted}*`;
    if (isCode) formatted = `\`${formatted}\``;
    return formatted;
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || !userId || !currentWorkspace || isLoading) return;

    const formattedInput = formatText(inputValue);
    const userMessage: TinkMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: formattedInput,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setIsTyping(true);

    // Add typing indicator
    const typingMessage: TinkMessage = {
      id: 'typing',
      type: 'tink',
      content: chatMode === 'agent' ? 'Analyzing your data...' : 'Thinking...',
      timestamp: new Date(),
      isLoading: true
    };
    setMessages(prev => [...prev, typingMessage]);

    try {
      const { data, error } = await supabase.functions.invoke('tink-ai-chat', {
        body: {
          message: inputValue,
          userId: userId,
          workspaceId: currentWorkspace.id,
          mode: chatMode
        }
      });

      if (error) {
        throw error;
      }

      // Remove typing indicator
      setMessages(prev => prev.filter(msg => msg.id !== 'typing'));

      const aiResponse: TinkMessage = {
        id: (Date.now() + 1).toString(),
        type: 'tink',
        content: data.message || "I apologize, but I'm having trouble responding right now. Please try again.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error sending message to Tink:', error);
      
      // Remove typing indicator
      setMessages(prev => prev.filter(msg => msg.id !== 'typing'));
      
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
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating Chat Button - Static with no hover effects */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <div
            onClick={() => setIsOpen(true)}
            className="relative w-44 h-44 rounded-full cursor-pointer"
          >
            <DotLottieReact
              src="https://lottie.host/68f802c9-050b-4fac-bf49-eda68fc9746a/ToyFJzSmLq.json"
              loop
              autoplay
              style={{
                width: '180px',
                height: '180px',
                cursor: 'pointer',
                background: 'transparent'
              }}
            />
          </div>
        </div>
      )}

      {/* Enhanced Chat Interface - Wider with no scroll issues */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[500px] h-[600px] z-50 animate-[scale-in_300ms_ease-out]">
          <div className="relative w-full h-full bg-background border border-border rounded-2xl 
                        shadow-2xl backdrop-blur-sm flex flex-col">
            
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center 
                                shadow-lg">
                    <span className="text-white font-bold text-lg">T</span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full 
                                border-2 border-background"></div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-foreground">Tink AI</h3>
                  <p className="text-xs text-muted-foreground">
                    {chatMode === 'agent' ? 'SQL-powered data queries' : 'AI conversation & analysis'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Mode Toggle */}
                <div className="flex items-center gap-1 bg-background/50 rounded-lg p-1">
                  <Button
                    variant={chatMode === 'agent' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setChatMode('agent')}
                    className="h-8 px-3 text-xs"
                  >
                    <Database className="w-3 h-3 mr-1" />
                    Agent
                  </Button>
                  <Button
                    variant={chatMode === 'chat' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setChatMode('chat')}
                    className="h-8 px-3 text-xs"
                  >
                    <MessageCircle className="w-3 h-3 mr-1" />
                    Chat
                  </Button>
                </div>
                <Button
                  onClick={() => setIsOpen(false)}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages Container - Fixed scrolling issues */}
            <div className="flex-1 p-4 space-y-4 overflow-y-auto max-h-[420px]">
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={`flex animate-[fade-in_400ms_ease-out] ${
                    message.type === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                  style={{ 
                    animationDelay: `${index * 50}ms`,
                    animationFillMode: 'both'
                  }}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm break-words
                              ${message.type === 'user'
                                ? 'bg-primary text-primary-foreground ml-4'
                                : 'bg-muted text-foreground mr-4'
                              }`}
                  >
                    {message.isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>
                          <div className="w-2 h-2 bg-current rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                          <div className="w-2 h-2 bg-current rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                        <span className="text-xs opacity-70">
                          {chatMode === 'agent' ? 'Analyzing your data...' : 'Thinking...'}
                        </span>
                      </div>
                    ) : (
                      <div className="whitespace-pre-wrap">{message.content}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="px-4 py-2 border-t border-border/50">
              <div className="flex gap-2 flex-wrap">
                {chatMode === 'agent' ? (
                  <>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs px-3 py-1.5 h-7 rounded-full border-border/50
                                hover:bg-primary/5 hover:border-primary/30 hover:text-primary
                                transition-all duration-200"
                      onClick={() => setInputValue("What's our team utilization this month?")}
                    >
                      <Database className="w-3 h-3 mr-1" />
                      Team Utilization
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs px-3 py-1.5 h-7 rounded-full border-border/50
                                hover:bg-primary/5 hover:border-primary/30 hover:text-primary
                                transition-all duration-200"
                      onClick={() => setInputValue("What are our upcoming deadlines?")}
                    >
                      <Database className="w-3 h-3 mr-1" />
                      Deadlines
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs px-3 py-1.5 h-7 rounded-full border-border/50
                                hover:bg-primary/5 hover:border-primary/30 hover:text-primary
                                transition-all duration-200"
                      onClick={() => setInputValue("Show me project performance analytics")}
                    >
                      <Database className="w-3 h-3 mr-1" />
                      Performance
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs px-3 py-1.5 h-7 rounded-full border-border/50
                                hover:bg-primary/5 hover:border-primary/30 hover:text-primary
                                transition-all duration-200"
                      onClick={() => setInputValue("Analyze our current project risks")}
                    >
                      <MessageCircle className="w-3 h-3 mr-1" />
                      Risk Analysis
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs px-3 py-1.5 h-7 rounded-full border-border/50
                                hover:bg-primary/5 hover:border-primary/30 hover:text-primary
                                transition-all duration-200"
                      onClick={() => setInputValue("Suggest improvements for team productivity")}
                    >
                      <MessageCircle className="w-3 h-3 mr-1" />
                      Improvements
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs px-3 py-1.5 h-7 rounded-full border-border/50
                                hover:bg-primary/5 hover:border-primary/30 hover:text-primary
                                transition-all duration-200"
                      onClick={() => setInputValue("Help me write a project status report")}
                    >
                      <MessageCircle className="w-3 h-3 mr-1" />
                      Report Help
                    </Button>
                  </>
                )}
              </div>
            </div>
            
            {/* Input Area with Formatting Toolbar */}
            <div className="p-4 border-t border-border bg-muted/30 rounded-b-2xl">
              {/* Formatting Toolbar */}
              <div className="flex items-center gap-1 mb-3 pb-2 border-b border-border/30">
                <Button
                  variant={isBold ? "default" : "ghost"}
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => setIsBold(!isBold)}
                >
                  <Bold className="h-3 w-3" />
                </Button>
                <Button
                  variant={isItalic ? "default" : "ghost"}
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => setIsItalic(!isItalic)}
                >
                  <Italic className="h-3 w-3" />
                </Button>
                <Button
                  variant={isCode ? "default" : "ghost"}
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => setIsCode(!isCode)}
                >
                  <Code className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => setInputValue(inputValue + '\n• ')}
                >
                  <List className="h-3 w-3" />
                </Button>
              </div>

              <div className="flex gap-2">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder={
                    chatMode === 'agent' 
                      ? "Ask me about your data: projects, tasks, performance..." 
                      : "Chat with me about your project needs..."
                  }
                  className="flex-1 min-h-[60px] max-h-[120px] px-3 py-2 text-sm bg-background border border-border 
                           rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 
                           focus:border-primary/50 transition-all duration-200 resize-none
                           placeholder:text-muted-foreground/60"
                  rows={2}
                />
                
                <Button 
                  onClick={sendMessage} 
                  size="icon" 
                  className="h-12 w-12 rounded-xl bg-primary hover:bg-primary/90
                           shadow-sm hover:shadow-md transition-all duration-200 
                           disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!inputValue.trim() || isLoading}
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