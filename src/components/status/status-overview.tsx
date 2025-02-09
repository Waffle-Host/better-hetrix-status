import { Monitor } from "@/types/monitor"

interface StatusOverviewProps {
  monitors: Monitor[]
  lastUpdated: string
}

export function StatusOverview({ monitors, lastUpdated }: StatusOverviewProps) {
  const getSystemStatus = () => {
    const downMonitors = monitors.filter(m => m.status === 'down').length
    const degradedMonitors = monitors.filter(m => m.status === 'degraded').length
    
    if (downMonitors > 0) {
      return {
        status: 'down',
        text: `${downMonitors} system${downMonitors > 1 ? 's' : ''} down`,
        color: 'bg-destructive',
        ring: 'ring-destructive/20'
      }
    }
    if (degradedMonitors > 0) {
      return {
        status: 'degraded',
        text: `${degradedMonitors} system${degradedMonitors > 1 ? 's' : ''} degraded`,
        color: 'bg-yellow-500',
        ring: 'ring-yellow-500/20'
      }
    }
    return {
      status: 'operational',
      text: 'All systems operational',
      color: 'bg-green-500',
      ring: 'ring-green-500/20'
    }
  }

  const status = monitors.length === 0 
    ? {
        status: 'unknown',
        text: 'Loading status...',
        color: 'bg-gray-500',
        ring: 'ring-gray-500/20'
      }
    : getSystemStatus()

  return (
    <div className="rounded-2xl backdrop-blur-sm shadow-lg transition-all duration-300 bg-card/50 ring-1 ring-border/50 p-8">
      <div className="flex items-center gap-4">
        <div className={`h-5 w-5 rounded-full shadow-lg animate-pulse ring-4 ${status.color} ${status.ring}`} />
        <h1 className="text-3xl font-bold text-foreground">
          {status.text}
        </h1>
      </div>
      <p className="mt-4 text-lg text-muted-foreground">
        Last updated {lastUpdated}
      </p>
    </div>
  )
}