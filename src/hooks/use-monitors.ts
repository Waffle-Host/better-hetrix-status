"use client"

import { useState, useEffect, useRef } from "react"
import { Monitor } from "@/types/monitor"

export function useMonitors() {
  const [monitors, setMonitors] = useState<Monitor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const initialFetchDone = useRef(false)

  const fetchMonitors = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch("/api/monitors", {
        next: {
          revalidate: 30
        }
      })
      if (!response.ok) throw new Error("Failed to fetch monitors")
      const data = await response.json()
      setMonitors(data.monitors)
      if (typeof window !== 'undefined') {
        localStorage.setItem('monitors', JSON.stringify(data.monitors))
      }
    } catch {
      setError("Failed to fetch monitors")
      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem('monitors')
        if (cached) setMonitors(JSON.parse(cached))
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!initialFetchDone.current) {
      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem('monitors')
        if (cached) {
          setMonitors(JSON.parse(cached))
          setLoading(false)
        }
      }
      fetchMonitors()
      initialFetchDone.current = true
    }

    const interval = setInterval(fetchMonitors, 30000)
    return () => clearInterval(interval)
  }, [])

  return {
    monitors,
    loading,
    error,
    refresh: fetchMonitors
  }
}