import { NextRequest, NextResponse } from 'next/server';
import { LiveUtils, LiveChannel } from '@/lib/live';
import { getConfig } from '@/lib/config';

export async function GET(request: NextRequest) {
  try {
    const config = getConfig();
    const { searchParams } = new URL(request.url);

    const group = searchParams.get('group');
    const search = searchParams.get('search');

    // 从配置中获取直播源
    const liveConfig = config.LiveConfig || { sources: [] };
    const sources = liveConfig.sources || [];

    let allChannels: LiveChannel[] = [];

    // 加载所有源的频道
    for (const source of sources) {
      if (!source.enabled) continue;

      try {
        const response = await fetch(source.url);
        if (!response.ok) continue;

        const content = await response.text();
        let channels: LiveChannel[] = [];

        if (source.type === 'm3u') {
          channels = LiveUtils.parseM3U(content);
        } else {
          // 处理其他格式
          continue;
        }

        // 添加源信息
        channels = channels.map((channel) => ({
          ...channel,
          source: source.name,
        }));

        allChannels = allChannels.concat(channels);
      } catch (error) {
        console.error(`Failed to load source ${source.name}:`, error);
      }
    }

    // 按组分组
    let groups = LiveUtils.groupChannels(allChannels);

    // 过滤分组
    if (group) {
      groups = groups.filter((g) => g.name === group);
    }

    // 搜索过滤
    if (search) {
      groups = groups
        .map((g) => ({
          ...g,
          channels: LiveUtils.filterChannels(g.channels, search),
        }))
        .filter((g) => g.channels.length > 0);
    }

    // 排序频道
    groups = groups.map((g) => ({
      ...g,
      channels: LiveUtils.sortChannels(g.channels),
    }));

    return NextResponse.json({
      success: true,
      data: {
        groups,
        totalChannels: allChannels.length,
      },
    });
  } catch (error) {
    console.error('Live channels API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load channels' },
      { status: 500 }
    );
  }
}
