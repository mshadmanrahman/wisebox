'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface WiseboxLogoProps {
  variant?: 'auto' | 'light' | 'dark';
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: { logo: { w: 120, h: 24 }, symbol: { w: 24, h: 22 } },
  md: { logo: { w: 150, h: 30 }, symbol: { w: 32, h: 30 } },
  lg: { logo: { w: 188, h: 38 }, symbol: { w: 40, h: 38 } },
};

export function WiseboxLogo({ variant = 'auto', className, showText = true, size = 'md' }: WiseboxLogoProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Determine which logo file to use:
  // - 'light' variant = logo for light backgrounds (dark wordmark) = wisebox-logo-light.svg
  // - 'dark' variant = logo for dark backgrounds (white wordmark) = wisebox-logo-dark.svg
  // - 'auto' = pick based on current theme
  let suffix: string;
  if (variant === 'auto') {
    if (!mounted) {
      // Before hydration, use light suffix (for light default theme)
      suffix = 'light';
    } else {
      suffix = resolvedTheme === 'dark' ? 'dark' : 'light';
    }
  } else {
    // variant='light' means "use on light bg" = light file (dark wordmark)
    // variant='dark' means "use on dark bg" = dark file (white wordmark)
    suffix = variant;
  }

  const dims = sizeMap[size];

  if (showText) {
    return (
      <Image
        src={`/images/wisebox-logo-${suffix}.svg`}
        alt="Wisebox"
        width={dims.logo.w}
        height={dims.logo.h}
        className={cn('object-contain', className)}
        priority
      />
    );
  }

  return (
    <Image
      src={`/images/wisebox-symbol-${suffix}.svg`}
      alt="Wisebox"
      width={dims.symbol.w}
      height={dims.symbol.h}
      className={cn('object-contain', className)}
      priority
    />
  );
}
