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
  const dims = sizeMap[size];
  const type = showText ? 'logo' : 'symbol';
  const d = showText ? dims.logo : dims.symbol;

  // Fixed variant — render single image, no theme dependency
  if (variant !== 'auto') {
    return (
      <Image
        src={`/images/wisebox-${type}-${variant}.svg`}
        alt="Wisebox"
        width={d.w}
        height={d.h}
        className={cn('object-contain', className)}
        priority
      />
    );
  }

  // Auto variant — use CSS dark: classes for instant swap, no JS, no hydration flash
  return (
    <span className={cn('inline-flex', className)}>
      <Image
        src={`/images/wisebox-${type}-light.svg`}
        alt="Wisebox"
        width={d.w}
        height={d.h}
        className="object-contain block dark:hidden"
        priority
      />
      <Image
        src={`/images/wisebox-${type}-dark.svg`}
        alt="Wisebox"
        width={d.w}
        height={d.h}
        className="object-contain hidden dark:block"
        priority
      />
    </span>
  );
}
