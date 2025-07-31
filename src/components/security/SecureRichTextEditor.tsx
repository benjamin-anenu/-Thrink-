
import React, { useCallback, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Bold, Italic, List, Link } from 'lucide-react';
import DOMPurify from 'dompurify';

interface SecureRichTextEditorProps {
  value: string;
  onChange: (value: string) -> void;
  placeholder?: string;
  className?: string;
  maxLength?: number;
}

export const SecureRichTextEditor: React.FC<SecureRichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Enter text...",
  className = "",
  maxLength = 5000
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const isComposing = useRef(false);

  // Configure DOMPurify for safe HTML
  const sanitizeConfig = {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'a'],
    ALLOWED_ATTR: ['href', 'target'],
    ALLOW_DATA_ATTR: false,
    FORBID_SCRIPT: true,
    FORBID_TAGS: ['script', 'object', 'embed', 'base', 'link'],
    FORBID_ATTR: ['onclick', 'onload', 'onerror', 'onmouseover', 'onfocus', 'onblur']
  };

  // Sanitize content
  const sanitizeContent = useCallback((html: string): string => {
    return DOMPurify.sanitize(html, sanitizeConfig);
  }, []);

  // Handle input changes
  const handleInput = useCallback(() => {
    if (isComposing.current || !editorRef.current) return;
    
    const content = editorRef.current.innerHTML;
    const sanitized = sanitizeContent(content);
    
    // Check length limit
    const textLength = editorRef.current.textContent?.length || 0;
    if (textLength > maxLength) {
      return;
    }
    
    // Update if content changed after sanitization
    if (content !== sanitized) {
      editorRef.current.innerHTML = sanitized;
      // Restore cursor position at end
      const range = document.createRange();
      range.selectNodeContents(editorRef.current);
      range.collapse(false);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
    
    onChange(sanitized);
  }, [onChange, sanitizeContent, maxLength]);

  // Handle composition events
  const handleCompositionStart = () => {
    isComposing.current = true;
  };

  const handleCompositionEnd = () => {
    isComposing.current = false;
    handleInput();
  };

  // Toolbar actions
  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      // Validate URL
      try {
        const validUrl = new URL(url);
        if (['http:', 'https:'].includes(validUrl.protocol)) {
          execCommand('createLink', validUrl.toString());
        }
      } catch {
        alert('Please enter a valid HTTP/HTTPS URL');
      }
    }
  };

  // Initialize editor content
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = sanitizeContent(value);
    }
  }, [value, sanitizeContent]);

  // Prevent paste of unsafe content
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    const sanitizedText = text.replace(/[<>]/g, '').substring(0, maxLength);
    document.execCommand('insertText', false, sanitizedText);
    handleInput();
  };

  const currentLength = editorRef.current?.textContent?.length || 0;
  const isOverLimit = currentLength > maxLength;

  return (
    <div className={`border border-border rounded-lg ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b border-border bg-muted/30">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand('bold')}
          className="h-8 w-8 p-0"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand('italic')}
          className="h-8 w-8 p-0"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand('insertUnorderedList')}
          className="h-8 w-8 p-0"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={insertLink}
          className="h-8 w-8 p-0"
        >
          <Link className="h-4 w-4" />
        </Button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        onPaste={handlePaste}
        className="p-3 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-primary/20"
        style={{ 
          wordBreak: 'break-word',
          whiteSpace: 'pre-wrap'
        }}
        suppressContentEditableWarning={true}
        data-placeholder={placeholder}
      />

      {/* Character count */}
      <div className="px-3 py-2 text-sm text-muted-foreground border-t border-border">
        <span className={isOverLimit ? 'text-destructive' : ''}>
          {currentLength} / {maxLength} characters
        </span>
      </div>
    </div>
  );
};
