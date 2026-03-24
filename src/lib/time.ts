// 时间处理工具函数

/**
 * 解析自定义时间格式
 * 支持的格式：
 * - YYYYMMDDHHMMSS
 * - YYYY-MM-DD HH:MM:SS
 * - Unix 时间戳
 * - ISO 字符串
 */
export function parseCustomTimeFormat(timeStr: string): Date {
  if (!timeStr) {
    return new Date();
  }

  // 尝试作为数字解析（Unix 时间戳）
  const timestamp = parseInt(timeStr);
  if (!isNaN(timestamp)) {
    // 如果是秒级时间戳，转换为毫秒
    if (timestamp < 10000000000) {
      return new Date(timestamp * 1000);
    }
    return new Date(timestamp);
  }

  // 尝试作为 ISO 字符串解析
  const isoDate = new Date(timeStr);
  if (!isNaN(isoDate.getTime())) {
    return isoDate;
  }

  // 尝试解析 YYYYMMDDHHMMSS 格式
  const yyyymmddhhmmssMatch = timeStr.match(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/);
  if (yyyymmddhhmmssMatch) {
    const [, year, month, day, hour, minute, second] = yyyymmddhhmmssMatch;
    return new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
      parseInt(hour),
      parseInt(minute),
      parseInt(second)
    );
  }

  // 尝试解析 YYYY-MM-DD HH:MM:SS 格式
  const isoMatch = timeStr.match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2}):(\d{2})$/);
  if (isoMatch) {
    const [, year, month, day, hour, minute, second] = isoMatch;
    return new Date(
      parseInt(year),
      parseInt(month) - 1,
      parseInt(day),
      parseInt(hour),
      parseInt(minute),
      parseInt(second)
    );
  }

  // 尝试解析 YYYY-MM-DD 格式
  const dateMatch = timeStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (dateMatch) {
    const [, year, month, day] = dateMatch;
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }

  // 如果都解析失败，返回当前时间
  console.warn(`Unable to parse time format: ${timeStr}`);
  return new Date();
}

/**
 * 格式化时间为自定义格式
 */
export function formatCustomTime(date: Date, format: string = 'YYYY-MM-DD HH:mm:ss'): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return format
    .replace(/YYYY/g, year.toString())
    .replace(/MM/g, month)
    .replace(/DD/g, day)
    .replace(/HH/g, hours)
    .replace(/mm/g, minutes)
    .replace(/ss/g, seconds);
}

/**
 * 获取相对时间描述
 */
export function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return '刚刚';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}分钟前`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}小时前`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays}天前`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths}个月前`;
  }

  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears}年前`;
}

/**
 * 获取时间段描述
 */
export function getTimeRangeDescription(start: Date, end: Date): string {
  const startStr = formatCustomTime(start, 'HH:mm');
  const endStr = formatCustomTime(end, 'HH:mm');

  // 如果是同一天
  if (start.toDateString() === end.toDateString()) {
    return `${startStr}-${endStr}`;
  }

  // 如果是跨天
  const startDateStr = formatCustomTime(start, 'MM-DD HH:mm');
  const endDateStr = formatCustomTime(end, 'MM-DD HH:mm');
  return `${startDateStr} 至 ${endDateStr}`;
}

/**
 * 检查是否是今天
 */
export function isToday(date: Date): boolean {
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

/**
 * 检查是否是昨天
 */
export function isYesterday(date: Date): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return date.toDateString() === yesterday.toDateString();
}

/**
 * 检查是否是本周
 */
export function isThisWeek(date: Date): boolean {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);

  return date >= startOfWeek && date <= endOfWeek;
}

/**
 * 获取星期的中文名称
 */
export function getWeekdayName(date: Date): string {
  const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  return weekdays[date.getDay()];
}

/**
 * 获取月份的中文名称
 */
export function getMonthName(date: Date): string {
  const months = [
    '一月', '二月', '三月', '四月', '五月', '六月',
    '七月', '八月', '九月', '十月', '十一月', '十二月'
  ];
  return months[date.getMonth()];
}

/**
 * 计算两个日期之间的天数差
 */
export function getDaysDifference(date1: Date, date2: Date): number {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.round(Math.abs((date1.getTime() - date2.getTime()) / oneDay));
}

/**
 * 添加天数到日期
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * 添加小时到日期
 */
export function addHours(date: Date, hours: number): Date {
  const result = new Date(date);
  result.setHours(result.getHours() + hours);
  return result;
}

/**
 * 获取当前季度的开始和结束日期
 */
export function getQuarterRange(date: Date = new Date()): { start: Date; end: Date } {
  const year = date.getFullYear();
  const quarter = Math.floor(date.getMonth() / 3);

  const start = new Date(year, quarter * 3, 1);
  const end = new Date(year, (quarter + 1) * 3, 0, 23, 59, 59, 999);

  return { start, end };
}

/**
 * 格式化持续时间（秒转换为 HH:mm:ss）
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * 解析持续时间字符串（HH:mm:ss 转换为秒）
 */
export function parseDuration(durationStr: string): number {
  const parts = durationStr.split(':').map(Number);
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  return 0;
}
