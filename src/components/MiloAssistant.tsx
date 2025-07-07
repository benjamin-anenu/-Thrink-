
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageSquare, X, Send } from 'lucide-react';

interface MiloMessage {
  id: string;
  type: 'user' | 'milo';
  content: string;
  timestamp: Date;
}

const MiloAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<MiloMessage[]>([
    {
      id: '1',
      type: 'milo',
      content: "Hey there! I'm Milo, your project assistant. Quick heads-up - you have 3 tasks due today. Want me to show you what's coming up? 🎯",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');

  const sendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: MiloMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    // Simulate Milo's response
    setTimeout(() => {
      const miloResponse: MiloMessage = {
        id: (Date.now() + 1).toString(),
        type: 'milo',
        content: getMiloResponse(inputValue),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, miloResponse]);
    }, 1000);

    setInputValue('');
  };

  const getMiloResponse = (userInput: string): string => {
    const responses = [
      "Nice work on those completed tasks! 🎉 I see Project Atlas is running 2 days behind schedule. Should I nudge the finance team?",
      "No stress, but you might want to check the stakeholder feedback on the design mockups. They're waiting for your review.",
      "All clear on your end! Just a heads-up - the Q2 planning meeting is tomorrow. Want me to prepare a quick project status summary?",
      "Great question! Based on current progress, Project Beta should wrap up by Friday. The payment processing tasks are moving smoothly.",
      "I noticed you've been crushing it with 6 tasks completed today! 🚀 The mobile responsive design is looking solid."
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300 z-50"
          size="icon"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      )}

      {/* Chat Interface */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 h-96 bg-card border border-border rounded-lg shadow-xl z-50 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-medium text-sm">M</span>
              </div>
              <div>
                <h3 className="font-medium text-foreground">Milo</h3>
                <p className="text-xs text-muted-foreground">Your AI Assistant</p>
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

          {/* Input */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Ask Milo anything..."
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

export default MiloAssistant;
