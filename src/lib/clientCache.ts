/* eslint-disable @typescript-eslint/no-explicit-any */

// 客户端轻量缓存 —— 供 VideoCard 悬浮预热与 /play 页复用。
// 命中缓存或进行中的同键请求时不再重复打网络,把"点击 → 开播"的等待压到最低。

type CacheEntry = { time: number; value: any };

const TTL = 10 * 60 * 1000; // 10 分钟

const values = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<any>>();

async function fetchJson(url: string): Promise<any> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/** 读取(或触发并缓存)一个 JSON 请求。同一 key 的并发调用共享同一个 Promise。 */
export function cachedJson<T = any>(key: string, url: string): Promise<T> {
  const entry = values.get(key);
  if (entry && Date.now() - entry.time < TTL) {
    return Promise.resolve(entry.value as T);
  }
  const pending = inflight.get(key);
  if (pending) return pending as Promise<T>;

  const promise = fetchJson(url)
    .then((value) => {
      values.set(key, { time: Date.now(), value });
      inflight.delete(key);
      return value;
    })
    .catch((err) => {
      inflight.delete(key);
      throw err;
    });
  inflight.set(key, promise);
  return promise as Promise<T>;
}

export const detailCacheKey = (source: string, id: string) =>
  `detail:${source}:${id}`;

export const searchCacheKey = (query: string) =>
  `search:${query.trim().toLowerCase()}`;

/** 预热:视频详情(鼠标停到卡片上时悄悄拉好) */
export function warmDetail(source: string, id: string) {
  cachedJson(
    detailCacheKey(source, id),
    `/api/detail?source=${encodeURIComponent(source)}&id=${encodeURIComponent(
      id
    )}`
  ).catch(() => {
    /* 预热失败静默 */
  });
}

/** 预热:多源搜索(豆瓣卡点击后的必经之路) */
export function warmSearch(query: string) {
  const q = query.trim();
  if (!q) return;
  cachedJson(searchCacheKey(q), `/api/search?q=${encodeURIComponent(q)}`).catch(
    () => {
      /* 预热失败静默 */
    }
  );
}
