
import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface InlineSelectEditProps {
  value: string;
  options: Array<{ value: string; label: string; color?: string }>;
  onSave: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const InlineSelectEdit: React.FC<InlineSelectEditProps> = ({
  value,
  options,
  onSave,
  placeholder,
  className = ""
}) => {
  const [isEditing, setIsEditing] = useState(false);

  const currentOption = options.find(opt => opt.value === value);

  const handleValueChange = (newValue: string) => {
    onSave(newValue);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <Select value={value} onValueChange={handleValueChange} onOpenChange={setIsEditing}>
        <SelectTrigger className={`h-8 text-sm ${className}`}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <div
      className={`cursor-pointer hover:bg-muted/50 p-1 rounded ${className}`}
      onClick={() => setIsEditing(true)}
      title="Click to edit"
    >
      {currentOption ? (
        <Badge 
          variant="outline" 
          className={currentOption.color ? `${currentOption.color} text-white` : ''}
        >
          {currentOption.label}
        </Badge>
      ) : (
        <span className="text-muted-foreground italic">{placeholder}</span>
      )}
    </div>
  );
};

export default InlineSelectEdit;
