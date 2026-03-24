// 直播相关类型和工具函数

export interface LiveChannel {
  id: string;
  tvgId: string;
  name: string;
  logo: string;
  group: string;
  url: string;
  source?: string;
}

export interface LiveGroup {
  id: string;
  name: string;
  channels: LiveChannel[];
}

export interface LiveSource {
  id: string;
  name: string;
  url: string;
  type: 'm3u' | 'json' | 'xml';
  enabled: boolean;
  lastUpdate?: number;
  groups?: LiveGroup[];
}

export class LiveUtils {
  /**
   * 解析 M3U 格式的直播源
   */
  static parseM3U(content: string): LiveChannel[] {
    const lines = content.split('\n');
    const channels: LiveChannel[] = [];
    let currentChannel: Partial<LiveChannel> = {};

    for (const line of lines) {
      const trimmed = line.trim();

      if (trimmed.startsWith('#EXTINF:')) {
        // 解析频道信息
        const info = trimmed.substring(8);
        const nameMatch = info.match(/,(.+)$/);
        const tvgIdMatch = info.match(/tvg-id="([^"]*)"/);
        const logoMatch = info.match(/tvg-logo="([^"]*)"/);
        const groupMatch = info.match(/group-title="([^"]*)"/);

        currentChannel = {
          id: '',
          tvgId: tvgIdMatch ? tvgIdMatch[1] : '',
          name: nameMatch ? nameMatch[1] : '',
          logo: logoMatch ? logoMatch[1] : '',
          group: groupMatch ? groupMatch[1] : '其他',
          url: '',
        };
      } else if (trimmed && !trimmed.startsWith('#')) {
        // 这是 URL 行
        if (currentChannel.name) {
          currentChannel.id = this.generateChannelId(currentChannel.name, currentChannel.tvgId);
          currentChannel.url = trimmed;
          channels.push(currentChannel as LiveChannel);
          currentChannel = {};
        }
      }
    }

    return channels;
  }

  /**
   * 按组分组频道
   */
  static groupChannels(channels: LiveChannel[]): LiveGroup[] {
    const groups: { [key: string]: LiveChannel[] } = {};

    for (const channel of channels) {
      const groupName = channel.group || '其他';
      if (!groups[groupName]) {
        groups[groupName] = [];
      }
      groups[groupName].push(channel);
    }

    return Object.entries(groups).map(([name, channels]) => ({
      id: this.generateGroupId(name),
      name,
      channels: this.sortChannels(channels),
    }));
  }

  /**
   * 搜索和过滤频道
   */
  static filterChannels(channels: LiveChannel[], searchTerm: string): LiveChannel[] {
    if (!searchTerm.trim()) return channels;

    const term = searchTerm.toLowerCase();
    return channels.filter(channel =>
      channel.name.toLowerCase().includes(term) ||
      channel.group.toLowerCase().includes(term)
    );
  }

  /**
   * 排序频道
   */
  static sortChannels(channels: LiveChannel[]): LiveChannel[] {
    return channels.sort((a, b) => {
      // 按数字排序（频道号）
      const aMatch = a.name.match(/^(\d+)/);
      const bMatch = b.name.match(/^(\d+)/);

      if (aMatch && bMatch) {
        const aNum = parseInt(aMatch[1]);
        const bNum = parseInt(bMatch[1]);
        if (aNum !== bNum) {
          return aNum - bNum;
        }
      }

      // 按名称排序
      return a.name.localeCompare(b.name);
    });
  }

  /**
   * 生成频道 ID
   */
  private static generateChannelId(name: string, tvgId?: string): string {
    if (tvgId) return tvgId;
    return name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  }

  /**
   * 生成分组 ID
   */
  private static generateGroupId(name: string): string {
    return name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  }

  /**
   * 获取基础 URL
   */
  static getBaseUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      return `${urlObj.protocol}//${urlObj.host}${urlObj.pathname.substring(0, urlObj.pathname.lastIndexOf('/') + 1)}`;
    } catch {
      return '';
    }
  }

  /**
   * 解析相对 URL
   */
  static resolveUrl(baseUrl: string, relativeUrl: string): string {
    try {
      return new URL(relativeUrl, baseUrl).href;
    } catch {
      return relativeUrl;
    }
  }
}

/**
 * 获取缓存的直播频道数据
 */
export async function getCachedLiveChannels(sourceKey: string): Promise<{
  channels: LiveChannel[];
  epgs: { [tvgId: string]: any[] };
  epgUrl?: string;
} | null> {
  // 这里应该从缓存（如 Redis）获取数据
  // 暂时返回 null，表示需要实现具体的缓存逻辑
  return null;
}

/**
 * 缓存直播频道数据
 */
export async function setCachedLiveChannels(
  sourceKey: string,
  data: {
    channels: LiveChannel[];
    epgs: { [tvgId: string]: any[] };
    epgUrl?: string;
  }
): Promise<void> {
  // 这里应该将数据缓存到 Redis 等存储中
  // 暂时为空实现
}
