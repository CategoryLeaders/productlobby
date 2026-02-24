'use client'

import React, { useState, useEffect } from 'react'
import { AlertCircle, CheckCircle2, Clock, Loader2, Shield, AlertTriangle, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export type AlertSeverity = 'critical' | 'warning' | 'info'
export type AlertType = 'gdpr' | 'advertising' | 'content' | 'financial' | 'accessibility'
export type AlertStatus = 'open' | 'acknowledged' | 'resolved'

export interface ComplianceAlert {
  id: string
  type: AlertType
  severity: AlertSeverity
  title: string
  description: string
  recommendation: string
  status: AlertStatus
  regulation?: string
  deadline?: string
}

interface ComplianceAlertsProps {
  campaignId: string
}

const SEVERITY_COLORS: Record<AlertSeverity, string> = {
  critical: 'bg-red-100 border-red-300 text-red-800',
  warning: 'bg-amber-100 border-amber-300 text-amber-800',
  info: 'bg-blue-100 border-blue-300 text-blue-800',
}

const SEVERITY_ICONS: Record<AlertSeverity, React.ReactNode> = {
  critical: <AlertCircle className="h-5 w-5" />,
  warning: <AlertTriangle className="h-5 w-5" />,
  info: <Info className="h-5 w-5" />,
}

const STATUS_COLORS: Record<AlertStatus, string> = {
  open: 'bg-red-100 text-red-800 border-red-300',
  acknowledged: 'bg-amber-100 text-amber-800 border-amber-300',
  resolved: 'bg-green-100 text-green-800 border-green-300',
}

const STATUS_ICONS: Record<AlertStatus, React.ReactNode> = {
  open: <AlertCircle className="h-4 w-4" />,
  acknowledged: <Clock className="h-4 w-4" />,
  resolved: <CheckCircle2 className="h-4 w-4" />,
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`

  return date.toLocaleDateString()
}

const daysUntilDeadline = (deadline: string): number | null => {
  const now = new Date()
  const deadline_date = new Date(deadline)
  const days = Math.floor(
    (deadline_date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  )
  return days >= 0 ? days : null
}

export function ComplianceAlerts({ campaignId }: ComplianceAlertsProps) {
  const [alerts, setAlerts] = useState<ComplianceAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAlerts()
  }, [campaignId])

  const fetchAlerts = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `/api/campaigns/${campaignId}/compliance-alerts`
      )
      if (!response.ok) throw new Error('Failed to fetch alerts')
      const data = await response.json()
      setAlerts(data.alerts || [])
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch alerts')
    } finally {
      setLoading(false)
    }
  }

  const acknowledgeAlert = async (id: string) => {
    try {
      const response = await fetch(
        `/api/campaigns/${campaignId}/compliance-alerts`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ alertId: id, status: 'acknowledged' }),
        }
      )

      if (!response.ok) throw new Error('Failed to acknowledge alert')

      await fetchAlerts()
      setError(null)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to acknowledge alert'
      )
    }
  }

  const resolveAlert = async (id: string) => {
    try {
      const response = await fetch(
        `/api/campaigns/${campaignId}/compliance-alerts`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ alertId: id, status: 'resolved' }),
        }
      )

      if (!response.ok) throw new Error('Failed to resolve alert')

      await fetchAlerts()
      setError(null)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to resolve alert'
      )
    }
  }

  const criticalCount = alerts.filter((a) => a.severity === 'critical').length
  const warningCount = alerts.filter((a) => a.severity === 'warning').length
  const infoCount = alerts.filter((a) => a.severity === 'info').length

  if (loading) {
    return (
      <Card className="border-amber-200 bg-gradient-to-br from-red-50 to-amber-50">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-bold text-red-900 flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Compliance Alerts
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-red-500" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-amber-200 bg-gradient-to-br from-red-50 to-amber-50">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold text-red-900 flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Compliance Alerts
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-100 border border-red-300 rounded-lg text-red-800">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        {/* Severity Summary */}
        {alerts.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-red-100 border border-red-300 rounded-lg">
              <div className="text-2xl font-bold text-red-700">
                {criticalCount}
              </div>
              <div className="text-xs text-red-600">Critical</div>
            </div>
            <div className="p-3 bg-amber-100 border border-amber-300 rounded-lg">
              <div className="text-2xl font-bold text-amber-700">
                {warningCount}
              </div>
              <div className="text-xs text-amber-600">Warning</div>
            </div>
            <div className="p-3 bg-blue-100 border border-blue-300 rounded-lg">
              <div className="text-2xl font-bold text-blue-700">{infoCount}</div>
              <div className="text-xs text-blue-600">Info</div>
            </div>
          </div>
        )}

        {/* Alerts List */}
        {alerts.length > 0 && (
          <div className="space-y-3">
            {alerts
              .sort((a, b) => {
                const severityOrder = { critical: 0, warning: 1, info: 2 }
                return severityOrder[a.severity] - severityOrder[b.severity]
              })
              .map((alert) => {
                const days = alert.deadline
                  ? daysUntilDeadline(alert.deadline)
                  : null
                const isUrgent = days !== null && days <= 7

                return (
                  <div
                    key={alert.id}
                    className={`p-4 border rounded-lg ${SEVERITY_COLORS[alert.severity]}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-start gap-3 flex-1">
                        {SEVERITY_ICONS[alert.severity]}
                        <div className="flex-1">
                          <div className="font-medium mb-1">{alert.title}</div>
                          <p className="text-sm opacity-90 mb-2">
                            {alert.description}
                          </p>

                          <div className="flex flex-wrap gap-2 mb-2">
                            <Badge
                              variant="outline"
                              className={`text-xs ${STATUS_COLORS[alert.status]}`}
                            >
                              {STATUS_ICONS[alert.status]}
                              <span className="ml-1 capitalize">
                                {alert.status}
                              </span>
                            </Badge>

                            {alert.regulation && (
                              <Badge
                                variant="outline"
                                className="text-xs border-current"
                              >
                                {alert.regulation}
                              </Badge>
                            )}

                            {isUrgent && (
                              <Badge className="text-xs bg-red-600 text-white">
                                {days} days until deadline
                              </Badge>
                            )}
                          </div>

                          <div className="bg-white bg-opacity-50 p-2 rounded text-sm mb-2">
                            <strong>Recommendation:</strong>{' '}
                            {alert.recommendation}
                          </div>

                          {alert.deadline && (
                            <div className="text-xs opacity-75">
                              Deadline:{' '}
                              {new Date(alert.deadline).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 ml-4">
                        {alert.status === 'open' && (
                          <Button
                            onClick={() => acknowledgeAlert(alert.id)}
                            size="sm"
                            className="bg-white text-current hover:bg-opacity-80"
                          >
                            Acknowledge
                          </Button>
                        )}
                        {alert.status !== 'resolved' && (
                          <Button
                            onClick={() => resolveAlert(alert.id)}
                            size="sm"
                            variant="outline"
                            className="border-current text-current hover:bg-white hover:bg-opacity-50"
                          >
                            Resolve
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
          </div>
        )}

        {alerts.length === 0 && (
          <div className="text-center py-8">
            <CheckCircle2 className="h-12 w-12 text-green-400 mx-auto mb-3" />
            <p className="text-gray-600 font-medium">No compliance alerts</p>
            <p className="text-sm text-gray-500">
              Your campaign is compliant with all regulations
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
