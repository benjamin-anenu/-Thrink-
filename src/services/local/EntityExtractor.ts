export type EntityType = 'project' | 'resource' | 'status' | 'date';

export interface Entity { type: EntityType; value: string; }

export class EntityExtractor {
  extract(input: string): Entity[] {
    const entities: Entity[] = [];
    const lc = input.toLowerCase();

    // Status
    const statuses = ['active','completed','pending','overdue','in progress'];
    for (const s of statuses) if (lc.includes(s)) entities.push({ type: 'status', value: s });

    // Dates
    if (/today/i.test(input)) entities.push({ type: 'date', value: 'today' });
    if (/this\s*week/i.test(input)) entities.push({ type: 'date', value: 'this_week' });
    if (/this\s*month/i.test(input)) entities.push({ type: 'date', value: 'this_month' });

    return entities;
  }
}