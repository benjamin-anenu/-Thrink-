export interface Entity {
  type: string;
  value: string;
  confidence: number;
  position: number;
}

export interface EntityPattern {
  type: string;
  patterns: string[];
  keywords: string[];
}

export class EntityExtractor {
  private entities: EntityPattern[] = [
    {
      type: 'project',
      patterns: [
        'project', 'proj', 'initiative', 'campaign'
      ],
      keywords: ['ecommerce', 'website', 'mobile', 'app', 'platform', 'redesign', 'development']
    },
    {
      type: 'resource',
      patterns: [
        'team member', 'employee', 'developer', 'designer', 'manager',
        'sarah', 'michael', 'emily', 'david', 'john', 'jane', 'alex'
      ],
      keywords: ['frontend', 'backend', 'ux', 'ui', 'senior', 'junior', 'lead']
    },
    {
      type: 'timeframe',
      patterns: [
        'this week', 'next week', 'today', 'yesterday', 'last month',
        'overdue', 'urgent', 'soon', 'recently', 'tomorrow'
      ],
      keywords: ['deadline', 'due', 'timeline', 'schedule']
    },
    {
      type: 'status',
      patterns: [
        'completed', 'in progress', 'pending', 'blocked', 'on hold',
        'active', 'inactive', 'done', 'finished', 'started'
      ],
      keywords: ['status', 'progress', 'stage', 'phase']
    },
    {
      type: 'priority',
      patterns: [
        'high priority', 'urgent', 'critical', 'important',
        'low priority', 'medium priority', 'normal'
      ],
      keywords: ['priority', 'urgent', 'critical', 'important']
    }
  ];

  async extract(input: string): Promise<Entity[]> {
    const entities: Entity[] = [];
    const inputLower = input.toLowerCase();

    for (const entityPattern of this.entities) {
      for (const pattern of entityPattern.patterns) {
        const position = inputLower.indexOf(pattern.toLowerCase());
        if (position !== -1) {
          entities.push({
            type: entityPattern.type,
            value: pattern,
            confidence: 0.9,
            position
          });
        }
      }
      
      // Check for keyword matches
      for (const keyword of entityPattern.keywords) {
        const position = inputLower.indexOf(keyword.toLowerCase());
        if (position !== -1) {
          entities.push({
            type: entityPattern.type,
            value: keyword,
            confidence: 0.7,
            position
          });
        }
      }
    }

    // Remove duplicates and sort by position
    const uniqueEntities = entities.filter((entity, index, self) => 
      index === self.findIndex(e => e.type === entity.type && e.value === entity.value)
    );

    return uniqueEntities.sort((a, b) => a.position - b.position);
  }
}