import { type NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

const debug = (...args: unknown[]) => {
    if (process.env.NODE_ENV === 'development') {
        console.log(...args);
    }
};

type Context = {
    params: Promise<{ id: string }>;
};

export async function GET(
    req: NextRequest,
    context: Context
): Promise<NextResponse> {
    try {
        const params = await context.params;
        const { id } = params;

        if (!process.env.HETRIX_API_TOKEN) {
            debug('HETRIX_API_TOKEN environment variable is not configured');
            return NextResponse.json(
                { error: 'HetrixTools API token is not configured' },
                { status: 500 }
            );
        }

        debug('Fetching stats for monitor ID:', id);
        const response = await fetch(`https://api.hetrixtools.com/v1/${process.env.HETRIX_API_TOKEN}/server/stats/${id}/`);
        const data = await response.json();

        // Log raw response in development only
        debug('Raw API Response:', JSON.stringify(data, null, 2));

        if (!response.ok) {
            if (response.status === 404) {
                return NextResponse.json(
                    { error: 'no-agent' },
                    { 
                        status: 404,
                        headers: {
                            'Cache-Control': 'public, max-age=300'
                        }
                    }
                );
            }

            if (response.status === 429) {
                return NextResponse.json(
                    { error: 'rate-limited' },
                    { 
                        status: 429,
                        headers: {
                            'Cache-Control': 'public, max-age=60, stale-while-revalidate=300'
                        }
                    }
                );
            }

            throw new Error(`API request failed with status ${response.status}`);
        }

        // Get the latest stats from the Stats array
        const latestStats = data.Stats?.[0] || {};

        // Format the response with correct usage percentages
        const stats = {
            status: 'success',
            data: {
                cpu: parseFloat(latestStats.CPU || '0'),
                ram: parseFloat(latestStats.RAM || '0'),
                disk: parseFloat(latestStats.Disk || '0'),
                network: {
                    in: parseFloat(latestStats.Network?.In || '0'),
                    out: parseFloat(latestStats.Network?.Out || '0')
                },
                timestamp: new Date().toISOString()
            }
        };

        // Log formatted stats in development only
        debug('Formatted stats:', stats);

        return NextResponse.json(stats, {
            headers: {
                'Cache-Control': 'public, max-age=30, stale-while-revalidate=300'
            }
        });
    } catch (error) {
        debug('Error in stats API route:', error);
        
        return NextResponse.json(
            { error: 'Failed to fetch server stats' },
            { status: 500 }
        );
    }
}
