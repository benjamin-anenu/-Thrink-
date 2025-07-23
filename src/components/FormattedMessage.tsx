
import React from 'react';
import ReactMarkdown from 'react-markdown';

interface FormattedMessageProps {
  content: string;
  type: 'user' | 'tink';
}

const FormattedMessage: React.FC<FormattedMessageProps> = ({ content, type }) => {
  return (
    <div className="formatted-message">
      <ReactMarkdown
        components={{
          // Custom renderers for different markdown elements
          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,
          ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
          li: ({ children }) => <li className="ml-2">{children}</li>,
          h1: ({ children }) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
          h2: ({ children }) => <h2 className="text-md font-semibold mb-2">{children}</h2>,
          h3: ({ children }) => <h3 className="text-sm font-medium mb-1">{children}</h3>,
          code: ({ node, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            const isInline = !match;
            
            return isInline ? (
              <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono" {...props}>
                {children}
              </code>
            ) : (
              <pre className="bg-muted p-2 rounded text-sm font-mono overflow-x-auto mb-2">
                <code className={className} {...props}>
                  {children}
                </code>
              </pre>
            );
          },
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary/30 pl-4 italic mb-2">
              {children}
            </blockquote>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default FormattedMessage;
