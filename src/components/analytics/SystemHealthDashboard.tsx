import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Activity, 
  Database, 
  Users, 
  Shield, 
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { cacheManager } from '@/services/CacheManager'

interface SystemMetrics {
  authHealth: 'healthy' | 'warning' | 'critical'
  dbHealth: 'healthy' | 'warning' | 'critical'
  activeUsers: number
  totalSessions: number
  cacheHitRate: number
  averageResponseTime: number
  errorRate: number
  uptime: string
}

export default function SystemHealthDashboard() {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    authHealth: 'healthy',
    dbHealth: 'healthy',
    activeUsers: 0,
    totalSessions: 0,
    cacheHitRate: 0,
    averageResponseTime: 0,
    errorRate: 0,
    uptime: '99.9%'
  })

  useEffect(() => {
    const loadMetrics = () => {
      // Get cache statistics
      const cacheStats = cacheManager.getStats()
      
      // Simulate system metrics (in a real app, these would come from monitoring APIs)
      setMetrics({
        authHealth: 'healthy',
        dbHealth: 'healthy',
        activeUsers: Math.floor(Math.random() * 50) + 10,
        totalSessions: Math.floor(Math.random() * 200) + 100,
        cacheHitRate: cacheStats.hitRate,
        averageResponseTime: Math.floor(Math.random() * 100) + 50,
        errorRate: Math.random() * 2,
        uptime: '99.9%'
      })
    }

    loadMetrics()
    const interval = setInterval(loadMetrics, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-green-600 dark:text-green-400'
      case 'warning': return 'text-yellow-600 dark:text-yellow-400'
      case 'critical': return 'text-red-600 dark:text-red-400'
      default: return 'text-gray-600 dark:text-gray-400'
    }
  }

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy': return <CheckCircle className="h-4 w-4" />
      case 'warning': return <AlertTriangle className="h-4 w-4" />
      case 'critical': return <XCircle className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">System Health Dashboard</h2>
        <p className="text-muted-foreground">
          Monitor authentication system performance and health metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Auth Health</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`flex items-center gap-2 ${getHealthColor(metrics.authHealth)}`}>
              {getHealthIcon(metrics.authHealth)}
              <span className="text-2xl font-bold capitalize">{metrics.authHealth}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database Health</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`flex items-center gap-2 ${getHealthColor(metrics.dbHealth)}`}>
              {getHealthIcon(metrics.dbHealth)}
              <span className="text-2xl font-bold capitalize">{metrics.dbHealth}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.totalSessions} total sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.uptime}</div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>
              Key performance indicators for the authentication system.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Cache Hit Rate</span>
                <span className="text-sm text-muted-foreground">{metrics.cacheHitRate}%</span>
              </div>
              <Progress value={metrics.cacheHitRate} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Average Response Time</span>
                <span className="text-sm text-muted-foreground">{metrics.averageResponseTime}ms</span>
              </div>
              <Progress value={Math.min(100, 100 - metrics.averageResponseTime / 10)} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Error Rate</span>
                <span className="text-sm text-muted-foreground">{metrics.errorRate.toFixed(2)}%</span>
              </div>
              <Progress value={100 - metrics.errorRate} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security Status</CardTitle>
            <CardDescription>
              Security-related metrics and alerts.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Failed Login Attempts</span>
              <Badge variant="secondary">3 (last hour)</Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Suspicious Activities</span>
              <Badge variant="secondary">0</Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Session Timeouts</span>
              <Badge variant="secondary">2 (today)</Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Password Resets</span>
              <Badge variant="secondary">5 (today)</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}