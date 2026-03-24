// 番剧搜索客户端

export interface BangumiItem {
  id: number;
  url: string;
  type: string;
  name: string;
  name_cn: string;
  summary: string;
  air_date: string;
  air_weekday: number;
  rating: {
    total: number;
    count: {
      '1': number;
      '2': number;
      '3': number;
      '4': number;
      '5': number;
      '6': number;
      '7': number;
      '8': number;
      '9': number;
      '10': number;
    };
    score: number;
  };
  rank: number;
  images: {
    large: string;
    common: string;
    medium: string;
    small: string;
    grid: string;
  };
  collection: {
    wish: number;
    collect: number;
    doing: number;
    on_hold: number;
    dropped: number;
  };
}

export interface BangumiSearchResult {
  results: number;
  list: BangumiItem[];
}

export class BangumiClient {
  private static readonly BASE_URL = 'https://api.bgm.tv';
  private static readonly SEARCH_URL = 'https://api.bgm.tv/search/subject';

  /**
   * 搜索番剧
   */
  static async search(query: string, type?: number, responseGroup?: string): Promise<BangumiSearchResult> {
    try {
      const params = new URLSearchParams({
        q: query,
        type: (type || 2).toString(), // 默认动画
        responseGroup: responseGroup || 'small',
      });

      const response = await fetch(`${this.SEARCH_URL}?${params}`, {
        headers: {
          'User-Agent': 'MoonTV/1.0.0',
        },
      });

      if (!response.ok) {
        throw new Error(`Bangumi API error: ${response.status}`);
      }

      const data = await response.json();
      return {
        results: data.results || 0,
        list: data.list || [],
      };
    } catch (error) {
      console.error('Bangumi search error:', error);
      return {
        results: 0,
        list: [],
      };
    }
  }

  /**
   * 获取番剧详情
   */
  static async getSubject(id: number): Promise<BangumiItem | null> {
    try {
      const response = await fetch(`${this.BASE_URL}/v0/subjects/${id}`, {
        headers: {
          'User-Agent': 'MoonTV/1.0.0',
        },
      });

      if (!response.ok) {
        throw new Error(`Bangumi API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Bangumi get subject error:', error);
      return null;
    }
  }

  /**
   * 获取热门番剧
   */
  static async getTrending(): Promise<BangumiItem[]> {
    try {
      const response = await fetch(`${this.BASE_URL}/v0/subjects/trending`, {
        headers: {
          'User-Agent': 'MoonTV/1.0.0',
        },
      });

      if (!response.ok) {
        throw new Error(`Bangumi API error: ${response.status}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Bangumi trending error:', error);
      return [];
    }
  }

  /**
   * 根据年份和季度获取番剧列表
   */
  static async getCalendar(year?: number, season?: string): Promise<any[]> {
    try {
      const currentYear = year || new Date().getFullYear();
      const currentSeason = season || this.getCurrentSeason();

      const response = await fetch(`${this.BASE_URL}/calendar`, {
        headers: {
          'User-Agent': 'MoonTV/1.0.0',
        },
      });

      if (!response.ok) {
        throw new Error(`Bangumi API error: ${response.status}`);
      }

      const data = await response.json();

      // 过滤指定年份和季节的数据
      return data.filter((item: any) => {
        if (!item.items) return false;
        return item.items.some((subject: any) => {
          const airDate = new Date(subject.air_date);
          return airDate.getFullYear() === currentYear &&
                 this.getSeasonFromDate(airDate) === currentSeason;
        });
      });
    } catch (error) {
      console.error('Bangumi calendar error:', error);
      return [];
    }
  }

  /**
   * 获取当前季节
   */
  private static getCurrentSeason(): string {
    const month = new Date().getMonth() + 1;
    if (month >= 1 && month <= 3) return 'winter';
    if (month >= 4 && month <= 6) return 'spring';
    if (month >= 7 && month <= 9) return 'summer';
    return 'fall';
  }

  /**
   * 从日期获取季节
   */
  private static getSeasonFromDate(date: Date): string {
    const month = date.getMonth() + 1;
    if (month >= 1 && month <= 3) return 'winter';
    if (month >= 4 && month <= 6) return 'spring';
    if (month >= 7 && month <= 9) return 'summer';
    return 'fall';
  }
}
