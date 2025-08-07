# Project Health Calculation - Single Source of Truth

## Overview
This document explains how project health is calculated consistently across the entire application using the `ProjectHealthService.ts` as the single source of truth.

## Health Calculation Architecture

### 1. Primary Health Calculation Method
```typescript
ProjectHealthService.calculateRealTimeProjectHealth(projectId: string)
```
This is the **ONLY** method that should be used across all components for health calculation.

### 2. Health Status Categories
- **Green**: Project is on track (85-100 score)
- **Yellow**: Project needs attention (65-84 score)  
- **Red**: Project is at risk (0-64 score)

### 3. Health Calculation Algorithm

#### Phase 1: Task-Level Health
Each task is evaluated based on:
- **Completion Status**: Completed tasks = healthy
- **Timeline**: Overdue tasks = critical
- **Priority**: High/Critical incomplete tasks = risk
- **Progress vs. Time**: Low progress near deadline = risk

#### Phase 2: Milestone Health (Aggregated from Tasks)
- Critical if ANY task is critical
- At-risk if >30% of tasks are at-risk
- Caution if >50% of tasks are not on-track

#### Phase 3: Phase Health (Aggregated from Milestones)
- Critical if ANY milestone is critical
- At-risk if >20% of milestones are problematic (more sensitive)
- Caution if >30% of milestones are not on-track

#### Phase 4: Project Health (Final Calculation)
Uses the comprehensive `calculateProjectHealth()` function from `utils/phaseCalculations.ts` which:
1. Aggregates phase health scores
2. Applies penalties for critical/at-risk phases
3. Returns final score (0-100) and status (green/yellow/red)

### 4. Health Breakdown Categories

The enhanced health service also provides breakdown by category:

#### Timeline Health
- **Green**: No overdue tasks
- **Yellow**: 1-2 overdue tasks
- **Red**: 3+ overdue tasks

#### Budget Health
- **Green**: <80% budget used
- **Yellow**: 80-95% budget used  
- **Red**: >95% budget used

#### Resource Health
- **Green**: No critical incomplete tasks
- **Yellow**: 1-2 critical incomplete tasks
- **Red**: 3+ critical incomplete tasks

#### Quality Health
- **Green**: >80% task completion rate
- **Yellow**: 60-80% completion rate
- **Red**: <60% completion rate

## Implementation Across Views

### Grid View (ProjectDisplay)
```typescript
// Uses centralized health service
const healthData = await ProjectHealthService.calculateRealTimeProjectHealth(project.id);
// Displays: healthData.healthStatus and healthData.healthScore
```

### List View (ProjectListView)  
```typescript
// Real-time health calculation for each project
const healthData = await ProjectHealthService.calculateRealTimeProjectHealth(project.id);
// Displays: Color indicator + health score percentage
```

### Details Modal (ProjectDetailsModal)
```typescript
// Enhanced health with breakdown
const healthData = await ProjectHealthService.calculateRealTimeProjectHealth(project.id);
// Displays: Overall health + detailed breakdown by category
```

### Project Management Pages
All project management components now use the same `ProjectHealthService.calculateRealTimeProjectHealth()` method to ensure consistency.

## Data Flow

```
ProjectHealthService.calculateRealTimeProjectHealth()
    ↓
Fetches: project data, tasks, milestones, budgets
    ↓
Calls: calculateProjectHealth() from utils/phaseCalculations.ts
    ↓
Calculates: breakdown by timeline, budget, resources, quality
    ↓
Returns: {
    healthScore: number,
    healthStatus: 'green' | 'yellow' | 'red',
    overdueTasks: number,
    overdueMilestones: number,
    criticalTasks: number,
    totalTasks: number,
    completedTasks: number,
    healthBreakdown: {
        timeline: 'green' | 'yellow' | 'red',
        budget: 'green' | 'yellow' | 'red', 
        resources: 'green' | 'yellow' | 'red',
        quality: 'green' | 'yellow' | 'red'
    }
}
```

## Performance Optimization

### Caching Strategy
- Health calculations are cached at the component level
- Real-time updates only when project data changes
- Batch health calculations for multiple projects

### Efficient Data Loading
- `ProjectDataService.getProjectSummaries()` for list/grid views (lighter weight)
- `ProjectDataService.getEnhancedProject()` for detailed views (full data)

## Benefits of Single Source of Truth

1. **Consistency**: Same health calculation across all views
2. **Maintainability**: One place to update health logic
3. **Performance**: Optimized calculations with proper caching
4. **Reliability**: Standardized error handling and fallbacks
5. **Scalability**: Centralized service can be easily enhanced

## Migration Notes

All components have been updated to use:
- `ProjectHealthService.calculateRealTimeProjectHealth()` for health
- `ProjectDateService.formatTimelineRange()` for timeline display
- `ProjectDataService.getEnhancedProject()` for comprehensive data loading

This ensures consistent behavior across the entire application.