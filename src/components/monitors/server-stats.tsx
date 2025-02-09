'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import type { ServerStats as ServerStatsType } from '@/types/hetrix';
import { AlertCircle } from 'lucide-react';
import { useEnv } from '@/providers/env-provider';
import { motion, AnimatePresence } from 'framer-motion';

interface ServerStatsProps {
    monitorId: string;
}

interface Metric {
    label: string;
    value: number;
    format: (v: number) => string;
}

const fadeInUp = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 }
};

const stagger = {
    animate: {
        transition: {
            staggerChildren: 0.1
        }
    }
};

const progressVariants = {
    initial: { width: 0 },
    animate: (value: number) => ({
        width: `${value}%`,
        transition: { duration: 0.5, ease: "easeOut" }
    })
};

export function ServerStats({ monitorId }: ServerStatsProps) {
    const env = useEnv();
    const [stats, setStats] = useState<ServerStatsType | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [retryIn, setRetryIn] = useState(0);

    const fetchStats = useCallback(async () => {
        try {
            const response = await fetch(`/api/monitors/${monitorId}/stats`);
            const data = await response.json();
            
            if (response.status === 429) {
                setError('rate-limited');
                setRetryIn(60);
                return;
            }
            
            if (response.status === 404 && data.error === 'no-agent') {
                setError('no-agent');
                return;
            }
            
            if (response.ok && data?.data) {
                setStats(data);
                setError(null);
                setRetryIn(0);
            } else {
                setError(data?.error || 'Failed to fetch stats');
            }
        } catch (err) {
            console.error('Error fetching stats:', err);
            setError('Failed to fetch stats');
        }
    }, [monitorId]);

    useEffect(() => {
        let mounted = true;
        let pollInterval: NodeJS.Timeout;

        // Initial fetch
        fetchStats();

        // Setup polling
        if (env.showSystemStats || env.showNetworkStats) {
            pollInterval = setInterval(fetchStats, 30000); // Poll every 30 seconds
        }

        // Setup retry countdown
        if (error === 'rate-limited' && retryIn > 0) {
            const countdown = setInterval(() => {
                if (mounted) {
                    setRetryIn(prev => {
                        if (prev <= 1) {
                            clearInterval(countdown);
                            fetchStats();
                            return 0;
                        }
                        return prev - 1;
                    });
                }
            }, 1000);

            return () => {
                mounted = false;
                clearInterval(countdown);
                clearInterval(pollInterval);
            };
        }

        return () => {
            mounted = false;
            clearInterval(pollInterval);
        };
    }, [error, retryIn, fetchStats, env.showSystemStats, env.showNetworkStats]);

    const systemMetrics = useMemo<Metric[]>(() => {
        const metrics: Metric[] = [];
        
        if (stats?.data && env.showSystemStats) {
            if (env.showCpuStats) {
                metrics.push({
                    label: 'CPU',
                    value: stats.data.cpu,
                    format: (v: number) => `${v.toFixed(1)}%`
                });
            }
            
            if (env.showRamStats) {
                metrics.push({
                    label: 'RAM',
                    value: stats.data.ram,
                    format: (v: number) => `${v.toFixed(1)}%`
                });
            }
            
            if (env.showDiskStats) {
                metrics.push({
                    label: 'Disk',
                    value: stats.data.disk,
                    format: (v: number) => `${v.toFixed(1)}%`
                });
            }
        }
        
        return metrics;
    }, [env.showSystemStats, env.showCpuStats, env.showRamStats, env.showDiskStats, stats?.data]);

    // Early return if no stats are enabled
    if (!env.showSystemStats && !env.showNetworkStats) {
        return null;
    }

    // If there's no agent, don't show anything
    if (error === 'no-agent') {
        return null;
    }

    // Determine what sections to show
    const showSystemMetrics = Boolean(env.showSystemStats && systemMetrics.length > 0);
    const showNetworkStats = env.showNetworkStats === true && stats?.data?.network;

    // Default values
    const currentStats = {
        cpu: stats?.data?.cpu ?? 0,
        ram: stats?.data?.ram ?? 0,
        disk: stats?.data?.disk ?? 0,
        network_in: stats?.data?.network?.in ?? 0,
        network_out: stats?.data?.network?.out ?? 0
    };

    const getProgressColor = (value: number) => {
        if (value >= 90) return "bg-red-500";
        if (value >= 75) return "bg-orange-500";
        if (value >= 50) return "bg-yellow-500";
        return "bg-green-500";
    };

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 B/s';
        const k = 1024;
        const sizes = ['B/s', 'KB/s', 'MB/s', 'GB/s', 'TB/s'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    // If rate limited, show a message
    if (error === 'rate-limited') {
        return (
            <motion.div
                className="flex items-center gap-2 text-[10px] text-muted-foreground"
                {...fadeInUp}
            >
                <AlertCircle className="h-3 w-3" />
                <span>Rate limited. Retrying in {retryIn}s...</span>
            </motion.div>
        );
    }

    return (
        <AnimatePresence mode="wait">
            <motion.div
                initial="initial"
                animate="animate"
                exit="exit"
                variants={stagger}
            >
                {/* System Metrics */}
                {showSystemMetrics && (
                    <motion.div
                        className={cn(
                            "grid gap-2 text-[10px]",
                            systemMetrics.length === 3 ? "grid-cols-3" :
                            systemMetrics.length === 2 ? "grid-cols-2" : "grid-cols-1"
                        )}
                        variants={stagger}
                    >
                        {systemMetrics.map(({ label, value, format }) => (
                            <motion.div
                                key={label}
                                className="space-y-1"
                                variants={fadeInUp}
                            >
                                <div className="flex justify-between items-center gap-2">
                                    <span className="text-muted-foreground truncate">
                                        {label}
                                    </span>
                                    <motion.span
                                        className="font-medium tabular-nums"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        {format(value)}
                                    </motion.span>
                                </div>
                                <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
                                    <motion.div
                                        className={cn(
                                            "h-full rounded-full",
                                            getProgressColor(value)
                                        )}
                                        variants={progressVariants}
                                        initial="initial"
                                        animate="animate"
                                        custom={value}
                                    />
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}

                {/* Network Metrics */}
                {showNetworkStats && (
                    <motion.div
                        className={cn(
                            "text-[10px]",
                            showSystemMetrics && "mt-1.5"
                        )}
                        variants={fadeInUp}
                    >
                        <div className="flex justify-between items-center gap-2">
                            <span className="text-muted-foreground">Network</span>
                            <div className="flex items-center gap-2 font-medium tabular-nums">
                                <motion.span
                                    className="text-blue-500"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    ↓ {formatBytes(currentStats.network_in)}
                                </motion.span>
                                <motion.span
                                    className="text-emerald-500"
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    ↑ {formatBytes(currentStats.network_out)}
                                </motion.span>
                            </div>
                        </div>
                        <div className="mt-1 h-1 w-full rounded-full bg-muted overflow-hidden">
                            <div className="h-full w-full flex">
                                <motion.div
                                    className="h-full bg-blue-500"
                                    initial={{ width: 0 }}
                                    animate={{ width: '50%' }}
                                    transition={{ duration: 0.5, ease: "easeOut" }}
                                />
                                <motion.div
                                    className="h-full bg-emerald-500"
                                    initial={{ width: 0 }}
                                    animate={{ width: '50%' }}
                                    transition={{ duration: 0.5, ease: "easeOut" }}
                                />
                            </div>
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </AnimatePresence>
    );
}
