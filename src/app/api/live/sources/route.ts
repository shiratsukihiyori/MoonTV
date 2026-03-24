import { NextRequest, NextResponse } from 'next/server';
import { getConfig } from '@/lib/config';

export async function GET() {
  try {
    const config = getConfig();
    const liveConfig = config.LiveConfig || { sources: [] };
    const sources = liveConfig.sources || [];

    return NextResponse.json({
      success: true,
      data: sources.map((source) => ({
        id: source.id,
        name: source.name,
        type: source.type,
        enabled: source.enabled,
        lastUpdate: source.lastUpdate,
        channelCount:
          source.groups?.reduce(
            (total, group) => total + group.channels.length,
            0
          ) || 0,
      })),
    });
  } catch (error) {
    console.error('Live sources API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load sources' },
      { status: 500 }
    );
  }
}
