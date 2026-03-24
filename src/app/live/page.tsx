'use client';

import { useState, useEffect } from 'react';
import { LiveChannel, LiveGroup, LiveUtils } from '@/lib/live';
import { useVirtualList } from '@/hooks/useVirtualList';

export default function LivePage() {
  const [groups, setGroups] = useState<LiveGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<LiveChannel | null>(null);

  useEffect(() => {
    loadChannels();
  }, []);

  const loadChannels = async () => {
    try {
      // 从配置或 API 加载频道数据
      // 这里是示例数据，实际应该从配置文件或 API 获取
      const mockChannels: LiveChannel[] = [
        {
          id: 'cctv1',
          name: 'CCTV-1 综合',
          logo: '/logos/cctv1.png',
          url: 'https://example.com/cctv1.m3u8',
          group: '央视频道',
          enabled: true,
        },
        {
          id: 'cctv2',
          name: 'CCTV-2 财经',
          logo: '/logos/cctv2.png',
          url: 'https://example.com/cctv2.m3u8',
          group: '央视频道',
          enabled: true,
        },
      ];

      const grouped = LiveUtils.groupChannels(mockChannels);
      setGroups(grouped);
    } catch (error) {
      console.error('Failed to load channels:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredGroups = groups.map(group => ({
    ...group,
    channels: LiveUtils.filterChannels(group.channels, searchTerm),
  })).filter(group => group.channels.length > 0);

  const handleChannelClick = (channel: LiveChannel) => {
    setSelectedChannel(channel);
  };

  const handleGroupClick = (groupId: string) => {
    setSelectedGroup(selectedGroup === groupId ? null : groupId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">直播</h1>

        {/* 搜索框 */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="搜索频道..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 频道列表 */}
        <div className="lg:col-span-3">
          {filteredGroups.map((group) => (
            <div key={group.id} className="mb-6">
              <button
                onClick={() => handleGroupClick(group.id)}
                className="w-full text-left mb-3 pb-2 border-b border-gray-200 hover:border-gray-400 transition-colors"
              >
                <h2 className="text-xl font-semibold flex items-center justify-between">
                  {group.name}
                  <span className="text-sm text-gray-500">
                    ({group.channels.length})
                  </span>
                </h2>
              </button>

              {(selectedGroup === group.id || !selectedGroup) && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                  {group.channels.map((channel) => (
                    <div
                      key={channel.id}
                      onClick={() => handleChannelClick(channel)}
                      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer p-4"
                    >
                      <div className="aspect-video bg-gray-200 rounded mb-2 flex items-center justify-center">
                        {channel.logo ? (
                          <img
                            src={channel.logo}
                            alt={channel.name}
                            className="w-full h-full object-cover rounded"
                          />
                        ) : (
                          <span className="text-gray-500 text-sm">无Logo</span>
                        )}
                      </div>
                      <h3 className="font-medium text-sm truncate" title={channel.name}>
                        {channel.name}
                      </h3>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 播放器 */}
        <div className="lg:col-span-1">
          <div className="sticky top-4">
            <h2 className="text-xl font-semibold mb-4">播放器</h2>
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              {selectedChannel ? (
                <div className="w-full h-full flex items-center justify-center text-white">
                  <div className="text-center">
                    <h3 className="font-medium mb-2">{selectedChannel.name}</h3>
                    <p className="text-sm text-gray-300 mb-4">播放器将在这里显示</p>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
                      开始播放
                    </button>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <p>请选择一个频道</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
