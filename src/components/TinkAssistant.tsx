
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Send, Bold, Italic, List, Code, Database, MessageCircle, Sparkles } from 'lucide-react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useToast } from '@/hooks/use-toast';
import { TinkSQLService } from '@/services/TinkSQLService';

interface TinkMessage {
  id: string;
  type: 'user' | 'tink';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
  metadata?: {
    query?: string;
    dataCount?: number;
    processingTime?: number;
  };
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
  const [sqlService, setSqlService] = useState<TinkSQLService | null>(null);
  
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
          content: `Hi! I'm Tink, your intelligent project management assistant. I can analyze your data, provide insights, and help you make better decisions. What would you like to explore today?`,
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

    // Add enhanced typing indicator
    const typingMessage: TinkMessage = {
      id: 'typing',
      type: 'tink',
      content: chatMode === 'agent' ? 'Analyzing your data and generating insights...' : 'Thinking through your question...',
      timestamp: new Date(),
      isLoading: true
    };
    setMessages(prev => [...prev, typingMessage]);

    const startTime = Date.now();

    try {
      let response;
      
      if (chatMode === 'agent') {
        // Use enhanced SQL service for agent mode
        response = await processAgentMode(inputValue);
      } else {
        // Use OpenRouter for chat mode
        response = await processChatMode(inputValue);
      }

      const processingTime = Date.now() - startTime;

      // Remove typing indicator
      setMessages(prev => prev.filter(msg => msg.id !== 'typing'));

      const aiResponse: TinkMessage = {
        id: (Date.now() + 1).toString(),
        type: 'tink',
        content: response.message || "I'm having trouble responding right now. Let me try to help you in a different way.",
        timestamp: new Date(),
        metadata: {
          query: response.query,
          dataCount: response.dataCount,
          processingTime
        }
      };

      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error sending message to Tink:', error);
      
      // Remove typing indicator
      setMessages(prev => prev.filter(msg => msg.id !== 'typing'));
      
      const errorResponse: TinkMessage = {
        id: (Date.now() + 1).toString(),
        type: 'tink',
        content: "I'm experiencing some technical difficulties. Let me try a different approach to help you.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorResponse]);
      
      toast({
        title: "Connection Issue",
        description: "Tink is having trouble connecting. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const processAgentMode = async (question: string) => {
    // Get conversation history for context
    const conversationHistory = messages.slice(-4).map(msg => ({
      message_role: msg.type === 'user' ? 'user' : 'assistant',
      message_content: msg.content
    }));

    try {
      // Try enhanced SQL processing first
      const openRouterKey = await getOpenRouterKey();
      if (openRouterKey) {
        const sqlService = new TinkSQLService(openRouterKey);
        const result = await sqlService.processNaturalLanguageQuery(
          question, 
          currentWorkspace!.id, 
          conversationHistory
        );
        
        if (result.success) {
          return {
            message: result.response,
            query: result.query,
            dataCount: result.data?.length || 0
          };
        }
      }

      // Fallback to edge function
      const { data, error } = await supabase.functions.invoke('tink-ai-chat', {
        body: {
          message: question,
          userId: userId,
          workspaceId: currentWorkspace!.id,
          mode: 'agent'
        }
      });

      if (error) throw error;

      return {
        message: data.message,
        query: null,
        dataCount: data.queryResult?.dataCount || 0
      };
    } catch (error) {
      console.error('Error in agent mode:', error);
      throw error;
    }
  };

  const processChatMode = async (question: string) => {
    const { data, error } = await supabase.functions.invoke('tink-ai-chat', {
      body: {
        message: question,
        userId: userId,
        workspaceId: currentWorkspace!.id,
        mode: 'chat'
      }
    });

    if (error) throw error;

    return {
      message: data.message,
      query: null,
      dataCount: 0
    };
  };

  const getOpenRouterKey = async (): Promise<string | null> => {
    try {
      // This would typically come from your environment or settings
      // For now, we'll rely on the edge function having the key
      return null;
    } catch (error) {
      console.error('Error getting OpenRouter key:', error);
      return null;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickActions = {
    agent: [
      { label: "Team Performance", icon: Database, query: "How is my team performing this month?" },
      { label: "Project Status", icon: Database, query: "What's the current status of all my projects?" },
      { label: "Upcoming Deadlines", icon: Database, query: "What are my upcoming deadlines this week?" },
      { label: "Resource Utilization", icon: Database, query: "Show me our current resource utilization" }
    ],
    chat: [
      { label: "Risk Analysis", icon: MessageCircle, query: "What are the biggest risks in my current projects?" },
      { label: "Productivity Tips", icon: MessageCircle, query: "How can I improve my team's productivity?" },
      { label: "Planning Help", icon: MessageCircle, query: "Help me plan my next project milestone" },
      { label: "Best Practices", icon: MessageCircle, query: "What are some project management best practices?" }
    ]
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <div
            onClick={() => setIsOpen(true)}
            className="relative w-44 h-44 rounded-full cursor-pointer hover:scale-105 transition-transform duration-300"
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
            {isTyping && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-primary-foreground animate-pulse" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Enhanced Chat Interface */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[520px] h-[650px] z-50 animate-[scale-in_300ms_ease-out]">
          <div className="relative w-full h-full bg-background border border-border rounded-2xl 
                        shadow-2xl backdrop-blur-sm flex flex-col">
            
            {/* Enhanced Header */}
            <div className="flex items-center justify-between p-4 border-b border-border rounded-t-2xl bg-gradient-to-r from-primary/5 to-purple-500/5">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary via-purple-500 to-pink-500 
                                flex items-center justify-center shadow-lg">
                    <Sparkles className="w-6 h-6 text-white animate-pulse" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full 
                                border-2 border-background animate-pulse"></div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    Tink AI 
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                      {chatMode === 'agent' ? 'Data Expert' : 'AI Assistant'}
                    </span>
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {chatMode === 'agent' 
                      ? 'Intelligent data analysis & insights' 
                      : 'Conversational AI for project guidance'}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Enhanced Mode Toggle */}
                <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                  <Button
                    variant={chatMode === 'agent' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setChatMode('agent')}
                    className="h-8 px-3 text-xs transition-all duration-200"
                  >
                    <Database className="w-3 h-3 mr-1" />
                    Agent
                  </Button>
                  <Button
                    variant={chatMode === 'chat' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setChatMode('chat')}
                    className="h-8 px-3 text-xs transition-all duration-200"
                  >
                    <MessageCircle className="w-3 h-3 mr-1" />
                    Chat
                  </Button>
                </div>
                <Button
                  onClick={() => setIsOpen(false)}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors duration-200"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Messages Container */}
            <div className="flex-1 p-4 space-y-4 overflow-y-auto max-h-[450px]">
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
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm break-words relative
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
                          {message.content}
                        </span>
                      </div>
                    ) : (
                      <>
                        <div className="whitespace-pre-wrap">{message.content}</div>
                        {message.metadata && message.type === 'tink' && (
                          <div className="text-xs opacity-60 mt-2 pt-2 border-t border-current/20">
                            {message.metadata.dataCount !== undefined && (
                              <span>• {message.metadata.dataCount} records analyzed</span>
                            )}
                            {message.metadata.processingTime && (
                              <span> • {message.metadata.processingTime}ms</span>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Enhanced Quick Actions */}
            <div className="px-4 py-3 border-t border-border/50 bg-muted/30">
              <div className="flex gap-2 flex-wrap">
                {quickActions[chatMode].map((action, index) => (
                  <Button 
                    key={index}
                    variant="outline" 
                    size="sm" 
                    className="text-xs px-3 py-1.5 h-7 rounded-full border-border/50
                              hover:bg-primary/10 hover:border-primary/30 hover:text-primary
                              transition-all duration-200"
                    onClick={() => setInputValue(action.query)}
                  >
                    <action.icon className="w-3 h-3 mr-1" />
                    {action.label}
                  </Button>
                ))}
              </div>
            </div>
            
            {/* Enhanced Input Area */}
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
                
                <div className="flex-1" />
                <div className="text-xs text-muted-foreground">
                  {chatMode === 'agent' ? 'Data Analysis Mode' : 'Chat Mode'}
                </div>
              </div>

              <div className="flex gap-2">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder={
                    chatMode === 'agent' 
                      ? "Ask me about your data: 'How is my team performing?' or 'What are my risks?'" 
                      : "Chat with me about your projects: 'Help me plan my next milestone'"
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
