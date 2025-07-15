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
      content: "Hey! I'm Tink, your AI project assistant. I'm now tracking team performance and sending smart deadline reminders. I noticed Sarah completed her UI task ahead of schedule - great work! 🎯 Want me to show you the latest team insights?",
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
      {/* Floating Chat Button with Performance Indicator */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 z-50 relative"
          size="icon"
        >
          <MessageSquare className="h-6 w-6" />
          {/* Performance alert indicator */}
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
            <TrendingUp className="h-2 w-2 text-white" />
          </div>
        </Button>
      )}

      {/* Enhanced Chat Interface */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 h-96 bg-card border border-border rounded-lg shadow-xl z-50 flex flex-col">
          {/* Header with Performance Indicator */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center relative">
                <span className="text-primary-foreground font-medium text-sm">T</span>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-card"></div>
              </div>
              <div>
                <h3 className="font-medium text-foreground">Tink AI</h3>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Performance Tracking Active
                </p>
              </div>
            </div>
            <Button
              onClick={() => setIsOpen(false)}
              variant="ghost"
              size="icon"
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 text-sm ${
                    message.type === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
          </div>

          {/* Enhanced Input with Quick Actions */}
          <div className="p-4 border-t border-border space-y-2">
            {/* Quick Action Buttons */}
            <div className="flex gap-1 mb-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs px-2 py-1 h-6"
                onClick={() => setInputValue('Show team performance')}
              >
                📊 Performance
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs px-2 py-1 h-6"
                onClick={() => setInputValue('Deadline status')}
              >
                ⏰ Deadlines
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs px-2 py-1 h-6"
                onClick={() => setInputValue('Resource allocation')}
              >
                👥 Resources
              </Button>
            </div>
            
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Ask about performance, deadlines, or resources..."
                className="flex-1 px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button onClick={sendMessage} size="icon" className="h-10 w-10">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TinkAssistant;
