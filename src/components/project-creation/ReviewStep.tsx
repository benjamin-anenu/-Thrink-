import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ReviewStepProps {
  data: any;
  onDataChange: (data: any) => void;
}

const ReviewStep: React.FC<ReviewStepProps> = ({ data, onDataChange }) => {

  const renderValue = (value: any): React.ReactNode => {
    if (value === null || value === undefined) {
      return <span className="text-muted-foreground">Not set</span>;
    }
    
    if (Array.isArray(value)) {
      if (value.length === 0) {
        return <span className="text-muted-foreground">None</span>;
      }
      return (
        <div className="space-y-1">
          {value.map((item, index) => (
            <div key={index} className="text-sm">
              {typeof item === 'string' ? item : JSON.stringify(item)}
            </div>
          ))}
        </div>
      );
    }
    
    if (typeof value === 'object') {
      return <pre className="text-sm whitespace-pre-wrap">{JSON.stringify(value, null, 2)}</pre>;
    }
    
    return <span>{String(value)}</span>;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Review Project Details</CardTitle>
          <CardDescription>
            Please review all the information before submitting.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(data).map(([key, value]) => (
            <div key={key} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="font-semibold capitalize">{key.replace(/([A-Z])/g, ' $1')}</div>
              <div>{renderValue(value)}</div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReviewStep;
