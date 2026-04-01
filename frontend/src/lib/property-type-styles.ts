export interface PropertyTypeStyles {
  gradient: string;
  border: string;
  badge: string;
}

const STYLES: Record<string, PropertyTypeStyles> = {
  land: {
    gradient: 'from-emerald-50/80 via-card to-card dark:from-emerald-500/[0.06] dark:via-card dark:to-card',
    border: 'border-l-2 border-emerald-300/50 dark:border-emerald-500/20',
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  },
  apartment: {
    gradient: 'from-sky-50/80 via-card to-card dark:from-sky-500/[0.06] dark:via-card dark:to-card',
    border: 'border-l-2 border-sky-300/50 dark:border-sky-500/20',
    badge: 'bg-sky-100 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400',
  },
  flat: {
    gradient: 'from-sky-50/80 via-card to-card dark:from-sky-500/[0.06] dark:via-card dark:to-card',
    border: 'border-l-2 border-sky-300/50 dark:border-sky-500/20',
    badge: 'bg-sky-100 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400',
  },
  commercial: {
    gradient: 'from-amber-50/80 via-card to-card dark:from-amber-500/[0.06] dark:via-card dark:to-card',
    border: 'border-l-2 border-amber-300/50 dark:border-amber-500/20',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  },
  agricultural: {
    gradient: 'from-lime-50/80 via-card to-card dark:from-lime-500/[0.06] dark:via-card dark:to-card',
    border: 'border-l-2 border-lime-300/50 dark:border-lime-500/20',
    badge: 'bg-lime-100 text-lime-700 dark:bg-lime-500/10 dark:text-lime-400',
  },
  industrial: {
    gradient: 'from-slate-100/80 via-card to-card dark:from-slate-500/[0.06] dark:via-card dark:to-card',
    border: 'border-l-2 border-slate-300/50 dark:border-slate-500/20',
    badge: 'bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-400',
  },
};

const DEFAULT_STYLES: PropertyTypeStyles = {
  gradient: 'from-primary/[0.04] via-card to-card dark:from-primary/[0.04] dark:via-card dark:to-card',
  border: 'border-l-2 border-primary/30 dark:border-primary/20',
  badge: 'bg-primary/10 text-primary',
};

export function getPropertyTypeStyles(typeName: string | null | undefined): PropertyTypeStyles {
  if (!typeName) return DEFAULT_STYLES;
  return STYLES[typeName.toLowerCase()] ?? DEFAULT_STYLES;
}

export function scoreBarColor(pct: number): string {
  if (pct >= 70) return 'bg-green-500';
  if (pct >= 40) return 'bg-amber-500';
  return 'bg-red-500';
}
