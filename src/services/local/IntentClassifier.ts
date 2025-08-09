import type { ActionWord } from './ActionWords';

export interface Intent {
  intent: string;
  confidence: number;
}

export class IntentClassifier {
  private patterns: { name: string; regexes: RegExp[]; base: number }[] = [
    { name: 'project_details', regexes: [/details/i, /overview/i, /summary/i], base: 0.9 },
    { name: 'overdue_items', regexes: [/overdue|late|delayed|past\s*due/i], base: 0.9 },
    { name: 'resource_status', regexes: [/team|resource|member|workload/i], base: 0.8 },
    { name: 'time_based', regexes: [/today|this\s*week|this\s*month/i], base: 0.8 },
    { name: 'list_projects', regexes: [/projects|project/i], base: 0.7 },
    { name: 'list_tasks', regexes: [/tasks|todo/i], base: 0.7 },
  ];

  // Normalize the wide variety of generated action IDs to a small set of canonical intents
  private normalizeIntentId(id: string): string {
    const s = id.toLowerCase();

    // Explicit normalizations for legacy pattern names
    if (s === 'overdue_items') return 'overdue_tasks';
    if (s === 'resource_status') return 'list_resources';
    if (s === 'time_based') return 'list_projects';

    if (s.includes('task')) {
      if (s.includes('overdue') || s.includes('late') || s.includes('past') || s.includes('delayed')) {
        return 'overdue_tasks';
      }
      if (
        s.includes('urgent') || s.includes('priority_p0') || s.includes('priority_p1') ||
        s.includes('critical') || s.includes('high')
      ) {
        return 'urgent_tasks';
      }
      return 'list_tasks';
    }

    if (s.includes('resource') || s.includes('team') || s.includes('member')) {
      if (s.includes('available') || s.includes('free') || s.includes('capacity') || s.includes('idle')) {
        return 'available_resources';
      }
      if (s.includes('busy') || s.includes('utilized') || s.includes('occupied')) {
        return 'busy_resources';
      }
      return 'list_resources';
    }

    if (s.includes('project') || s.includes('portfolio') || s.includes('initiative') || s.includes('program')) {
      if (s.includes('overdue') || s.includes('late') || s.includes('past') || s.includes('delayed')) {
        return 'overdue_projects';
      }
      if (s.includes('detail') || s.includes('overview') || s.includes('summary')) {
        return 'project_details';
      }
      return 'list_projects';
    }

    return id;
  }

  classify(input: string, actionWords: ActionWord[]): Intent {
    const lc = input.toLowerCase();
    let best: Intent = { intent: 'unknown', confidence: 0 };

    // Rank action words by how many of their keywords/aliases appear; pick the most specific
    let topId: string | null = null;
    let topScore = 0;
    for (const aw of actionWords) {
      let score = 0;
      for (const k of aw.keywords) if (lc.includes(k.toLowerCase())) score += 1;
      for (const a of aw.aliases || []) if (lc.includes(a.toLowerCase())) score += 0.5;
      if (score > topScore) {
        topScore = score;
        topId = aw.id;
      }
    }
    if (topId) {
      const normalized = this.normalizeIntentId(topId);
      return { intent: normalized, confidence: Math.min(0.95, 0.6 + topScore / 10) };
    }

    // Pattern fallback
    for (const p of this.patterns) {
      if (p.regexes.some(r => r.test(input))) {
        const normalized = this.normalizeIntentId(p.name);
        return { intent: normalized, confidence: p.base };
      }
    }

    return best;
  }
}
