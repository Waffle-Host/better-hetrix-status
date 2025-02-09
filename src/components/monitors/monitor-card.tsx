import { Monitor } from "@/types/monitor"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, CheckCircle, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import { MotionDiv } from "@/components/ui/motion"

interface MonitorCardProps {
  monitor: Monitor
}

export function MonitorCard({ monitor }: MonitorCardProps) {
  const statusConfig = {
    operational: {
      icon: CheckCircle,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/20",
      label: "Operational"
    },
    degraded: {
      icon: AlertTriangle,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
      borderColor: "border-yellow-500/20",
      label: "Degraded"
    },
    down: {
      icon: Activity,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/20",
      label: "Down"
    },
    unknown: {
      icon: AlertTriangle,
      color: "text-gray-500",
      bgColor: "bg-gray-500/10",
      borderColor: "border-gray-500/20",
      label: "Unknown"
    }
  }

  const config = statusConfig[monitor.status]
  const Icon = config.icon

  return (
    <MotionDiv
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="group overflow-hidden border-border/50 hover:border-border hover:shadow-lg transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <MotionDiv
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full",
                  config.bgColor
                )}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Icon className={cn("h-5 w-5", config.color)} />
              </MotionDiv>
              <div className="space-y-1">
                <h3 className="font-medium leading-none">{monitor.name}</h3>
                <Badge 
                  variant="outline" 
                  className={cn(
                    "border transition-colors",
                    config.borderColor,
                    config.color
                  )}
                >
                  {config.label}
                </Badge>
              </div>
            </div>
            <MotionDiv 
              className="text-right"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className={cn(
                "text-2xl font-bold",
                config.color
              )}>
                {monitor.uptime.toFixed(2)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Uptime
              </p>
            </MotionDiv>
          </div>
        </CardContent>
      </Card>
    </MotionDiv>
  )
}