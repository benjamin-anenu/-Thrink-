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

  classify(input: string, actionWords: ActionWord[]): Intent {
    const lc = input.toLowerCase();
    let best: Intent = { intent: 'unknown', confidence: 0 };

    // Action words precedence
    for (const aw of actionWords) {
      if (aw.keywords.some(k => lc.includes(k))) {
        best = { intent: aw.id, confidence: 0.95 };
        break;
      }
    }

    if (best.intent !== 'unknown') return best;

    for (const p of this.patterns) {
      if (p.regexes.some(r => r.test(input))) {
        return { intent: p.name, confidence: p.base };
      }
    }

    return best;
  }
}