const parseEnvBool = (value: string | undefined, defaultValue: boolean): boolean => {
  if (value === undefined) return defaultValue
  // Explicitly check for 'false' string
  if (value.toLowerCase() === 'false') return false
  return value.toLowerCase() === 'true'
}

const getEnvValue = (key: string) => {
  if (typeof window === 'undefined') {
    return process.env[key]
  }
  return window.__NEXT_DATA__?.props?.pageProps?.env?.[key] ?? process.env[key]
}

export const env = {
  hetrixApiToken: getEnvValue('HETRIX_API_TOKEN'),
  showSystemStats: parseEnvBool(getEnvValue('NEXT_PUBLIC_SHOW_SYSTEM_STATS'), true),
  showCpuStats: parseEnvBool(getEnvValue('NEXT_PUBLIC_SHOW_CPU_STATS'), true),
  showRamStats: parseEnvBool(getEnvValue('NEXT_PUBLIC_SHOW_RAM_STATS'), true),
  showDiskStats: parseEnvBool(getEnvValue('NEXT_PUBLIC_SHOW_DISK_STATS'), true),
  showNetworkStats: parseEnvBool(getEnvValue('NEXT_PUBLIC_SHOW_NETWORK_STATS'), true),
}
