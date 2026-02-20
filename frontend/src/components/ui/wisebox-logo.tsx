import { cn } from '@/lib/utils';
import Image from 'next/image';

interface WiseboxLogoProps {
  variant?: 'light' | 'dark';
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: { logo: { w: 120, h: 24 }, symbol: { w: 24, h: 22 } },
  md: { logo: { w: 150, h: 30 }, symbol: { w: 32, h: 30 } },
  lg: { logo: { w: 188, h: 38 }, symbol: { w: 40, h: 38 } },
};

export function WiseboxLogo({ variant = 'light', className, showText = true, size = 'md' }: WiseboxLogoProps) {
  // variant='light' = light-colored logo for dark backgrounds (white text)
  // variant='dark' = dark-colored logo for light backgrounds (navy text)
  const suffix = variant === 'light' ? 'dark' : 'light';
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
