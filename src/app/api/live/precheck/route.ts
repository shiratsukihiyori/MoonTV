import { NextRequest, NextResponse } from 'next/server';

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

    // 检查 URL 格式
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // 简单的可达性检查
    try {
      const response = await fetch(url, {
        method: 'HEAD',
        timeout: 5000, // 5秒超时
      });

      return NextResponse.json({
        success: true,
        data: {
          url,
          accessible: response.ok,
          statusCode: response.status,
          contentType: response.headers.get('content-type'),
        },
      });
    } catch (error) {
      return NextResponse.json({
        success: true,
        data: {
          url,
          accessible: false,
          error: 'Network timeout or unreachable',
        },
      });
    }
  } catch (error) {
    console.error('Live precheck API error:', error);
    return NextResponse.json(
      { success: false, error: 'Precheck failed' },
      { status: 500 }
    );
  }
}
