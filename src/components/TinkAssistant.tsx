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
      content: "Hi there! I'm Tink, your intelligent project assistant. I'm currently using local intelligence to track team performance and send smart deadline reminders. Real AI integration with OpenAI/Claude is coming soon! 🚀 For now, I'm providing smart responses based on your project data patterns.",
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
      {/* Refined Floating Chat Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          {/* Simplified ambient ring - single layer */}
          <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping" 
               style={{ animationDuration: '3s' }}></div>
          
          <Button
            onClick={() => setIsOpen(true)}
            className="relative w-14 h-14 rounded-full bg-primary text-primary-foreground 
                     shadow-lg hover:shadow-xl transition-all duration-300 ease-out
                     animate-[float_4s_ease-in-out_infinite] hover:scale-105 active:scale-[0.98]
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
            <MessageSquare className="h-6 w-6" />
            
            {/* Coming Soon Badge */}
            <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-primary/90 text-white text-xs rounded-full 
                          border border-white/20 shadow-sm font-medium">
              AI Soon
            </div>
            
            {/* Refined Performance Indicator */}
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success rounded-full 
                          flex items-center justify-center animate-pulse shadow-sm"
                 style={{ animationDuration: '2s' }}>
              <TrendingUp className="h-2 w-2 text-warning-foreground" />
            </div>
          </Button>
        </div>
      )}

      {/* Refined Chat Interface */}
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
            
            {/* Refined Header */}
            <div className="flex items-center justify-between p-4 border-b border-border rounded-t-xl bg-muted/30">
              <div className="flex items-center gap-3">
                {/* Simplified Avatar with breathing effect */}
                <div className="relative">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center 
                                shadow-sm animate-[pulse_3s_ease-in-out_infinite]">
                    <span className="text-primary-foreground font-semibold text-sm">T</span>
                  </div>
                  {/* Refined Status Indicator */}
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-success rounded-full 
                                border border-card shadow-sm"></div>
                </div>
                
                <div>
                  <h3 className="font-medium text-foreground">Tink AI</h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-success" />
                    <span>Performance Active</span>
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

            {/* Refined Messages Container */}
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

            {/* Refined Input Section */}
            <div className="p-4 border-t border-border space-y-3 bg-muted/20 rounded-b-xl">
              {/* Streamlined Quick Actions */}
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
              
              {/* Refined Input Container */}
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
