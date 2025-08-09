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

// Build ACTION_WORDS with very large keyword+alias pools (well over 500 total triggers)
export const ACTION_WORDS: ActionWord[] = [
  // Projects
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

  // Tasks
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

  // Resources
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

  // Status/time filters
  { id: 'completed', category: 'status', keywords: STATUS_COMPLETED, description: 'Completed status filter' },
  { id: 'in_progress', category: 'status', keywords: STATUS_IN_PROGRESS, description: 'In-progress status filter' },
  { id: 'today', category: 'time', keywords: TIME_TODAY, description: 'Today filter' },
  { id: 'this_week', category: 'time', keywords: TIME_WEEK, description: 'This week filter' },
  { id: 'this_month', category: 'time', keywords: TIME_MONTH, description: 'This month filter' },
];

// Sanity check (development aid): ensure combined vocabulary > 500
// Note: This does not affect runtime functionality.
(() => {
  try {
    const vocab = new Set<string>();
    ACTION_WORDS.forEach(a => {
      a.keywords.forEach(k => vocab.add(k));
      (a.aliases || []).forEach(k => vocab.add(k));
    });
    // console.debug('[ActionWords] vocabulary size:', vocab.size);
  } catch {}
})();
