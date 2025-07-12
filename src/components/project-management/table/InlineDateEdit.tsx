
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

interface InlineDateEditProps {
  value: string;
  onSave: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const InlineDateEdit: React.FC<InlineDateEditProps> = ({
  value,
  onSave,
  placeholder,
  className = ""
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    value ? parseISO(value) : undefined
  );

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const dateString = format(date, 'yyyy-MM-dd');
      onSave(dateString);
      setSelectedDate(date);
    }
    setIsEditing(false);
  };

  const displayValue = value ? format(parseISO(value), 'MMM d, yyyy') : '';

  if (isEditing) {
    return (
      <Popover open={isEditing} onOpenChange={setIsEditing}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn("h-8 text-sm justify-start", className)}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {displayValue || placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            initialFocus
            className="p-3 pointer-events-auto"
          />
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <div
      className={`cursor-pointer hover:bg-muted/50 p-1 rounded ${className}`}
      onClick={() => setIsEditing(true)}
      title="Click to edit"
    >
      {displayValue || <span className="text-muted-foreground italic">{placeholder}</span>}
    </div>
  );
};

export default InlineDateEdit;
