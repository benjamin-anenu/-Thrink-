import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, X, Send, TrendingUp, AlertTriangle } from 'lucide-react';
import { PerformanceTracker } from '@/services/PerformanceTracker';
import { EmailReminderService } from '@/services/EmailReminderService';

interface TinkMessage {
  id: string;
  type: 'user' | 'tink';
  content: string;
  timestamp: Date;
}

const TinkAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<TinkMessage[]>([
    {
      id: '1',
      type: 'tink',
      content: "Hi there! I'm Tink, your intelligent project assistant. I'm actively tracking team performance and sending smart deadline reminders. I noticed Sarah completed her UI task ahead of schedule - excellent work! 🎯 Would you like me to show you the latest team insights?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');

  const sendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: TinkMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    // Enhanced Tink responses with performance awareness
    setTimeout(() => {
      const tinkResponse: TinkMessage = {
        id: (Date.now() + 1).toString(),
        type: 'tink',
        content: getTinkResponse(inputValue),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, tinkResponse]);
    }, 1000);

    setInputValue('');
  };

  const getTinkResponse = (userInput: string): string => {
    const lowerInput = userInput.toLowerCase();
    
    // Performance-related queries
    if (lowerInput.includes('performance') || lowerInput.includes('team') || lowerInput.includes('tracking')) {
      return getPerformanceResponse();
    }
    
    // Deadline-related queries
    if (lowerInput.includes('deadline') || lowerInput.includes('reminder') || lowerInput.includes('email')) {
      return getDeadlineResponse();
    }
    
    // Resource-related queries
    if (lowerInput.includes('resource') || lowerInput.includes('assign') || lowerInput.includes('workload')) {
      return getResourceResponse();
    }

    // Default enhanced responses
    const responses = [
      "I've been monitoring team performance - Sarah's productivity is up 15% this month! 🚀 The automated email reminders are helping with deadline adherence too.",
      "Great question! I noticed Michael needs support on the backend tasks - his confidence scores are dropping. Should I suggest some resources?",
      "Performance tracking shows the design team is excelling, but we have 3 upcoming deadlines that need attention. Want me to send priority reminders?",
      "I'm seeing positive trends across the board! 📈 Task completion rates are up 20% since implementing the smart reminder system.",
      "The AI detected Emily might be approaching burnout based on her workload patterns. I recommend redistributing some tasks. Thoughts?"
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const getPerformanceResponse = (): string => {
    const tracker = PerformanceTracker.getInstance();
    const profiles = tracker.getAllProfiles();
    
    if (profiles.length === 0) {
      return "I'm actively tracking team performance now! 📊 I'll have insights available once I collect more activity data. The system monitors task completion, deadline adherence, quality scores, and collaboration patterns.";
    }

    const highPerformers = profiles.filter(p => p.currentScore > 80).length;
    const atRiskResources = profiles.filter(p => p.riskLevel === 'high' || p.riskLevel === 'critical').length;
    const improvingTrend = profiles.filter(p => p.trend === 'improving').length;

    return `📈 **Performance Overview:**
• ${highPerformers} team members performing excellently (80+ score)
• ${improvingTrend} resources showing improvement trends
• ${atRiskResources} resources need attention${atRiskResources > 0 ? ' - I recommend workload adjustment' : ''}

Top insight: ${profiles.length > 0 ? `${profiles[0].resourceName} is leading with ${Math.round(profiles[0].currentScore)} performance score!` : 'Team performance tracking is initializing.'}`;
  };

  const getDeadlineResponse = (): string => {
    const emailService = EmailReminderService.getInstance();
    const reminders = emailService.getReminders();
    const rebaselineRequests = emailService.getRebaselineRequests();
    
    const pendingReminders = reminders.filter(r => !r.sent);
    const pendingRebaselines = rebaselineRequests.filter(r => r.status === 'pending');
    
    return `📧 **Smart Deadline System Status:**
• ${reminders.length} total reminders scheduled
• ${pendingReminders.length} pending email notifications
• ${pendingRebaselines.length} rebaseline requests awaiting approval

The system sends reminders at 7 days, 3 days, 1 day before, day of, and overdue. Resources can respond directly to indicate if they're on track or need extensions. ${pendingRebaselines.length > 0 ? 'You have deadline extension requests to review!' : 'All deadlines are being monitored actively.'}`;
  };

  const getResourceResponse = (): string => {
    const tracker = PerformanceTracker.getInstance();
    const profiles = tracker.getAllProfiles();
    
    if (profiles.length === 0) {
      return "I'm learning about your team's work patterns! 🎯 Once I have more data, I'll provide smart resource allocation suggestions based on performance metrics, workload analysis, and skill matching.";
    }

    const available = profiles.filter(p => p.riskLevel === 'low' && p.currentScore > 70);
    const overloaded = profiles.filter(p => p.riskLevel === 'high' || p.riskLevel === 'critical');
    
    return `👥 **Smart Resource Insights:**
• ${available.length} resources optimal for new assignments
• ${overloaded.length} resources showing overload signals
• AI recommendation: ${overloaded.length > 0 ? 'Redistribute workload to prevent burnout' : 'Team capacity looks healthy for new projects'}

💡 Pro tip: I can suggest the best resource for specific tasks based on performance history, current workload, and skill alignment!`;
  };

  return (
    <>
      {/* Enhanced 3D Floating Chat Button with Alive Animations */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          {/* Pulsing ring animation around button */}
          <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" style={{ animationDuration: '3s' }}></div>
          <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping" style={{ animationDuration: '2s', animationDelay: '0.5s' }}></div>
          
          <Button
            onClick={() => setIsOpen(true)}
            className="relative w-16 h-16 rounded-full bg-gradient-to-br from-primary via-primary to-primary/80 
                     text-primary-foreground shadow-2xl hover:shadow-3xl transition-all duration-500 
                     animate-float hover:scale-110 active:scale-95
                     before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-br 
                     before:from-white/20 before:to-transparent before:opacity-0 hover:before:opacity-100
                     before:transition-opacity before:duration-300
                     transform-gpu perspective-1000 hover:rotateY-12 hover:rotateX-6"
            size="icon"
            style={{
              boxShadow: `
                0 10px 25px -5px rgba(59, 130, 246, 0.3),
                0 25px 50px -12px rgba(59, 130, 246, 0.25),
                inset 0 1px 0 rgba(255, 255, 255, 0.2),
                inset 0 -1px 0 rgba(0, 0, 0, 0.1)
              `
            }}
          >
            {/* 3D Inner Container */}
            <div className="relative transform transition-transform duration-300 group-hover:scale-110">
              <MessageSquare className="h-7 w-7 animate-pulse-slow" />
              
              {/* Enhanced Performance Alert Indicator with 3D Effect */}
              <div className="absolute -top-2 -right-2 w-5 h-5 bg-gradient-to-br from-orange-400 to-orange-600 
                            rounded-full flex items-center justify-center shadow-lg animate-bounce
                            before:absolute before:inset-0.5 before:rounded-full before:bg-gradient-to-br 
                            before:from-orange-300 before:to-orange-500"
                   style={{
                     boxShadow: `
                       0 4px 8px rgba(251, 146, 60, 0.4),
                       inset 0 1px 0 rgba(255, 255, 255, 0.3)
                     `
                   }}>
                <TrendingUp className="h-2.5 w-2.5 text-white relative z-10" />
                {/* Pulsing dot */}
                <div className="absolute inset-0 rounded-full bg-orange-400 animate-ping opacity-60"></div>
              </div>
            </div>
          </Button>
        </div>
      )}

      {/* Enhanced 3D Chat Interface with Entrance Animation */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 h-96 z-50 animate-scale-in">
          {/* 3D Card Container */}
          <div className="relative w-full h-full bg-gradient-to-br from-card via-card to-card/95 
                        border border-border/50 rounded-2xl shadow-2xl 
                        backdrop-blur-xl backdrop-saturate-150
                        transform-gpu perspective-1000 hover:rotateY-2 hover:rotateX-1
                        transition-all duration-500 flex flex-col"
               style={{
                 boxShadow: `
                   0 25px 50px -12px rgba(0, 0, 0, 0.25),
                   0 10px 25px -5px rgba(59, 130, 246, 0.1),
                   inset 0 1px 0 rgba(255, 255, 255, 0.1),
                   inset 0 -1px 0 rgba(0, 0, 0, 0.05)
                 `
               }}>
            
            {/* Enhanced Header with 3D Effect */}
            <div className="flex items-center justify-between p-4 border-b border-border/30 
                          bg-gradient-to-r from-muted/30 to-muted/10 rounded-t-2xl">
              <div className="flex items-center gap-3">
                {/* 3D Avatar with Breathing Animation */}
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary via-primary to-primary/80 
                                flex items-center justify-center relative overflow-hidden
                                shadow-lg animate-pulse-slow transform-gpu
                                before:absolute before:inset-0 before:rounded-full 
                                before:bg-gradient-to-br before:from-white/30 before:to-transparent"
                       style={{
                         boxShadow: `
                           0 8px 16px rgba(59, 130, 246, 0.3),
                           inset 0 1px 0 rgba(255, 255, 255, 0.2)
                         `
                       }}>
                    <span className="text-primary-foreground font-bold text-lg relative z-10 
                                   animate-pulse-slow">T</span>
                  </div>
                  {/* Active Status Indicator with 3D Effect */}
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-gradient-to-br from-green-400 to-green-600 
                                rounded-full border-2 border-card animate-pulse-slow"
                       style={{
                         boxShadow: `
                           0 2px 4px rgba(34, 197, 94, 0.4),
                           inset 0 1px 0 rgba(255, 255, 255, 0.3)
                         `
                       }}></div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-foreground text-lg">Tink AI</h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                    <TrendingUp className="h-3 w-3 animate-pulse text-green-500" />
                    <span className="animate-gradient-shift bg-gradient-to-r from-green-500 to-blue-500 
                                   bg-clip-text text-transparent">Performance Tracking Active</span>
                  </p>
                </div>
              </div>
              
              <Button
                onClick={() => setIsOpen(false)}
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full hover:bg-destructive/10 hover:text-destructive 
                         transition-all duration-300 hover:scale-110 active:scale-95
                         hover:shadow-lg transform-gpu"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Enhanced Messages Container with 3D Scroll */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 
                          bg-gradient-to-b from-transparent to-muted/5">
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={`flex animate-fade-in ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-4 text-sm shadow-lg transform-gpu
                              hover:scale-[1.02] transition-all duration-300 relative
                              ${message.type === 'user'
                                ? 'bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground ml-4'
                                : 'bg-gradient-to-br from-muted via-muted to-muted/80 text-foreground mr-4'
                              }`}
                    style={{
                      boxShadow: message.type === 'user' 
                        ? `0 8px 16px rgba(59, 130, 246, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)`
                        : `0 8px 16px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)`
                    }}
                  >
                    {message.content}
                    {/* 3D Message Tail */}
                    <div className={`absolute top-4 w-0 h-0 
                                   ${message.type === 'user' 
                                     ? '-right-2 border-l-8 border-l-primary border-t-4 border-b-4 border-t-transparent border-b-transparent' 
                                     : '-left-2 border-r-8 border-r-muted border-t-4 border-b-4 border-t-transparent border-b-transparent'
                                   }`}></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Enhanced Input Section with 3D Effects */}
            <div className="p-4 border-t border-border/30 space-y-3 
                          bg-gradient-to-r from-muted/20 to-muted/5 rounded-b-2xl">
              {/* Enhanced Quick Action Buttons with 3D Hover */}
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
                    className="text-xs px-3 py-1.5 h-7 rounded-full border-border/50
                             hover:bg-primary/10 hover:border-primary/30 hover:text-primary
                             transition-all duration-300 hover:scale-105 active:scale-95
                             hover:shadow-md transform-gpu backdrop-blur-sm"
                    onClick={() => setInputValue(btn.action)}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {btn.label}
                  </Button>
                ))}
              </div>
              
              {/* Enhanced Input Container with 3D Effect */}
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Ask about performance, deadlines, or resources..."
                    className="w-full px-4 py-3 text-sm bg-background/80 border border-border/50 
                             rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 
                             focus:border-primary/50 transition-all duration-300
                             backdrop-blur-sm hover:bg-background/90 focus:bg-background
                             placeholder:text-muted-foreground/70"
                    style={{
                      boxShadow: `
                        inset 0 2px 4px rgba(0, 0, 0, 0.05),
                        0 1px 2px rgba(0, 0, 0, 0.05)
                      `
                    }}
                  />
                </div>
                
                <Button 
                  onClick={sendMessage} 
                  size="icon" 
                  className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary via-primary to-primary/80
                           hover:from-primary/90 hover:via-primary hover:to-primary
                           shadow-lg hover:shadow-xl transition-all duration-300 
                           hover:scale-105 active:scale-95 transform-gpu
                           disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!inputValue.trim()}
                  style={{
                    boxShadow: `
                      0 8px 16px rgba(59, 130, 246, 0.3),
                      inset 0 1px 0 rgba(255, 255, 255, 0.2)
                    `
                  }}
                >
                  <Send className="h-5 w-5 text-primary-foreground transform transition-transform 
                                 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
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
