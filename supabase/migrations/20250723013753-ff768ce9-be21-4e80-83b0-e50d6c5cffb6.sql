-- Delete invalid recipients that don't correspond to actual resources
DELETE FROM report_recipients 
WHERE recipient_email = 'recipient@company.com' 
AND recipient_name = 'Recipient'
AND recipient_id NOT IN (SELECT id FROM resources);