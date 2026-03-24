import { NextRequest, NextResponse } from 'next/server';

interface EPGProgram {
  title: string;
  start: string;
  end: string;
  description?: string;
}

interface EPGData {
  channel: string;
  date: string;
  programs: EPGProgram[];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const channelId = searchParams.get('channel');
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    if (!channelId) {
      return NextResponse.json(
        { success: false, error: 'Channel ID is required' },
        { status: 400 }
      );
    }

    // 这里应该从 EPG 数据源获取节目单
    // 示例数据，实际应该从配置的 EPG 源获取
    const mockEPG: EPGData = {
      channel: channelId,
      date,
      programs: [
        {
          title: '新闻联播',
          start: '2024-01-01T19:00:00',
          end: '2024-01-01T19:30:00',
          description: '每日新闻节目',
        },
        {
          title: '天气预报',
          start: '2024-01-01T19:30:00',
          end: '2024-01-01T19:35:00',
        },
      ],
    };

    // 过滤指定日期的节目
    const filteredPrograms = mockEPG.programs.filter(program => {
      const programDate = new Date(program.start).toISOString().split('T')[0];
      return programDate === date;
    });

    return NextResponse.json({
      success: true,
      data: {
        channel: channelId,
        date,
        programs: filteredPrograms,
      },
    });
  } catch (error) {
    console.error('Live EPG API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load EPG data' },
      { status: 500 }
    );
  }
}
