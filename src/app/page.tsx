"use client"

import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { MonitorGrid } from '@/components/monitors/monitor-grid'
import { StatusOverview } from '@/components/status/status-overview'
import { useMonitors } from '@/hooks/use-monitors'
import { useCurrentTime } from '@/hooks/use-current-time'
import { ErrorBoundary, FallbackProps } from 'react-error-boundary'
import { Button } from '@/components/ui/button'

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="text-center p-4 rounded-lg bg-destructive/10 text-destructive">
      <h2 className="text-lg font-semibold mb-2">Something went wrong</h2>
      <pre className="text-sm mb-4">{error.message}</pre>
      <Button
        onClick={resetErrorBoundary}
        className="px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
      >
        Try again
      </Button>
    </div>
  )
}

export default function Home() {
  const { monitors, loading, error, refresh } = useMonitors()
  const currentTime = useCurrentTime(5000) // Update every 5 seconds

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background/95 to-background">
        <Header />
        <main className="container mx-auto px-4 py-8 flex-1">
          <div className="max-w-2xl mx-auto">
            <ErrorFallback 
              error={error} 
              resetErrorBoundary={refresh}
            />
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (    
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background/95 to-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 flex-1 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <ErrorBoundary FallbackComponent={ErrorFallback} onReset={refresh}>
          {/* Status Overview */}
          <div className="mb-12">
            <StatusOverview 
              monitors={monitors} 
              lastUpdated={currentTime || 'Loading...'}
            />
          </div>

          {/* Monitors */}
          <div className="space-y-12">
            <section>
              <MonitorGrid 
                monitors={monitors}
                loading={loading}
                error={error}
                onRefresh={refresh}
              />
            </section>

            <section className="animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
              <div className="space-y-1 mb-6">
                <h2 className="text-2xl font-bold tracking-tight">Incident History</h2>
                <p className="text-sm text-muted-foreground">
                  Recent system incidents and their resolutions
                </p>
              </div>
              <div className="rounded-2xl backdrop-blur-sm shadow-lg transition-all duration-300 bg-card/50 ring-1 ring-border/50 p-8 hover:shadow-xl hover:bg-card/60">
                <div className="flex items-center justify-center py-8">
                  <p className="text-muted-foreground">
                    No incidents reported in the last 90 days 
                  </p>
                </div>
              </div>
            </section>
          </div>
        </ErrorBoundary>
      </main>
      
      <Footer />
    </div>
  )
}