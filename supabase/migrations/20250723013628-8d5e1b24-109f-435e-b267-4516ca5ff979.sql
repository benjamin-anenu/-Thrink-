-- Update existing report recipients with real data from resources table
UPDATE report_recipients 
SET 
  recipient_email = r.email,
  recipient_name = r.name
FROM resources r 
WHERE report_recipients.recipient_id = r.id 
AND report_recipients.recipient_email = 'recipient@company.com'
AND report_recipients.recipient_name = 'Recipient';