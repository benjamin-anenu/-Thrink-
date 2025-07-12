
import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InlineMultiSelectEditProps {
  value: string[];
  options: Array<{ id: string; name: string; role?: string }>;
  onSave: (value: string[]) => void;
  placeholder?: string;
  className?: string;
}

const InlineMultiSelectEdit: React.FC<InlineMultiSelectEditProps> = ({
  value,
  options,
  onSave,
  placeholder,
  className = ""
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedValues, setSelectedValues] = useState(value);

  const handleAddValue = (newValue: string) => {
    if (!selectedValues.includes(newValue)) {
      const updated = [...selectedValues, newValue];
      setSelectedValues(updated);
      onSave(updated);
    }
  };

  const handleRemoveValue = (valueToRemove: string) => {
    const updated = selectedValues.filter(v => v !== valueToRemove);
    setSelectedValues(updated);
    onSave(updated);
  };

  const selectedOptions = options.filter(opt => selectedValues.includes(opt.id));
  const availableOptions = options.filter(opt => !selectedValues.includes(opt.id));

  if (isEditing) {
    return (
      <div className={`space-y-2 ${className}`}>
        {selectedValues.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {selectedOptions.map((option) => (
              <Badge key={option.id} variant="secondary" className="flex items-center gap-1">
                {option.name}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleRemoveValue(option.id)}
                  className="h-4 w-4 p-0 hover:bg-transparent"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        )}
        <Select onValueChange={handleAddValue} onOpenChange={(open) => !open && setIsEditing(false)}>
          <SelectTrigger className="h-8 text-sm">
            <SelectValue placeholder="Add resource..." />
          </SelectTrigger>
          <SelectContent>
            {availableOptions.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                <div>
                  <div className="font-medium">{option.name}</div>
                  {option.role && <div className="text-xs text-muted-foreground">{option.role}</div>}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  return (
    <div
      className={`cursor-pointer hover:bg-muted/50 p-1 rounded ${className}`}
      onClick={() => setIsEditing(true)}
      title="Click to edit"
    >
      {selectedValues.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {selectedOptions.map((option) => (
            <Badge key={option.id} variant="secondary" className="text-xs">
              {option.name}
            </Badge>
          ))}
        </div>
      ) : (
        <span className="text-muted-foreground italic">{placeholder}</span>
      )}
    </div>
  );
};

export default InlineMultiSelectEdit;
