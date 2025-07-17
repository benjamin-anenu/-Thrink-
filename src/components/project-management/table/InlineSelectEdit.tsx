
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
}

const InlineSelectEdit: React.FC<InlineSelectEditProps> = ({
  value,
  options,
  onSave,
  placeholder,
  className = "",
  allowEmpty = false
}) => {
  const [isEditing, setIsEditing] = useState(false);

  // Use a special value for empty/none option instead of empty string
  const EMPTY_VALUE = "__EMPTY__";
  
  // Convert actual value to internal value for the select
  const internalValue = value || (allowEmpty ? EMPTY_VALUE : options[0]?.value || '');
  
  const currentOption = options.find(opt => opt.value === value);

  const handleValueChange = (newValue: string) => {
    // Convert the special empty value back to empty string
    const actualValue = newValue === EMPTY_VALUE ? '' : newValue;
    onSave(actualValue);
    setIsEditing(false);
  };

  // Create options with proper handling for empty values
  const selectOptions = allowEmpty 
    ? [{ value: EMPTY_VALUE, label: 'None' }, ...options]
    : options;

  if (isEditing) {
    return (
      <Select value={internalValue} onValueChange={handleValueChange} onOpenChange={setIsEditing}>
        <SelectTrigger className={`h-8 text-sm ${className}`}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {selectOptions.map((option) => (
            <SelectItem 
              key={option.value} 
              value={option.value}
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
