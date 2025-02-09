'use client'

import { createContext, useContext } from "react"

interface EnvContextType {
  showSystemStats: boolean
  showCpuStats: boolean
  showRamStats: boolean
  showDiskStats: boolean
  showNetworkStats: boolean
}

const defaultEnv: EnvContextType = {
  showSystemStats: true,
  showCpuStats: true,
  showRamStats: true,
  showDiskStats: true,
  showNetworkStats: true,
}

const EnvContext = createContext<EnvContextType>(defaultEnv)

export function EnvProvider({
  children,
  showSystemStats = true,
  showCpuStats = true,
  showRamStats = true,
  showDiskStats = true,
  showNetworkStats = true,
}: {
  children: React.ReactNode
} & Partial<EnvContextType>) {
  const value = {
    showSystemStats,
    showCpuStats,
    showRamStats,
    showDiskStats,
    showNetworkStats,
  }
  
  return <EnvContext.Provider value={value}>{children}</EnvContext.Provider>
}

export function useEnv() {
  return useContext(EnvContext)
}
