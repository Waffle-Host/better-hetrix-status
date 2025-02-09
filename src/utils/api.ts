import {  RawHetrixMonitor, ServerStats } from '../types/hetrix';
import { Monitor } from '../types/monitor';
const HETRIX_API_TOKEN = process.env.HETRIX_API_TOKEN;
const HETRIX_API_URL = 'https://api.hetrixtools.com/v3';

// In-memory cache for monitors data
let monitorsCache: {    
    data: Monitor[] | null;
    timestamp: number;
    error?: string;
} = {
    data: null,
    timestamp: 0
};

// Cache for server stats data
const serverStatsCache: {
    [key: string]: {
        data: ServerStats | null;
        timestamp: number;
        error?: string;
    };
} = {};

const CACHE_DURATION = 30 * 1000; // 30 seconds
const STALE_WHILE_REVALIDATE = 5 * 60 * 1000; // 5 minutes
const RATE_LIMIT_COOLDOWN = 60 * 1000; // 1 minute

// Rate limiting queue
const requestQueue: { [key: string]: Promise<unknown> } = {};

async function queueRequest<T>(key: string, request: () => Promise<T>): Promise<T> {
    if (await requestQueue[key]) {
        return requestQueue[key] as Promise<T>;
    }

    try {
        requestQueue[key] = request();
        return await requestQueue[key] as Promise<T>;
    } finally {
        delete requestQueue[key];
    }
}

export async function fetchMonitors(): Promise<{ monitors: Monitor[] }> {
    const now = Date.now();
    const isCacheValid = monitorsCache.data && (now - monitorsCache.timestamp) < CACHE_DURATION;
    const isCacheStale = monitorsCache.data && (now - monitorsCache.timestamp) < STALE_WHILE_REVALIDATE;

    // Return valid cache
    if (isCacheValid && monitorsCache.data) {
        return { monitors: monitorsCache.data };
    }

    // Return stale data while revalidating in background
    if (isCacheStale && monitorsCache.data) {
        queueRequest('monitors', () => fetchMonitors());
        return { monitors: monitorsCache.data };
    }

    // If rate limited recently, wait before trying again
    if (monitorsCache.error === 'rate-limited' && (now - monitorsCache.timestamp) < RATE_LIMIT_COOLDOWN) {
        throw new Error('Rate limited');
    }

    return queueRequest('monitors', async () => {
        try {
            if (!HETRIX_API_TOKEN) {
                throw new Error('HETRIX_API_TOKEN environment variable is not configured');
            }

            console.log('Fetching monitors from HetrixTools API...');
            const response = await fetch(`${HETRIX_API_URL}/uptime-monitors`, {
                headers: {
                    'Authorization': `Bearer ${HETRIX_API_TOKEN}`
                },
                method: 'GET',
                cache: 'no-store'
            });

            console.log('API Response Status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('API Error Response:', errorText);
                throw new Error(`API request failed with status ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            console.log('Raw API Response:', JSON.stringify(data, null, 2));

            // HetrixTools API returns monitors in the monitors array
            const monitorsData = data.monitors || [];

            if (!Array.isArray(monitorsData)) {
                throw new Error(`Invalid API response format. Expected array, got ${typeof monitorsData}`);
            }

            const monitorsWithRequiredFields = monitorsData.map((monitor: RawHetrixMonitor) => {
                // Log raw monitor data
                console.log('Raw monitor data:', {
                    id: monitor.id || monitor.ID,
                    name: monitor.name || monitor.Name,
                    type: monitor.type,
                    category: monitor.category,
                    monitor_type: monitor.monitor_type
                });

                // A monitor has an agent if it's in the Nodes category
                const category = monitor.category || 'Uncategorized';
                const hasAgent = category === 'Nodes';

                return {
                    lastCheck: monitor.last_check || 'unknown',
                    type: monitor.type || 'defaultType',
                    responseTime: monitor.locations ? 
                        Object.values(monitor.locations).reduce((acc, loc) => acc + (loc.response_time || 0), 0) / 
                        Object.keys(monitor.locations).length : 0,
                    status: (monitor.uptime_status === 'up' ? 'operational' : 
                            monitor.uptime_status === 'down' ? 'down' : 
                            monitor.uptime_status === 'maintenance' || monitor.monitor_status === 'maintenance' ? 'degraded' : 
                            'unknown') as 'operational' | 'degraded' | 'down' | 'unknown',
                    id: String(monitor.id || monitor.ID || ''),
                    name: String(monitor.name || monitor.Name || 'Unknown Monitor'),
                    uptime: Number(parseFloat(monitor.uptime?.toString() || '0').toFixed(2)),
                    category,
                    hasAgent
                };
            }) as Monitor[];

            // Log processed monitors
            console.log('Processed monitors:', monitorsWithRequiredFields.map(m => ({
                name: m.name,
                type: m.type,
                category: m.category,
                hasAgent: m.hasAgent
            })));

            // Update cache
            monitorsCache = {
                data: monitorsWithRequiredFields,
                timestamp: now
            };

            return { monitors: monitorsWithRequiredFields };

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            console.error('Error in fetchMonitors:', errorMessage);
            
            if (isCacheStale && monitorsCache.data) {
                console.log('Using stale cache due to API error');
                return { monitors: monitorsCache.data };
            }

            // Update cache with error
            monitorsCache = {
                data: null,
                timestamp: now,
                error: 'rate-limited'
            };

            throw new Error(`Failed to fetch monitors: ${errorMessage}`);
        }
    });
}

export async function fetchServerStats(monitorId: string): Promise<ServerStats> {
    const now = Date.now();
    const cache = serverStatsCache[monitorId];
    const isCacheValid = cache?.data && (now - cache.timestamp) < CACHE_DURATION;
    const isCacheStale = cache?.data && (now - cache.timestamp) < STALE_WHILE_REVALIDATE;

    // Return valid cache
    if (isCacheValid && cache.data) {
        console.log('Using valid cache for server stats');
        return cache.data;
    }

    try {
        if (!HETRIX_API_TOKEN) {
            throw new Error('HETRIX_API_TOKEN environment variable is not configured');
        }

        // If we're rate limited but have stale cache, use it
        if (isCacheStale && cache?.data) {
            console.log('Using stale cache for server stats due to rate limit');
            return cache.data;
        }

        console.log(`Fetching server stats for monitor ${monitorId} from HetrixTools API...`);
        const response = await fetch(`${HETRIX_API_URL}/server-monitor/${monitorId}/stats`, {
            headers: {
                'Authorization': `Bearer ${HETRIX_API_TOKEN}`
            },
            method: 'GET',
            cache: 'no-store'
        });

        const data = await response.json();
        console.log('Server stats response:', data);

        if (!response.ok || data.status === 'ERROR') {
            throw new Error(data.error_message || 'Failed to fetch server stats');
        }

        // Get the latest stats
        const stats: ServerStats = {
            status: data.status,
            data: {
                cpu: parseFloat(data.cpu || '0'),
                ram: parseFloat(data.ram || '0'),
                disk: parseFloat(data.disk || '0'),
                network: {
                    in: parseFloat(data.network?.in || '0'),
                    out: parseFloat(data.network?.out || '0')
                },
                timestamp: new Date().toISOString()
            }
        };

        // Update cache
        serverStatsCache[monitorId] = {
            data: stats,
            timestamp: now
        };

        return stats;

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error(`Error fetching server stats for monitor ${monitorId}:`, errorMessage);

        // If we have stale cache and hit an error, use it
        if (isCacheStale && cache?.data) {
            console.log('Using stale cache for server stats due to error');
            return cache.data;
        }

        throw new Error(`Failed to fetch server stats: ${errorMessage}`);
    }
}
