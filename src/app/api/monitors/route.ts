import { fetchMonitors } from '@/utils/api';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

// Cache the response for 30 seconds
export const revalidate = 30;

export async function GET() {
    try {
        if (!process.env.HETRIX_API_TOKEN) {
            console.error('HETRIX_API_TOKEN environment variable is not configured');
            return NextResponse.json(
                { 
                    monitors: [],
                    error: 'HetrixTools API token is not configured. Please set the HETRIX_API_TOKEN environment variable in your Cloudflare Pages settings.'
                },
                { 
                    status: 500,
                }
            );
        }

        const { monitors } = await fetchMonitors();
        
        if (!monitors || monitors.length === 0) {
            console.log('No monitors returned from API');
        }

        return NextResponse.json(
            { monitors },
            {
                status: 200,
                headers: {
                    'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
                }
            }
        );
    } catch (error) {
        // Enhanced error logging
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('API Error:', errorMessage);
        
        return NextResponse.json(
            { 
                monitors: [],
                error: errorMessage,
                timestamp: new Date().toISOString()
            },
            { 
                status: 500,
            }
        );
    }
}
