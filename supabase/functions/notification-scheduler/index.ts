import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { EnhancedNotificationService } from '../_shared/EnhancedNotificationService.ts';

serve(async (req) => {
  const service = new EnhancedNotificationService();
  
  // Run different checks based on time
  const hour = new Date().getHours();
  
  if (hour === 9) { // 9 AM
    await service.scheduleDailyCheckIns();
  }
  
  if (hour === 14) { // 2 PM
    await service.checkUpcomingDeliveries();
  }
  
  if (hour === 17) { // 5 PM
    await service.generateDailyReports?.();
  }
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
}); 