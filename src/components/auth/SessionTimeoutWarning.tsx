import React from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Clock, LogOut } from 'lucide-react'

interface SessionTimeoutWarningProps {
  open: boolean
  onExtend: () => void
  onSignOut: () => void
  remainingTime?: number
}

export function SessionTimeoutWarning({ 
  open, 
  onExtend, 
  onSignOut,
  remainingTime = 5
}: SessionTimeoutWarningProps) {
  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-warning" />
            Session About to Expire
          </AlertDialogTitle>
          <AlertDialogDescription>
            Your session will expire in {remainingTime} minutes due to inactivity. 
            Would you like to extend your session?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel 
            onClick={onSignOut}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out Now
          </AlertDialogCancel>
          <AlertDialogAction onClick={onExtend}>
            Stay Signed In
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}