export interface DailyStatus {
  date: string
  status: 'operational' | 'degraded' | 'down' | 'unknown'
  responseTime?: number
}

export interface Monitor {
  id: string
  name: string
  status: 'operational' | 'degraded' | 'down' | 'unknown'
  uptime: number
  lastCheck: string
  type: string
  responseTime: number
  category: string
  hasAgent: boolean
  history?: DailyStatus[]
}
