
import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface InlineSelectEditProps {
  value: string;
  options: Array<{ value: string; label: string; color?: string }>;
  onSave: (value: string) => void;
  placeholder?: string;
  className?: string;
  allowEmpty?: boolean;
  renderValue?: (value: string) => React.ReactNode;
}

const InlineSelectEdit: React.FC<InlineSelectEditProps> = ({
  value,
  options,
  onSave,
  placeholder,
  className = "",
  allowEmpty = false,
  renderValue
}) => {
  const [isEditing, setIsEditing] = useState(false);

  // Handle empty values by using a special "__NONE__" value internally
  const internalValue = value === '' ? (allowEmpty ? "__NONE__" : options[0]?.value || '') : value;
  
  const currentOption = options.find(opt => opt.value === value);

  const handleValueChange = (newValue: string) => {
    // Convert the special "__NONE__" value back to empty string
    const actualValue = newValue === "__NONE__" ? '' : newValue;
    onSave(actualValue);
    setIsEditing(false);
  };

  // Ensure all options have non-empty values for SelectItem
  const processedOptions = options.map(option => ({
    ...option,
    internalValue: option.value === '' ? "__NONE__" : option.value
  }));

  if (isEditing) {
    return (
      <Select value={internalValue} onValueChange={handleValueChange} onOpenChange={setIsEditing}>
        <SelectTrigger className={`h-8 text-sm ${className}`}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {processedOptions.map((option) => (
            <SelectItem 
              key={option.internalValue} 
              value={option.internalValue}
            >
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
      {renderValue ? (
        renderValue(value)
      ) : currentOption ? (
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
