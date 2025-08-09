import React, { useMemo } from 'react';
import { ACTION_WORDS, type ActionWord } from '@/services/local/ActionWords';

interface Props {
  query: string;
  onSelect: (action: ActionWord) => void;
}

const ActionAutocomplete: React.FC<Props> = ({ query, onSelect }) => {
  const getCommandLabel = (a: ActionWord) => {
    const capitalize = (s: string) => (s ? s[0].toUpperCase() + s.slice(1).toLowerCase() : '');
    const singularCategory = a.category.replace(/s$/, '');
    const catPlural = a.category;
    let core = a.id;
    if (core.endsWith(`_${catPlural}`)) core = core.slice(0, -(catPlural.length + 1));
    if (core.startsWith(`${catPlural}_`)) core = core.slice(catPlural.length + 1);
    const coreTitle = core.split('_').filter(Boolean).map(capitalize).join('_');
    return `${capitalize(singularCategory)}_${coreTitle || 'General'}`;
  };

  const results = useMemo(() => {
    const raw = (query || '').toLowerCase();
    const q = raw.replace(/^@+/, '').trim();
    if (!q) return ACTION_WORDS; // show all when typing "@" or empty
    const qq = q.replace(/_/g, ' ');
    return ACTION_WORDS.filter(a => {
      const hay = [
        a.id,
        a.category,
        ...(a.keywords || []),
        ...((a.aliases || [])),
        a.description,
        getCommandLabel(a)
      ].join(' ').toLowerCase().replace(/_/g, ' ');
      return hay.includes(qq);
    });
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
              <span className="font-medium">@{getCommandLabel(item)}</span>
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
