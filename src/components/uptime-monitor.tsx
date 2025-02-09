"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Monitor } from '@/types/monitor';
import { ServerStats } from './monitors/server-stats';
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertTriangle, XCircle, RefreshCw, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from './ui/skeleton';
import { env } from '@/utils/env';

interface UptimeMonitorProps {
    monitor: Monitor;
}

export function UptimeMonitor({ monitor }: UptimeMonitorProps) {
    console.log(`Monitor ${monitor.name}:`, { 
        type: monitor.type,
        category: monitor.category,
        hasAgent: monitor.hasAgent
    });

    const getStatusIcon = () => {
        switch (monitor.status) {
            case 'operational':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'degraded':
                return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
            default:
                return <XCircle className="h-4 w-4 text-red-500" />;
        }
    };

    const getStatusColor = () => {
        switch (monitor.status) {
            case 'operational':
                return "text-green-500 border-green-500/20";
            case 'degraded':
                return "text-yellow-500 border-yellow-500/20";
            default:
                return "text-red-500 border-red-500/20";
        }
    };

    return (
        <div className={cn(
            "group relative overflow-hidden rounded-lg border bg-card px-4 pt-4",
            monitor.hasAgent && env.showSystemStats ? "pb-2" : "pb-3",
            "hover:shadow-sm transition-all duration-200"
        )}>
            <div className="space-y-2.5">
                {/* Header */}
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                        {getStatusIcon()}
                        <h3 className="font-medium truncate">{monitor.name}</h3>
                    </div>
                    <Badge 
                        variant="outline" 
                        className={cn(
                            "capitalize shrink-0",
                            getStatusColor()
                        )}
                    >
                        {monitor.status}
                    </Badge>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Uptime</span>
                    <span className={cn(
                        "font-medium",
                        monitor.uptime >= 99 ? "text-green-500" :
                        monitor.uptime >= 95 ? "text-yellow-500" :
                        "text-red-500"
                    )}>
                        {monitor.uptime.toFixed(2)}%
                    </span>
                </div>

                {/* Server Stats - only for monitors with agents and when enabled */}
                {monitor.hasAgent && env.showSystemStats && (
                    <div>
                        <ServerStats monitorId={monitor.id} />
                    </div>
                )}
            </div>
        </div>
    );
}

export function UptimeMonitorList() {
    const [monitors, setMonitors] = useState<Monitor[]>([]);
    const [lastMonitors, setLastMonitors] = useState<Monitor[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [masterShowStats, setMasterShowStats] = useState(false);

    const fetchMonitors = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch("/api/monitors");
            if (!response.ok) {
                throw new Error("Failed to fetch monitors");
            }
            const data = await response.json();
            setMonitors(data.monitors);
            setLastMonitors(data.monitors); // Update last successful data
            localStorage.setItem('monitors', JSON.stringify(data.monitors)); // Cache the data in local storage
        } catch {
            setError("Failed to fetch monitors");
            setMonitors(lastMonitors); // Revert to last successful data
        } finally {
            setLoading(false);
        }
    }, [lastMonitors]);

    useEffect(() => {
        const cachedMonitors = localStorage.getItem('monitors');
        if (cachedMonitors) {
            setMonitors(JSON.parse(cachedMonitors)); // Load from local storage if available
        }
        fetchMonitors();
        const interval = setInterval(fetchMonitors, 60000);
        return () => clearInterval(interval);
    }, [fetchMonitors]);

    if (error) {
        return (
            <div className="rounded-xl bg-red-50 p-8 animate-in fade-in duration-300">
                <p className="text-sm text-red-800 font-medium">{error}</p>
                <Button
                    onClick={fetchMonitors}
                    variant="destructive"
                    size="sm"
                    className="mt-4"
                >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Retry
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">System Status</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Real-time monitoring dashboard</p>
                </div>
                <Button
                    onClick={() => setMasterShowStats(!masterShowStats)}
                    variant="outline"
                    size="sm"
                    className="transition-all duration-300 hover:shadow"
                >
                    {masterShowStats ? (
                        <><ChevronUp className="w-4 h-4 mr-2" /> Hide All Server Stats</>
                    ) : (
                        <><ChevronDown className="w-4 h-4 mr-2" /> Show All Server Stats</>
                    )}
                </Button>
                <Button
                    onClick={fetchMonitors}
                    disabled={loading}
                    variant="outline"
                    size="sm"
                    className="transition-all duration-300 hover:shadow"
                >
                    {loading ? (
                        <>
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            Refreshing
                        </>
                    ) : (
                        <>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Refresh
                        </>
                    )}
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {loading && monitors.length === 0 ? (
                    Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton 
                            key={`skeleton-${i}`} 
                            className="h-[120px] rounded-xl bg-gray-200 dark:bg-gray-700"
                        />
                    ))
                ) : (
                    monitors.map((monitor) => (
                        <UptimeMonitor key={monitor.id} monitor={monitor} />
                    ))
                )}
            </div>
        </div>
    );
}
