import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'URL parameter is required' },
        { status: 400 }
      );
    }

    // 验证 URL 格式
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // 检查是否为 M3U8 文件
    if (
      !url.toLowerCase().endsWith('.m3u8') &&
      !url.toLowerCase().includes('.m3u8')
    ) {
      return NextResponse.json(
        { success: false, error: 'URL must point to an M3U8 file' },
        { status: 400 }
      );
    }

    // 代理请求 M3U8 文件
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; MoonTV/1.0.0)',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: `Failed to fetch M3U8: ${response.status}` },
        { status: response.status }
      );
    }

    const content = await response.text();
    const contentType =
      response.headers.get('content-type') || 'application/vnd.apple.mpegurl';

    // 处理 M3U8 内容，替换相对 URL 为绝对 URL
    const processedContent = processM3U8Content(content, url);

    return new NextResponse(processedContent, {
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': '*',
      },
    });
  } catch (error) {
    console.error('M3U8 proxy error:', error);
    return NextResponse.json(
      { success: false, error: 'Proxy request failed' },
      { status: 500 }
    );
  }
}

function processM3U8Content(content: string, baseUrl: string): string {
  const lines = content.split('\n');
  const processedLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith('#')) {
      // 注释或标签行，直接保留
      processedLines.push(line);
    } else if (trimmed && !trimmed.startsWith('#')) {
      // 可能是媒体段 URL
      try {
        // 如果是相对路径，转换为绝对路径
        const absoluteUrl = new URL(trimmed, baseUrl).href;
        processedLines.push(absoluteUrl);
      } catch {
        // 如果转换失败，保留原样
        processedLines.push(line);
      }
    } else {
      processedLines.push(line);
    }
  }

  return processedLines.join('\n');
}
