export interface IntentPattern {
  name: string;
  patterns: string[];
  priority: number;
  complexity: 'simple' | 'medium' | 'complex';
}

export interface Intent {
  intent: string;
  confidence: number;
  complexity: 'simple' | 'medium' | 'complex';
}

export class IntentClassifier {
  private intents: IntentPattern[] = [
    {
      name: 'project_status',
      patterns: [
        'project status', 'how is project', 'project progress',
        'what is the status of', 'is project on track',
        'project timeline', 'deadline status', 'show me project'
      ],
      priority: 1,
      complexity: 'simple'
    },
    {
      name: 'team_performance',
      patterns: [
        'team performance', 'how is the team', 'team productivity',
        'resource utilization', 'team workload', 'who is working on',
        'team member', 'employee performance', 'show team'
      ],
      priority: 2,
      complexity: 'simple'
    },
    {
      name: 'deadlines',
      patterns: [
        'deadlines', 'due dates', 'upcoming tasks', 'when is due',
        'urgent tasks', 'overdue', 'late tasks', 'timeline',
        'what is due', 'show deadlines'
      ],
      priority: 3,
      complexity: 'simple'
    },
    {
      name: 'task_status',
      patterns: [
        'task status', 'task progress', 'show tasks', 'task list',
        'what tasks', 'task update', 'task completion'
      ],
      priority: 4,
      complexity: 'simple'
    },
    {
      name: 'documents',
      patterns: [
        'document', 'file', 'report', 'download', 'get document',
        'show me the', 'fetch document', 'retrieve file', 'files'
      ],
      priority: 5,
      complexity: 'medium'
    },
    {
      name: 'complex_analysis',
      patterns: [
        'analyze', 'compare', 'forecast', 'predict', 'recommend',
        'optimize', 'strategy', 'insight', 'trend', 'correlation'
      ],
      priority: 6,
      complexity: 'complex'
    }
  ];

  async classify(input: string): Promise<Intent> {
    const words = input.toLowerCase().split(' ');
    let bestMatch: { intent: string; confidence: number; score: number; complexity: 'simple' | 'medium' | 'complex' } = { 
      intent: 'unknown', 
      confidence: 0, 
      score: 0, 
      complexity: 'complex' 
    };

    for (const intentPattern of this.intents) {
      const score = this.calculateIntentScore(input, intentPattern);
      if (score > bestMatch.score) {
        bestMatch = {
          intent: intentPattern.name,
          confidence: score,
          score,
          complexity: intentPattern.complexity
        };
      }
    }

    // If confidence is too low, classify as complex for Claude handling
    if (bestMatch.confidence < 0.6) {
      return {
        intent: 'unknown',
        confidence: bestMatch.confidence,
        complexity: 'complex' as const
      };
    }

    return {
      intent: bestMatch.intent,
      confidence: bestMatch.confidence,
      complexity: bestMatch.complexity as 'simple' | 'medium' | 'complex'
    };
  }

  private calculateIntentScore(input: string, pattern: IntentPattern): number {
    const inputLower = input.toLowerCase();
    let matches = 0;
    let totalPatterns = pattern.patterns.length;
    
    for (const patternText of pattern.patterns) {
      if (inputLower.includes(patternText.toLowerCase())) {
        matches++;
      }
    }
    
    // Boost score for exact phrase matches
    let exactMatches = 0;
    for (const patternText of pattern.patterns) {
      if (inputLower === patternText.toLowerCase()) {
        exactMatches++;
      }
    }
    
    let score = matches / totalPatterns;
    if (exactMatches > 0) {
      score += 0.3; // Boost for exact matches
    }
    
    return Math.min(score, 1.0);
  }
}