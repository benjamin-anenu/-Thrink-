import React from 'react'
import { useSessionManager } from '@/hooks/useSessionManager'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { LoadingState } from '@/components/ui/loading-state'
import { useToast } from '@/hooks/use-toast'
import { 
  Monitor, 
  Smartphone, 
  Tablet, 
  Globe, 
  LogOut, 
  Shield,
  Clock,
  MapPin
} from 'lucide-react'

export function SessionManager() {
  const { sessions, loading, terminateSession, terminateAllOtherSessions } = useSessionManager()
  const { toast } = useToast()

  const getDeviceIcon = (userAgent: string | null) => {
    if (!userAgent) return Monitor
    if (userAgent.includes('Mobile') || userAgent.includes('Android')) return Smartphone
    if (userAgent.includes('iPad') || userAgent.includes('Tablet')) return Tablet
    return Monitor
  }

  const handleTerminateSession = async (sessionId: string) => {
    try {
      await terminateSession(sessionId)
      toast({
        title: "Session Terminated",
        description: "The session has been successfully terminated.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to terminate session. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleTerminateAllOthers = async () => {
    try {
      await terminateAllOtherSessions()
      toast({
        title: "Sessions Terminated",
        description: "All other sessions have been terminated.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to terminate sessions. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (loading) return <LoadingState />

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Active Sessions
        </CardTitle>
        <CardDescription>
          Manage your active sessions across different devices and locations.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {sessions.length > 1 && (
          <div className="flex justify-end">
            <Button 
              variant="destructive" 
              size="sm"
              onClick={handleTerminateAllOthers}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Terminate All Other Sessions
            </Button>
          </div>
        )}

        <div className="space-y-4">
          {sessions.map((session, index) => {
            const DeviceIcon = getDeviceIcon(session.user_agent)
            const isCurrentSession = index === 0 // Assuming first is current
            
            return (
              <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <DeviceIcon className="h-5 w-5 text-muted-foreground" />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {(session.device_info as any)?.browser || session.user_agent || 'Unknown Browser'}
                      </span>
                      {isCurrentSession && (
                        <Badge variant="secondary" className="text-xs">
                          Current Session
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {session.ip_address || 'Unknown Location'}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Last active: {session.last_activity ? new Date(session.last_activity).toLocaleDateString() : 'Unknown'}
                      </div>
                    </div>
                  </div>
                </div>
                
                {!isCurrentSession && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleTerminateSession(session.id)}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Terminate
                  </Button>
                )}
              </div>
            )
          })}
        </div>

        {sessions.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Globe className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No active sessions found.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}