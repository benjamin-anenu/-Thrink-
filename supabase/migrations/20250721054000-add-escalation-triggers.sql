
-- Insert 20 escalation triggers for common project management scenarios
INSERT INTO escalation_triggers (name, description, condition_type, threshold_value, threshold_unit, is_active) VALUES
('Task Overdue', 'Escalate when tasks are overdue by specified days', 'task_overdue', 3, 'days', true),
('Milestone Delay', 'Escalate when milestones are delayed beyond threshold', 'milestone_delay', 5, 'days', true),
('Budget Exceeded', 'Escalate when project budget exceeds threshold percentage', 'budget_exceeded', 10, 'percentage', true),
('Resource Overallocation', 'Escalate when resources are overallocated beyond capacity', 'resource_overallocation', 120, 'percentage', true),
('Communication Gap', 'Escalate when no communication occurs for specified period', 'communication_gap', 7, 'days', true),
('Quality Score Drop', 'Escalate when quality score drops below threshold', 'quality_score', 80, 'percentage', true),
('Client Satisfaction Low', 'Escalate when client satisfaction falls below threshold', 'client_satisfaction', 70, 'percentage', true),
('Velocity Drop', 'Escalate when team velocity drops significantly', 'velocity_drop', 30, 'percentage', true),
('Risk Level High', 'Escalate when project risk level exceeds threshold', 'risk_level', 80, 'percentage', true),
('Dependency Blocking', 'Escalate when dependencies block progress for too long', 'dependency_blocking', 2, 'days', true),
('Resource Unavailable', 'Escalate when key resources are unavailable', 'resource_unavailable', 24, 'hours', true),
('Scope Creep', 'Escalate when scope increases beyond threshold', 'scope_creep', 20, 'percentage', true),
('Testing Failure Rate', 'Escalate when testing failure rate exceeds threshold', 'testing_failure', 15, 'percentage', true),
('Deployment Issues', 'Escalate when deployment failures occur repeatedly', 'deployment_issues', 3, 'count', true),
('Stakeholder Unavailable', 'Escalate when stakeholders are unavailable for approvals', 'stakeholder_unavailable', 48, 'hours', true),
('Project Behind Schedule', 'Escalate when project falls behind schedule significantly', 'schedule_delay', 10, 'percentage', true),
('Team Morale Low', 'Escalate when team morale indicators drop', 'team_morale', 60, 'percentage', true),
('Documentation Incomplete', 'Escalate when documentation completion falls below threshold', 'documentation_incomplete', 70, 'percentage', true),
('Change Request Overload', 'Escalate when change requests exceed manageable threshold', 'change_requests', 5, 'count', true),
('Security Vulnerability', 'Escalate when security vulnerabilities are detected', 'security_vulnerability', 1, 'count', true);
