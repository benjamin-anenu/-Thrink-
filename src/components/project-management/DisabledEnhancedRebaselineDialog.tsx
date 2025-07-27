import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface DisabledEnhancedRebaselineDialogProps {
  projectId: string;
  onClose: () => void;
}

const DisabledEnhancedRebaselineDialog: React.FC<DisabledEnhancedRebaselineDialogProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-card p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
          <h3 className="text-lg font-semibold mb-2">Feature Temporarily Disabled</h3>
          <p className="text-muted-foreground mb-4">
            The rebaseline feature requires additional database setup and is currently disabled.
          </p>
          <Button onClick={onClose} className="w-full">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DisabledEnhancedRebaselineDialog;