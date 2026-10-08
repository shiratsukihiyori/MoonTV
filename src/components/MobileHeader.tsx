'use client';

import Link from 'next/link';

import { BackButton } from './BackButton';
import { useSite } from './SiteProvider';
import { ThemeToggle } from './ThemeToggle';
import { UserMenu } from './UserMenu';

interface MobileHeaderProps {
  showBackButton?: boolean;
}

const MobileHeader = ({ showBackButton = false }: MobileHeaderProps) => {
  const { siteName } = useSite();
  return (
    <header className='md:hidden relative w-full bg-white/70 backdrop-blur-xl border-b border-gray-200/50 shadow-sm dark:bg-night-900/70 dark:border-white/10'>
      <div className='h-12 flex items-center justify-between px-4'>
        {/* 左侧：返回按钮和设置按钮 */}
        <div className='flex items-center gap-2'>
          {showBackButton && <BackButton />}
        </div>

        {/* 右侧按钮 */}
        <div className='flex items-center gap-2'>
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>

      {/* 中间：Logo（绝对居中） */}
      <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'>
        <Link
          href='/'
          className='text-2xl font-bold tracking-tight bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent dark:from-sky-300 dark:to-blue-400 hover:opacity-80 transition-opacity'
        >
          {siteName}
        </Link>
      </div>
    </header>
  );
};

export default MobileHeader;
