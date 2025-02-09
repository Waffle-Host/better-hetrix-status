import { Monitor } from '@/types/monitor'

export interface CategoryStats {
  monitors: Monitor[]
  averageUptime: number
  operationalCount: number
  degradedCount: number
  downCount: number
}

export function groupMonitorsByCategory(monitors: Monitor[]): { [key: string]: CategoryStats } {
  return monitors.reduce((acc, monitor) => {
    const category = monitor.category || 'Uncategorized'
    if (!acc[category]) {
      acc[category] = {
        monitors: [],
        averageUptime: 0,
        operationalCount: 0,
        degradedCount: 0,
        downCount: 0
      }
    }
    
    acc[category].monitors.push(monitor)
    
    // Update counts based on status
    switch (monitor.status) {
      case 'operational':
        acc[category].operationalCount++
        break
      case 'degraded':
        acc[category].degradedCount++
        break
      case 'down':
        acc[category].downCount++
        break
    }

    // Calculate average uptime
    const totalUptime = acc[category].monitors.reduce((sum, m) => sum + m.uptime, 0)
    acc[category].averageUptime = totalUptime / acc[category].monitors.length
    
    return acc
  }, {} as { [key: string]: CategoryStats })
}
