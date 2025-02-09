"use client"

import { Monitor } from "@/types/monitor"
import { UptimeMonitor } from "@/components/uptime-monitor"
import { Skeleton } from "@/components/ui/skeleton"
import { RefreshButton } from "@/components/ui/refresh-button"
import { ChevronDown, FolderIcon } from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import { Badge } from "@/components/ui/badge"
import { groupMonitorsByCategory } from "@/utils/helpers"
import { motion, AnimatePresence } from "framer-motion"

const STORAGE_KEY = 'openCategories'

const categoryVariants = {
  hidden: { 
    height: 0,
    opacity: 0,
    transition: {
      height: {
        duration: 0.3,
        ease: "easeInOut"
      },
      opacity: {
        duration: 0.2
      }
    }
  },
  visible: { 
    height: "auto",
    opacity: 1,
    transition: {
      height: {
        duration: 0.3,
        ease: "easeInOut"
      },
      opacity: {
        duration: 0.2,
        delay: 0.1
      }
    }
  }
}

const gridVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const monitorVariants = {
  hidden: { 
    opacity: 0,
    y: 20
  },
  visible: { 
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  }
}

interface MonitorGridProps {
  monitors: Monitor[]
  loading: boolean
  error: string | null
  onRefresh: () => Promise<void>
}

export function MonitorGrid({ monitors, loading, error, onRefresh }: MonitorGridProps) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [openCategories, setOpenCategories] = useState<string[]>(() => {
    if (typeof window === 'undefined') return []
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })

  // Save open categories to localStorage
  useEffect(() => {
    if (openCategories.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(openCategories))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [openCategories])

  const toggleCategory = useCallback((category: string) => {
    setOpenCategories(prev => {
      const newState = prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
      return newState
    })
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await onRefresh()
    // Add artificial delay
    await new Promise(resolve => setTimeout(resolve, 500))
    setIsRefreshing(false)
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    )
  }

  const groupedMonitors = groupMonitorsByCategory(monitors)
  const categories = Object.keys(groupedMonitors).sort()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">System Status</h2>
          <p className="text-sm text-muted-foreground">
            Monitor status and server metrics
          </p>
        </div>
        <RefreshButton onClick={handleRefresh} loading={loading || isRefreshing} />
      </div>

      {loading && !monitors.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton 
              key={i} 
              className="h-[120px] rounded-lg" 
            />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {categories.map((category) => {
            const stats = groupedMonitors[category]

            return (
              <div 
                key={category} 
                className="overflow-hidden rounded-lg border bg-card"
              >
                <button
                  onClick={() => toggleCategory(category)}
                  className="flex w-full items-center justify-between p-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FolderIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{category}</span>
                    <Badge variant="outline" className="text-xs">
                      {stats.averageUptime.toFixed(2)}% uptime
                    </Badge>
                  </div>
                  <motion.div
                    animate={{ rotate: openCategories.includes(category) ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </motion.div>
                </button>
                <AnimatePresence initial={false}>
                  {openCategories.includes(category) && (
                    <motion.div
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      variants={categoryVariants}
                      className="border-t bg-card/50 overflow-hidden"
                    >
                      <motion.div 
                        className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3"
                        variants={gridVariants}
                      >
                        {stats.monitors.map((monitor: Monitor) => (
                          <motion.div
                            key={monitor.id}
                            variants={monitorVariants}
                          >
                            <UptimeMonitor monitor={monitor} />
                          </motion.div>
                        ))}
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}