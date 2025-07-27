import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

interface EnhancedRebaselineDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit?: (data: any) => void;
  taskId?: string;
}

// Disabled version of EnhancedRebaselineDialog due to missing database table
export const EnhancedRebaselineDialog: React.FC<EnhancedRebaselineDialogProps> = ({ open, onClose }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-96">
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-12 w-12 text-warning mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Feature Temporarily Disabled</h3>
          <p className="text-muted-foreground mb-4">
            Enhanced rebaseline functionality is temporarily disabled due to missing database configuration.
          </p>
          <button 
            onClick={onClose}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
          >
            Close
          </button>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedRebaselineDialog;