
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, Tag, AlertTriangle, CheckCircle2, X } from 'lucide-react';
import { format } from 'date-fns';
import DOMPurify from 'dompurify';

interface Task {
  id: string;
  name: string;
  description: string;
  status: string;
  priority: string;
  assignee: string;
  startDate: string;
  endDate: string;
  progress: number;
  tags?: string[];
}

interface SecureTaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (taskId: string, updates: Partial<Task>) => void;
  readOnly?: boolean;
}

// Input sanitization utility
const sanitizeInput = (input: string): string => {
  if (!input) return '';
  
  // Remove any HTML tags and scripts
  let sanitized = DOMPurify.sanitize(input, { 
    ALLOWED_TAGS: [], 
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true
  });
  
  // Additional cleaning for dangerous patterns
  sanitized = sanitized.replace(/[<>]/g, '');
  sanitized = sanitized.replace(/javascript:/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=/gi, '');
  
  return sanitized.trim();
};

// Validation rules
const validateInput = (field: string, value: string): { isValid: boolean; error?: string } => {
  const maxLengths = {
    name: 200,
    description: 1000,
    assignee: 100
  };

  if (!value.trim()) {
    return { isValid: false, error: `${field} is required` };
  }

  const maxLength = maxLengths[field as keyof typeof maxLengths];
  if (maxLength && value.length > maxLength) {
    return { isValid: false, error: `${field} must be less than ${maxLength} characters` };
  }

  // Check for suspicious patterns
  const dangerousPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /\b(DROP|DELETE|UPDATE|INSERT|CREATE|ALTER|TRUNCATE)\b/gi
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(value)) {
      return { isValid: false, error: `${field} contains invalid characters` };
    }
  }

  return { isValid: true };
};

const SecureTaskDetailModal: React.FC<SecureTaskDetailModalProps> = ({
  task,
  isOpen,
  onClose,
  onUpdate,
  readOnly = false
}) => {
  const [editedTask, setEditedTask] = useState<Task | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (task) {
      setEditedTask({ ...task });
      setValidationErrors({});
      setIsDirty(false);
    }
  }, [task]);

  const handleInputChange = (field: keyof Task, value: string) => {
    if (!editedTask || readOnly) return;

    const sanitizedValue = sanitizeInput(value);
    const validation = validateInput(field, sanitizedValue);
    
    setValidationErrors(prev => ({
      ...prev,
      [field]: validation.error || ''
    }));

    setEditedTask(prev => prev ? {
      ...prev,
      [field]: sanitizedValue
    } : null);
    
    setIsDirty(true);
  };

  const handleSave = () => {
    if (!editedTask || !task) return;

    // Validate all fields before saving
    const errors: Record<string, string> = {};
    let hasErrors = false;

    ['name', 'description', 'assignee'].forEach(field => {
      const validation = validateInput(field, editedTask[field as keyof Task] as string);
      if (!validation.isValid) {
        errors[field] = validation.error || '';
        hasErrors = true;
      }
    });

    if (hasErrors) {
      setValidationErrors(errors);
      return;
    }

    // Additional security check before updating
    const secureUpdates = {
      name: sanitizeInput(editedTask.name),
      description: sanitizeInput(editedTask.description),
      assignee: sanitizeInput(editedTask.assignee),
      status: editedTask.status,
      priority: editedTask.priority,
      progress: Math.max(0, Math.min(100, editedTask.progress)) // Ensure progress is within bounds
    };

    onUpdate(task.id, secureUpdates);
    setIsEditing(false);
    setIsDirty(false);
  };

  const handleCancel = () => {
    if (task) {
      setEditedTask({ ...task });
    }
    setIsEditing(false);
    setValidationErrors({});
    setIsDirty(false);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in progress': return 'bg-blue-100 text-blue-800';
      case 'on hold': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!editedTask) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-blue-600" />
            {isEditing ? 'Edit Task' : 'Task Details'}
          </DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-6">
          {/* Task Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Task Name</label>
            {isEditing ? (
              <div>
                <Input
                  value={editedTask.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter task name"
                  maxLength={200}
                  className={validationErrors.name ? 'border-red-500' : ''}
                />
                {validationErrors.name && (
                  <p className="text-sm text-red-600 mt-1">{validationErrors.name}</p>
                )}
              </div>
            ) : (
              <p className="text-lg font-semibold">{editedTask.name}</p>
            )}
          </div>

          {/* Status and Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Status</label>
              <Badge className={getStatusColor(editedTask.status)}>
                {editedTask.status}
              </Badge>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Priority</label>
              <Badge className={getPriorityColor(editedTask.priority)}>
                {editedTask.priority}
              </Badge>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Description</label>
            {isEditing ? (
              <div>
                <Textarea
                  value={editedTask.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter task description"
                  rows={4}
                  maxLength={1000}
                  className={validationErrors.description ? 'border-red-500' : ''}
                />
                {validationErrors.description && (
                  <p className="text-sm text-red-600 mt-1">{validationErrors.description}</p>
                )}
              </div>
            ) : (
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="whitespace-pre-wrap">{editedTask.description || 'No description provided'}</p>
              </div>
            )}
          </div>

          {/* Assignee */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Assignee</label>
            {isEditing ? (
              <div>
                <Input
                  value={editedTask.assignee}
                  onChange={(e) => handleInputChange('assignee', e.target.value)}
                  placeholder="Enter assignee name"
                  maxLength={100}
                  className={validationErrors.assignee ? 'border-red-500' : ''}
                />
                {validationErrors.assignee && (
                  <p className="text-sm text-red-600 mt-1">{validationErrors.assignee}</p>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <span>{editedTask.assignee || 'Unassigned'}</span>
              </div>
            )}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Start Date</label>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span>{editedTask.startDate ? format(new Date(editedTask.startDate), 'MMM dd, yyyy') : 'Not set'}</span>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">End Date</label>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span>{editedTask.endDate ? format(new Date(editedTask.endDate), 'MMM dd, yyyy') : 'Not set'}</span>
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Progress</label>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${editedTask.progress}%` }}
                />
              </div>
              <span className="text-sm font-medium text-gray-700">{editedTask.progress}%</span>
            </div>
          </div>

          {/* Tags */}
          {editedTask.tags && editedTask.tags.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Tags</label>
              <div className="flex flex-wrap gap-2">
                {editedTask.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    <Tag className="h-3 w-3" />
                    {sanitizeInput(tag)}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        {!readOnly && (
          <div className="flex justify-end gap-2 pt-4 border-t">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={Object.keys(validationErrors).length > 0}>
                  Save Changes
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>
                Edit Task
              </Button>
            )}
          </div>
        )}

        {isDirty && !isEditing && (
          <div className="flex items-center gap-2 text-amber-600 text-sm">
            <AlertTriangle className="h-4 w-4" />
            You have unsaved changes
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SecureTaskDetailModal;
