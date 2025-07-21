
-- Add 12 more escalation triggers to reach the total of 20
INSERT INTO escalation_triggers (name, description, condition_type, threshold_value, threshold_unit, is_active) VALUES
('Team Communication Issues', 'Escalate when team communication frequency drops below threshold', 'communication_frequency', 2, 'messages_per_day', true),
('Quality Gate Failures', 'Escalate when quality gates fail repeatedly', 'quality_gate_failure', 2, 'count', true),
('External Dependency Delays', 'Escalate when external dependencies cause delays', 'external_dependency_delay', 3, 'days', true),
('Client Approval Delays', 'Escalate when client approvals are delayed beyond threshold', 'client_approval_delay', 5, 'days', true),
('Risk Threshold Breaches', 'Escalate when project risks exceed acceptable levels', 'risk_threshold_breach', 75, 'percentage', true),
('Performance Degradation', 'Escalate when system performance drops significantly', 'performance_degradation', 25, 'percentage', true),
('Scope Creep Detection', 'Escalate when project scope increases beyond threshold', 'scope_creep_detection', 15, 'percentage', true),
('Stakeholder Engagement Low', 'Escalate when stakeholder engagement drops', 'stakeholder_engagement', 40, 'percentage', true),
('Technical Debt Accumulation', 'Escalate when technical debt reaches critical levels', 'technical_debt', 30, 'percentage', true),
('Compliance Violations', 'Escalate when compliance violations are detected', 'compliance_violation', 1, 'count', true),
('Integration Failures', 'Escalate when system integrations fail repeatedly', 'integration_failure', 3, 'count', true),
('Resource Conflict', 'Escalate when resource conflicts occur', 'resource_conflict', 2, 'count', true);
