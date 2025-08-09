import React, { useMemo } from 'react';
import { ACTION_WORDS, type ActionWord } from '@/services/local/ActionWords';

interface Props {
  query: string;
  onSelect: (action: ActionWord) => void;
}

const ActionAutocomplete: React.FC<Props> = ({ query, onSelect }) => {
  const results = useMemo(() => {
    const q = (query || '').toLowerCase();
    if (!q) return ACTION_WORDS.slice(0, 10);
    return ACTION_WORDS.filter(a =>
      a.keywords.some(k => k.toLowerCase().includes(q)) ||
      (a.aliases || []).some(al => al.toLowerCase().includes(q)) ||
      a.description.toLowerCase().includes(q)
    ).slice(0, 10);
  }, [query]);

  if (results.length === 0) return null;

  return (
    <div className="absolute left-0 bottom-full mb-2 w-full rounded-md border border-border bg-popover text-popover-foreground shadow-lg z-[9999]">
      <ul className="max-h-64 overflow-auto">
        {results.map(item => (
          <li
            key={item.id}
            className="px-3 py-2 cursor-pointer hover:bg-accent text-sm text-foreground"
            onClick={() => onSelect(item)}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">@{item.keywords[0]}</span>
              <span className="text-xs text-muted-foreground">{item.category}</span>
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">{item.description}</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ActionAutocomplete;
