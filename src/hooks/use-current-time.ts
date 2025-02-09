import { useState, useEffect } from 'react'

export function useCurrentTime(updateInterval = 5000) {
  const [currentTime, setCurrentTime] = useState<string>('')

  useEffect(() => {
    // Only set the time on the client side
    if (typeof window !== 'undefined') {
      setCurrentTime(new Date().toLocaleString())
    }
    
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleString())
    }, updateInterval)
    
    return () => clearInterval(timer)
  }, [updateInterval])

  return currentTime
}
