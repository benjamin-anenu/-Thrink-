import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { X, Send, Settings, Database, MessageCircle, Sparkles, Brain, Search, ToggleLeft, ToggleRight } from 'lucide-react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useToast } from '@/hooks/use-toast';
import { AIService } from '@/services/AIService';
import { EnhancedLocalService } from '@/services/EnhancedLocalService';
import ModelSelector from './ModelSelector';
import FormattedMessage from './FormattedMessage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';

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
    model?: string;
    insights?: string[];
  };
}

type ChatMode = 'ai' | 'local';

interface Position {
  x: number;
  y: number;
}

export const TinkAssistant: React.FC = () => {
  // Add dragging flag to prevent chat opening during drag
  const [isDragStarted, setIsDragStarted] = useState(false);
  const { currentWorkspace } = useWorkspace();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<TinkMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [chatMode, setChatMode] = useState<ChatMode>('local');
  const [selectedModel, setSelectedModel] = useState('anthropic/claude-3.5-sonnet');
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [aiService, setAiService] = useState<AIService | null>(null);
  const [localService] = useState(new EnhancedLocalService());
  const [apiKeyMissing, setApiKeyMissing] = useState(true);

  // Drag functionality state - position in bottom right by default
  const [position, setPosition] = useState<Position>({ x: window.innerWidth - 220, y: window.innerHeight - 220 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const chatBoxRef = useRef<HTMLDivElement>(null);
  const chatIconRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load saved position from localStorage, with safe bounds checking
    const savedPosition = localStorage.getItem('chatIconPosition');
    if (savedPosition) {
      try {
        const parsed = JSON.parse(savedPosition);
        // Ensure the position is within screen bounds
        const safeX = Math.max(0, Math.min(window.innerWidth - 220, parsed.x));
        const safeY = Math.max(0, Math.min(window.innerHeight - 220, parsed.y));
        setPosition({ x: safeX, y: safeY });
      } catch (error) {
        console.error('Error parsing saved position:', error);
        // Set default position if parsing fails
        setPosition({ x: window.innerWidth - 220, y: window.innerHeight - 220 });
      }
    }
  }, []);

  useEffect(() => {
    const initializeChat = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);
          
          // Check for OpenRouter API key
          const openRouterKey = await getOpenRouterKey();
          if (openRouterKey) {
            setAiService(new AIService(openRouterKey, selectedModel));
            setApiKeyMissing(false);
          } else {
            setApiKeyMissing(true);
          }
          
          const welcomeMessage: TinkMessage = {
            id: '1',
            type: 'tink',
            content: `Hey there! I'm Tink, your intelligent project management assistant. I'm here to help you make sense of your workspace data and provide actionable insights.

I work in two modes:
🤖 **AI Mode**: Advanced AI-powered analysis using OpenRouter models (requires API key)
🏠 **Local Mode**: Intelligent local analysis with detailed, human-like responses

${apiKeyMissing ? 'Currently running in Local Mode. ' : 'AI Mode is available! '}What would you like to explore today?`,
            timestamp: new Date()
          };
          setMessages([welcomeMessage]);
        }
      } catch (error) {
        console.error('Error initializing chat:', error);
        setApiKeyMissing(true);
      }
    };

    initializeChat();
  }, [selectedModel]); // Removed currentWorkspace dependency to make it always available

  // Drag event handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setIsDragStarted(true);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragStart({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    const iconSize = 180;
    const newX = Math.max(0, Math.min(window.innerWidth - iconSize, e.clientX - dragStart.x));
    const newY = Math.max(0, Math.min(window.innerHeight - iconSize, e.clientY - dragStart.y));
    
    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    // Reset drag started flag after a short delay
    setTimeout(() => {
      setIsDragStarted(false);
    }, 100);
    // Save position to localStorage for persistence
    localStorage.setItem('chatIconPosition', JSON.stringify(position));
  };

  // Touch event handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({
      x: touch.clientX - position.x,
      y: touch.clientY - position.y
    });
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return;
    
    const touch = e.touches[0];
    const iconSize = 180;
    const newX = Math.max(0, Math.min(window.innerWidth - iconSize, touch.clientX - dragStart.x));
    const newY = Math.max(0, Math.min(window.innerHeight - iconSize, touch.clientY - dragStart.y));
    
    setPosition({ x: newX, y: newY });
  };

  const handleTouchEnd = () => {
    if (isDragging) {
      setIsDragging(false);
      // Save position to localStorage for persistence
      localStorage.setItem('chatIconPosition', JSON.stringify(position));
    }
  };

  // Add global event listeners for drag
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging, dragStart, position]);

  // Click outside to close chat
  useEffect(() => {
    if (!isOpen) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      if (chatBoxRef.current && !chatBoxRef.current.contains(event.target as Node) && 
          chatIconRef.current && !chatIconRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleIconClick = () => {
    // Only open chat if not dragging
    if (!isDragStarted) {
      setIsOpen(true);
    }
  };

  const getOpenRouterKey = async (): Promise<string | null> => {
    try {
      // Try to get from Supabase edge function secrets
      const { data, error } = await supabase.functions.invoke('tink-ai-chat', {
        body: { action: 'check_key' }
      });
      
      if (error) {
        console.error('Error checking OpenRouter key:', error);
        return null;
      }
      
      return data?.hasKey ? 'available' : null;
    } catch (error) {
      console.error('Error getting OpenRouter key:', error);
      return null;
    }
  };

  const handleModelChange = (modelId: string) => {
    setSelectedModel(modelId);
    if (aiService) {
      aiService.updateModel(modelId);
    }
    setShowModelSelector(false);
    
    // Add a system message about the model change
    const modelChangeMessage: TinkMessage = {
      id: `model-change-${Date.now()}`,
      type: 'tink',
      content: `Great! I've switched to **${modelId}**. This model is optimized for ${modelId.includes('claude') ? 'thoughtful analysis and reasoning' : modelId.includes('gpt') ? 'creative problem-solving' : 'efficient processing'}. How can I help you now?`,
      timestamp: new Date(),
      metadata: { model: modelId }
    };
    setMessages(prev => [...prev, modelChangeMessage]);
  };

  const sendMessage = async () => {
    if (!inputValue.trim() || !userId || isLoading) return;

    // Check workspace requirement
    if (!currentWorkspace) {
      toast({
        title: "No Workspace",
        description: "Please select a workspace to use Tink Assistant.",
        variant: "destructive"
      });
      return;
    }

    // For AI mode, check if service is available
    if (chatMode === 'ai' && (apiKeyMissing || !aiService)) {
      toast({
        title: "AI Mode Unavailable",
        description: "AI mode requires an OpenRouter API key. Switching to Local mode for this query.",
        variant: "destructive"
      });
      // Temporarily switch to local mode for this query
      await handleLocalMode();
      return;
    }

    const userMessage: TinkMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const query = inputValue;
    setInputValue('');
    setIsLoading(true);
    setIsTyping(true);

    const typingMessage: TinkMessage = {
      id: 'typing',
      type: 'tink',
      content: chatMode === 'ai' 
        ? '🤖 AI analyzing your workspace data...' 
        : '🏠 Processing your request locally...',
      timestamp: new Date(),
      isLoading: true
    };
    setMessages(prev => [...prev, typingMessage]);

    try {
      let result;
      
      if (chatMode === 'ai' && aiService) {
        // AI Mode processing
        const conversationHistory = messages.slice(-4).map(msg => ({
          message_role: msg.type === 'user' ? 'user' : 'assistant',
          message_content: msg.content
        }));

        result = await aiService.processQuery(
          query,
          currentWorkspace.id,
          conversationHistory,
          'agent'
        );
      } else {
        // Local Mode processing
        result = await localService.processQuery(query, currentWorkspace.id);
      }

      // Remove typing indicator
      setMessages(prev => prev.filter(msg => msg.id !== 'typing'));

      const response: TinkMessage = {
        id: (Date.now() + 1).toString(),
        type: 'tink',
        content: result.response || "I couldn't process your request at the moment.",
        timestamp: new Date(),
        metadata: {
          dataCount: result.dataCount,
          processingTime: result.processingTime,
          model: chatMode === 'ai' ? selectedModel : `enhanced-local-${result.searchType}`,
          insights: result.insights
        }
      };

      setMessages(prev => [...prev, response]);

    } catch (error) {
      console.error('Message processing error:', error);
      
      setMessages(prev => prev.filter(msg => msg.id !== 'typing'));
      
      const errorResponse: TinkMessage = {
        id: (Date.now() + 1).toString(),
        type: 'tink',
        content: "I encountered an issue processing your request. Please try rephrasing your question or check your connection.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorResponse]);
      
      toast({
        title: "Processing Error",
        description: "Unable to process your request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleLocalMode = async () => {
    if (!currentWorkspace) return;

    const userMessage: TinkMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const query = inputValue;
    setInputValue('');
    setIsLoading(true);

    const typingMessage: TinkMessage = {
      id: 'typing',
      type: 'tink',
      content: '🏠 Processing with enhanced local intelligence...',
      timestamp: new Date(),
      isLoading: true
    };
    setMessages(prev => [...prev, typingMessage]);

    try {
      const result = await localService.processQuery(query, currentWorkspace.id);
      
      setMessages(prev => prev.filter(msg => msg.id !== 'typing'));

      const response: TinkMessage = {
        id: (Date.now() + 1).toString(),
        type: 'tink',
        content: result.response,
        timestamp: new Date(),
        metadata: {
          dataCount: result.dataCount,
          processingTime: result.processingTime,
          model: `enhanced-local-${result.searchType}`,
          insights: result.insights
        }
      };

      setMessages(prev => [...prev, response]);

    } catch (error) {
      console.error('Local processing error:', error);
      setMessages(prev => prev.filter(msg => msg.id !== 'typing'));
      
      const errorResponse: TinkMessage = {
        id: (Date.now() + 1).toString(),
        type: 'tink',
        content: "Local processing encountered an issue. Please try a different approach or check your workspace data.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };


  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const quickActions = {
    ai: [
      { label: "Team Performance", icon: Brain, query: "How is my team performing this month?" },
      { label: "Project Analysis", icon: Brain, query: "Analyze my current projects and suggest improvements" },
      { label: "Risk Assessment", icon: Brain, query: "What are the biggest risks in my projects?" },
      { label: "Strategic Planning", icon: Brain, query: "Help me plan our next quarter milestones" }
    ],
    local: [
      { label: "My Tasks", icon: Database, query: "show me my current tasks" },
      { label: "Project Status", icon: Database, query: "what's the status of my projects" },
      { label: "Upcoming Deadlines", icon: Database, query: "what deadlines are coming up" },
      { label: "Team Overview", icon: Database, query: "show me team performance and workload" }
    ]
  };

  const currentModel = { name: selectedModel }; // Simplified for hybrid service

  // Show API key missing message if needed
  if (apiKeyMissing && isOpen) {
    return (
      <div className="fixed w-[400px] h-[300px] z-50" style={{ bottom: '24px', right: '24px' }}>
        <div className="relative w-full h-full bg-background border border-border rounded-2xl shadow-2xl flex flex-col p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Setup Required</h3>
            <Button
              onClick={() => setIsOpen(false)}
              variant="ghost"
              size="icon"
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1 flex flex-col justify-center">
            <p className="text-muted-foreground text-center mb-4">
              To use Tink AI Assistant, you need to set up your OpenRouter API key.
            </p>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Please add your OpenRouter API key in the project settings.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Don't render on mobile
  if (isMobile) {
    return null;
  }

  return (
    <>
      {/* Floating Chat Button - Singleton, transparent background */}
      {!isOpen && (
        <div 
          ref={chatIconRef}
          className="fixed z-50 select-none"
          style={{ 
            left: `${position.x}px`, 
            top: `${position.y}px`,
            cursor: isDragging ? 'grabbing' : 'grab'
          }}
          key="tink-assistant-icon" // Ensure stable key
        >
          <div
            className="relative w-44 h-44 rounded-full transition-transform duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
            style={{ 
              opacity: isDragging ? 0.8 : 1,
              background: 'transparent',
              filter: isDragging ? 'drop-shadow(0 8px 16px rgba(0,0,0,0.2))' : 'drop-shadow(0 4px 12px rgba(16, 185, 129, 0.3))'
            }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onClick={handleIconClick}
          >
            {/* Lottie animation */}
            <DotLottieReact
              src="https://lottie.host/68f802c9-050b-4fac-bf49-eda68fc9746a/ToyFJzSmLq.json"
              loop
              autoplay
              style={{
                width: '180px',
                height: '180px',
                pointerEvents: 'none',
                background: 'transparent',
                position: 'relative',
                zIndex: 1
              }}
            />
            {isTyping && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                <Sparkles className="w-4 h-4 text-primary-foreground animate-pulse" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Enhanced Chat Interface */}
      {isOpen && (
        <div className="fixed w-[560px] h-[700px] z-50 animate-[scale-in_300ms_ease-out]" style={{ bottom: '24px', right: '24px' }}>
          <div ref={chatBoxRef} className="relative w-full h-full bg-background border border-border rounded-2xl 
                        shadow-2xl backdrop-blur-sm flex flex-col">
            
            {/* Enhanced Header */}
            <div className="flex items-center justify-between p-4 border-b border-border rounded-t-2xl bg-gradient-to-r from-primary/5 to-purple-500/5">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary via-purple-500 to-pink-500 
                                flex items-center justify-center shadow-lg">
                    <Brain className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full 
                                border-2 border-background animate-pulse"></div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    Tink AI 
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                      {chatMode === 'ai' ? 'AI Mode' : 'Local Mode'}
                    </span>
                  </h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    {chatMode === 'ai' ? currentModel?.name || 'Claude 3.5 Sonnet' : 'Enhanced Local Intelligence'}
                    <span className="text-xs opacity-60">• {chatMode === 'ai' ? 'AI-powered analysis' : 'Local data processing'}</span>
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Mode Toggle */}
                <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                  <Button
                    variant={chatMode === 'ai' ? 'default' : 'ghost'}
                    disabled={apiKeyMissing}
                    size="sm"
                    onClick={() => setChatMode('ai')}
                    className="h-8 px-3 text-xs transition-all duration-200"
                  >
                    <Brain className="w-3 h-3 mr-1" />
                    AI
                  </Button>
                  <Button
                    variant={chatMode === 'local' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setChatMode('local')}
                    className="h-8 px-3 text-xs transition-all duration-200"
                  >
                    <Database className="w-3 h-3 mr-1" />
                    Local
                  </Button>
                </div>
                
                
                {/* Model Selector Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowModelSelector(!showModelSelector)}
                  className="h-8 w-8 rounded-full hover:bg-primary/10 transition-colors duration-200"
                >
                  <Settings className="h-3 w-3" />
                </Button>
                
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

            {/* Model Selector */}
            {showModelSelector && (
              <Card className="mx-4 mt-2 mb-2 border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">AI Model Selection</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <ModelSelector 
                    selectedModel={selectedModel}
                    onModelChange={handleModelChange}
                    compact={true}
                  />
                </CardContent>
              </Card>
            )}

            {/* Messages Container */}
            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
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
                        <FormattedMessage content={message.content} type={message.type} />
                        {message.metadata && message.type === 'tink' && (
                          <div className="text-xs opacity-60 mt-2 pt-2 border-t border-current/20">
                            {message.metadata.dataCount !== undefined && (
                              <span>• {message.metadata.dataCount} records</span>
                            )}
                            {message.metadata.processingTime && (
                              <span> • {message.metadata.processingTime}ms</span>
                            )}
                             {message.metadata.model && (
                               <span> • {message.metadata.model}</span>
                             )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
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
            
            {/* Input Area */}
            <div className="p-4 border-t border-border bg-muted/30 rounded-b-2xl">
              <div className="flex gap-2">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder={
                    chatMode === 'ai' 
                      ? "Ask me anything: 'How is my team performing?' or 'What are my project risks?'" 
                      : "Search your data: 'my tasks today', 'overdue projects', 'team performance'"
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
                  disabled={!inputValue.trim() || isLoading || (chatMode === 'ai' && (apiKeyMissing || !aiService))}
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
