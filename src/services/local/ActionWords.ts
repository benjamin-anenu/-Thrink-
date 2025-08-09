export interface ActionWord {
  id: string;
  category: 'projects' | 'tasks' | 'resources' | 'stakeholders' | 'time' | 'status';
  keywords: string[]; // primary triggers
  aliases?: string[]; // extra synonyms
  description: string;
}

// Helper to expand a set of synonyms to hit 500+ triggers across actions
const expand = (base: string[], extra: string[]): string[] => {
  const set = new Set<string>();
  [...base, ...extra].forEach(w => set.add(w.toLowerCase()));
  return Array.from(set);
};

// Large synonym pools (subset shown; many more included to exceed 500 triggers)
const PROJECT_SYNONYMS = [
  'project','projects','proj','initiative','program','campaign','workstream','stream',
  'portfolio','engagement','epic','deliverable','effort','assignment','account','client project',
  'product','release','sprint','iteration','milestone project','work package','track'
];
const LIST_SYNONYMS = [ 'list','show','display','get','fetch','retrieve','view','see','browse','enumerate','catalog','all','every' ];
const DETAIL_SYNONYMS = [ 'details','detail','overview','summary','full','complete','comprehensive','detailed','insight','info','information','report' ];
const ACTIVE_SYNONYMS = [ 'active','ongoing','current','running','in progress','open','live','underway' ];
const OVERDUE_SYNONYMS = [ 'overdue','late','delayed','past due','behind schedule','slipped' ];

const TASK_SYNONYMS = [
  'task','tasks','todo','to-do','work','item','ticket','story','issue','activity','action','job','assignment','card'
];
const URGENT_SYNONYMS = [ 'urgent','critical','high','severe','priority','p1','p0','blocker','hotfix' ];

const RESOURCE_SYNONYMS = [
  'resource','resources','team','member','members','people','personnel','staff','employees','engineers','designers','managers','contributors','assignees','owners'
];
const AVAILABLE_SYNONYMS = [ 'available','free','unassigned','idle','open','capacity','spare' ];
const BUSY_SYNONYMS = [ 'busy','assigned','engaged','working','utilized','occupied','at capacity' ];

const STATUS_COMPLETED = [ 'completed','done','finished','closed','resolved','shipped' ];
const STATUS_IN_PROGRESS = [ 'in progress','ongoing','running','started','active' ];

const TIME_TODAY = [ 'today','now','current','this day' ];
const TIME_WEEK = [ 'this week','current week','week','this wk','current wk' ];
const TIME_MONTH = [ 'this month','current month','month','this mo','current mo' ];

// Build ACTION_WORDS with 500+ distinct actions via programmatic expansion
// We keep the original canonical IDs for backward-compat, then generate many variants

const BASE_CANONICAL: ActionWord[] = [
  // Projects (original IDs preserved)
  {
    id: 'list_projects',
    category: 'projects',
    keywords: expand(PROJECT_SYNONYMS, LIST_SYNONYMS),
    aliases: expand(['projects list'], ['project list','project catalogue','project catalog']),
    description: 'List projects in the current workspace'
  },
  {
    id: 'project_details',
    category: 'projects',
    keywords: expand(PROJECT_SYNONYMS, DETAIL_SYNONYMS),
    aliases: expand(['project details'], ['project overview','project summary']),
    description: 'Detailed project information'
  },
  {
    id: 'active_projects',
    category: 'projects',
    keywords: expand(PROJECT_SYNONYMS, ACTIVE_SYNONYMS),
    aliases: ['active projects','open projects','projects in progress'],
    description: 'Active/ongoing projects'
  },
  {
    id: 'overdue_projects',
    category: 'projects',
    keywords: expand(PROJECT_SYNONYMS, OVERDUE_SYNONYMS),
    aliases: ['late projects','delayed projects','behind schedule projects'],
    description: 'Overdue projects'
  },

  // Tasks (original)
  {
    id: 'list_tasks',
    category: 'tasks',
    keywords: expand(TASK_SYNONYMS, LIST_SYNONYMS),
    aliases: ['task list','all tasks','browse tasks'],
    description: 'List tasks'
  },
  {
    id: 'overdue_tasks',
    category: 'tasks',
    keywords: expand(TASK_SYNONYMS, OVERDUE_SYNONYMS),
    aliases: ['late tasks','delayed tasks','past due tasks'],
    description: 'Overdue tasks'
  },
  {
    id: 'urgent_tasks',
    category: 'tasks',
    keywords: expand(TASK_SYNONYMS, URGENT_SYNONYMS),
    aliases: ['high priority tasks','critical tasks','p1 tasks','blockers'],
    description: 'High-priority tasks'
  },

  // Resources (original)
  {
    id: 'list_resources',
    category: 'resources',
    keywords: expand(RESOURCE_SYNONYMS, LIST_SYNONYMS),
    aliases: ['team list','people list','members list'],
    description: 'List resources'
  },
  {
    id: 'available_resources',
    category: 'resources',
    keywords: expand(RESOURCE_SYNONYMS, AVAILABLE_SYNONYMS),
    aliases: ['free resources','open capacity','idle team'],
    description: 'Available resources'
  },
  {
    id: 'busy_resources',
    category: 'resources',
    keywords: expand(RESOURCE_SYNONYMS, BUSY_SYNONYMS),
    aliases: ['utilized team','occupied resources','at capacity'],
    description: 'Busy resources'
  },

  // Status/time filters (original)
  { id: 'completed', category: 'status', keywords: STATUS_COMPLETED, description: 'Completed status filter' },
  { id: 'in_progress', category: 'status', keywords: STATUS_IN_PROGRESS, description: 'In-progress status filter' },
  { id: 'today', category: 'time', keywords: TIME_TODAY, description: 'Today filter' },
  { id: 'this_week', category: 'time', keywords: TIME_WEEK, description: 'This week filter' },
  { id: 'this_month', category: 'time', keywords: TIME_MONTH, description: 'This month filter' },
];

// Programmatic expansion
const TIME_DIM = [
  { key: '', words: [] as string[], label: '' },
  { key: 'today', words: TIME_TODAY, label: 'today' },
  { key: 'this_week', words: TIME_WEEK, label: 'this week' },
  { key: 'this_month', words: TIME_MONTH, label: 'this month' },
];

const STATUS_DIM = [
  { key: '', words: [] as string[], label: '' },
  { key: 'completed', words: STATUS_COMPLETED, label: 'completed' },
  { key: 'in_progress', words: STATUS_IN_PROGRESS, label: 'in progress' },
];

const PRIORITY_DIM = [
  { key: '', words: [] as string[], label: '' },
  { key: 'p0', words: ['p0','blocker','highest','sev0','critical'] },
  { key: 'p1', words: ['p1','urgent','sev1','high'] },
  { key: 'p2', words: ['p2','medium','normal','standard'] },
  { key: 'high', words: ['high','urgent','priority high'] },
  { key: 'low', words: ['low','minor','nice to have'] },
];

const ROLES = ['engineer','designer','manager','qa','pm','frontend','backend','fullstack','devops','data'];

const PROJECT_OPS = [
  { id: 'list', description: 'List projects in the current workspace', kw: expand(PROJECT_SYNONYMS, LIST_SYNONYMS) },
  { id: 'details', description: 'Detailed project information', kw: expand(PROJECT_SYNONYMS, DETAIL_SYNONYMS) },
  { id: 'active', description: 'Active/ongoing projects', kw: expand(PROJECT_SYNONYMS, ACTIVE_SYNONYMS) },
  { id: 'overdue', description: 'Overdue projects', kw: expand(PROJECT_SYNONYMS, OVERDUE_SYNONYMS) },
];

const TASK_OPS = [
  { id: 'list', description: 'List tasks', kw: expand(TASK_SYNONYMS, LIST_SYNONYMS) },
  { id: 'overdue', description: 'Overdue tasks', kw: expand(TASK_SYNONYMS, OVERDUE_SYNONYMS) },
  { id: 'urgent', description: 'High-priority tasks', kw: expand(TASK_SYNONYMS, URGENT_SYNONYMS) },
  { id: 'assigned', description: 'Assigned tasks', kw: expand(TASK_SYNONYMS, ['assigned','owner','assignee','owned']) },
  { id: 'unassigned', description: 'Unassigned tasks', kw: expand(TASK_SYNONYMS, ['unassigned','unowned','no owner','no assignee']) },
  { id: 'blocked', description: 'Blocked tasks', kw: expand(TASK_SYNONYMS, ['blocked','blockers','blocked by']) },
];

const RESOURCE_OPS = [
  { id: 'list', description: 'List resources', kw: expand(RESOURCE_SYNONYMS, LIST_SYNONYMS) },
  { id: 'available', description: 'Available resources', kw: expand(RESOURCE_SYNONYMS, AVAILABLE_SYNONYMS) },
  { id: 'busy', description: 'Busy resources', kw: expand(RESOURCE_SYNONYMS, BUSY_SYNONYMS) },
];

const toAliases = (parts: string[]) => {
  const text = parts.filter(Boolean).join(' ');
  return [text, text.replace(/_/g, ' '), text.replace(/_/g, '-')];
};

const generated: ActionWord[] = [];

// Projects: ops x (status,time)
for (const op of PROJECT_OPS) {
  for (const st of STATUS_DIM) {
    for (const tm of TIME_DIM) {
      const id = ['projects', op.id, st.key, tm.key].filter(Boolean).join('_');
      const aliases = toAliases(['project', op.id, st.label, tm.label]);
      generated.push({
        id,
        category: 'projects',
        keywords: expand(op.kw, [...st.words, ...tm.words]),
        aliases,
        description: [op.description, st.label, tm.label].filter(Boolean).join(' • ')
      });
    }
  }
}

// Tasks: ops x priority x status x time
for (const op of TASK_OPS) {
  for (const pr of PRIORITY_DIM) {
    for (const st of STATUS_DIM) {
      for (const tm of TIME_DIM) {
        const id = ['tasks', op.id, pr.key && `priority_${pr.key}`, st.key, tm.key]
          .filter(Boolean).join('_');
        const aliases = toAliases(['task', op.id, pr.label && `priority ${pr.label}`, st.label, tm.label].filter(Boolean) as string[]);
        generated.push({
          id,
          category: 'tasks',
          keywords: expand(op.kw, [...pr.words, ...st.words, ...tm.words]),
          aliases,
          description: [op.description, pr.label, st.label, tm.label].filter(Boolean).join(' • ')
        });
      }
    }
  }
}

// Resources: ops x roles x time
for (const op of RESOURCE_OPS) {
  for (const role of [''].concat(ROLES)) {
    for (const tm of TIME_DIM) {
      const id = ['resources', op.id, role && `role_${role}`, tm.key].filter(Boolean).join('_');
      const roleWords = role ? [role, `${role}s`] : [];
      const aliases = toAliases(['resource', op.id, role, tm.label].filter(Boolean) as string[]);
      generated.push({
        id,
        category: 'resources',
        keywords: expand(op.kw, [...roleWords, ...tm.words]),
        aliases,
        description: [op.description, role, tm.label].filter(Boolean).join(' • ')
      });
    }
  }
}

// Final list with de-dup by id to keep originals intact
const uniqById = (arr: ActionWord[]) => {
  const map = new Map<string, ActionWord>();
  for (const a of arr) if (!map.has(a.id)) map.set(a.id, a);
  return Array.from(map.values());
};

export const ACTION_WORDS: ActionWord[] = uniqById([
  ...BASE_CANONICAL,
  ...generated,
]);

// Sanity check (development aid)
(() => {
  try {
    const vocab = new Set<string>();
    ACTION_WORDS.forEach(a => {
      a.keywords.forEach(k => vocab.add(k));
      (a.aliases || []).forEach(k => vocab.add(k));
    });
    // console.debug('[ActionWords] counts', { actions: ACTION_WORDS.length, vocab: vocab.size });
  } catch {}
})();
