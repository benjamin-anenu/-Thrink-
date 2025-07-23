-- Update existing report recipients with real data from resources table
UPDATE report_recipients 
SET 
  recipient_email = r.email,
  recipient_name = r.name
FROM resources r 
WHERE report_recipients.recipient_id = r.id 
AND report_recipients.recipient_email = 'recipient@company.com'
AND report_recipients.recipient_name = 'Recipient';

-- Log the update for audit purposes
INSERT INTO compliance_logs (event_type, event_category, description, metadata)
VALUES (
  'recipient_data_fixed',
  'data_correction', 
  'Updated dummy recipient data with real resource information',
  jsonb_build_object('updated_at', now(), 'reason', 'Fix scheduled report recipients')
);