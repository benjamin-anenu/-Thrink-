
import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InlineTextEditProps {
  value: string;
  onSave: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const InlineTextEdit: React.FC<InlineTextEditProps> = ({
  value,
  onSave,
  placeholder,
  className = "",
  disabled = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    if (editValue.trim() !== value) {
      onSave(editValue.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className={`flex items-center gap-1 ${className}`}>
        <Input
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleSave}
          placeholder={placeholder}
          className="h-8 text-sm"
        />
        <Button size="sm" variant="ghost" onClick={handleSave} className="h-6 w-6 p-0">
          <Check className="h-3 w-3" />
        </Button>
        <Button size="sm" variant="ghost" onClick={handleCancel} className="h-6 w-6 p-0">
          <X className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  return (
    <div
      className={`${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-muted/50'} p-1 rounded ${className}`}
      onClick={() => !disabled && setIsEditing(true)}
      title={disabled ? "Editing disabled" : "Click to edit"}
    >
      {value || <span className="text-muted-foreground italic">{placeholder}</span>}
    </div>
  );
};

export default InlineTextEdit;
