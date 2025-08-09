import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Phone, MessageCircle } from 'lucide-react';
import type { Stakeholder } from '@/types/stakeholder';

interface StakeholderContactModalProps {
  open: boolean;
  onClose: () => void;
  stakeholder: Stakeholder | null;
  onContact: (stakeholder: Stakeholder, contactType: string, message?: string) => void;
}

const StakeholderContactModal: React.FC<StakeholderContactModalProps> = ({
  open,
  onClose,
  stakeholder,
  onContact
}) => {
  const [contactType, setContactType] = useState<'email' | 'phone' | 'message'>('email');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  if (!stakeholder) return null;

  const handleContact = () => {
    switch (contactType) {
      case 'email':
        if (stakeholder.email) {
          const mailtoLink = `mailto:${stakeholder.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
          window.open(mailtoLink);
        }
        break;
      case 'phone':
        if (stakeholder.phone) {
          window.open(`tel:${stakeholder.phone}`);
        }
        break;
      case 'message':
        // Log the interaction
        console.log('Message sent to stakeholder:', { stakeholder: stakeholder.name, message });
        break;
    }
    
    onContact(stakeholder, contactType, message);
    onClose();
  };

  const resetForm = () => {
    setSubject('');
    setMessage('');
    setContactType('email');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Contact {stakeholder.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <div className="font-medium">{stakeholder.name}</div>
            <div className="text-sm text-muted-foreground">• {stakeholder.role}</div>
          </div>

          <div className="space-y-3">
            <Label>Contact Method</Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={contactType === 'email' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setContactType('email')}
                disabled={!stakeholder.email}
                className="flex items-center gap-2"
              >
                <Mail className="h-4 w-4" />
                Email
              </Button>
              <Button
                variant={contactType === 'phone' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setContactType('phone')}
                disabled={!stakeholder.phone}
                className="flex items-center gap-2"
              >
                <Phone className="h-4 w-4" />
                Phone
              </Button>
              <Button
                variant={contactType === 'message' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setContactType('message')}
                className="flex items-center gap-2"
              >
                <MessageCircle className="h-4 w-4" />
                Log
              </Button>
            </div>
          </div>

          {contactType === 'email' && (
            <div className="space-y-3">
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Email subject"
                />
              </div>
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Your message..."
                  rows={4}
                />
              </div>
            </div>
          )}

          {contactType === 'message' && (
            <div>
              <Label htmlFor="log-message">Contact Log</Label>
              <Textarea
                id="log-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe the contact or interaction..."
                rows={4}
              />
            </div>
          )}

          {contactType === 'phone' && (
            <div className="p-3 bg-accent/10 rounded-lg text-sm">
              <p>This will open your device's phone app to call:</p>
              <p className="font-medium">{stakeholder.phone}</p>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleContact}>
              {contactType === 'email' ? 'Send Email' : 
               contactType === 'phone' ? 'Call Now' : 
               'Log Contact'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StakeholderContactModal;