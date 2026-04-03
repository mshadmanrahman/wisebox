/* ─── Per-index unique gradient (radial, inline style) ──────────────── */

const PALETTES = [
  { a: 'rgba(235,150,140,0.35)', b: 'rgba(180,150,210,0.20)', c: 'rgba(220,180,160,0.15)' },
  { a: 'rgba(100,160,230,0.35)', b: 'rgba(80,200,190,0.20)',  c: 'rgba(140,180,220,0.15)' },
  { a: 'rgba(220,180,100,0.35)', b: 'rgba(210,140,150,0.20)', c: 'rgba(230,200,140,0.15)' },
  { a: 'rgba(80,200,140,0.35)',  b: 'rgba(140,220,180,0.20)', c: 'rgba(100,210,160,0.15)' },
  { a: 'rgba(170,130,210,0.35)', b: 'rgba(210,150,180,0.20)', c: 'rgba(180,140,200,0.15)' },
  { a: 'rgba(240,170,120,0.35)', b: 'rgba(240,210,130,0.20)', c: 'rgba(230,180,140,0.15)' },
  { a: 'rgba(130,160,230,0.35)', b: 'rgba(160,140,220,0.20)', c: 'rgba(140,170,210,0.15)' },
  { a: 'rgba(160,190,130,0.35)', b: 'rgba(180,160,120,0.20)', c: 'rgba(150,180,140,0.15)' },
];

const POSITIONS = [
  { ax: 15, ay: 20, bx: 60, by: 40, cx: 85, cy: 70 },
  { ax: 80, ay: 15, bx: 35, by: 55, cx: 15, cy: 75 },
  { ax: 50, ay: 10, bx: 85, by: 50, cx: 20, cy: 80 },
  { ax: 20, ay: 60, bx: 70, by: 20, cx: 50, cy: 80 },
  { ax: 75, ay: 30, bx: 25, by: 65, cx: 60, cy: 15 },
  { ax: 10, ay: 45, bx: 55, by: 15, cx: 85, cy: 55 },
  { ax: 65, ay: 65, bx: 20, by: 25, cx: 75, cy: 40 },
  { ax: 40, ay: 15, bx: 80, by: 70, cx: 15, cy: 50 },
];

export function getPropertyGradient(index: number): string {
  const p = PALETTES[index % PALETTES.length];
  const pos = POSITIONS[index % POSITIONS.length];
  return [
    `radial-gradient(ellipse at ${pos.ax}% ${pos.ay}%, ${p.a} 0%, transparent 50%)`,
    `radial-gradient(ellipse at ${pos.bx}% ${pos.by}%, ${p.b} 0%, transparent 45%)`,
    `radial-gradient(ellipse at ${pos.cx}% ${pos.cy}%, ${p.c} 0%, transparent 50%)`,
  ].join(', ');
}

/* ─── Type-based badge colors only ──────────────────────────────────── */

const BADGE_COLORS: Record<string, string> = {
  land:         'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  apartment:    'bg-sky-100 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400',
  flat:         'bg-sky-100 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400',
  commercial:   'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  agricultural: 'bg-lime-100 text-lime-700 dark:bg-lime-500/10 dark:text-lime-400',
  industrial:   'bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-400',
};

const DEFAULT_BADGE = 'bg-primary/10 text-primary';

export function getPropertyTypeBadge(typeName: string | null | undefined): string {
  if (!typeName) return DEFAULT_BADGE;
  return BADGE_COLORS[typeName.toLowerCase()] ?? DEFAULT_BADGE;
}

/* ─── Score bar color ────────────────────────────────────────────────── */

export function scoreBarColor(pct: number): string {
  if (pct >= 70) return 'bg-green-500';
  if (pct >= 40) return 'bg-amber-500';
  return 'bg-red-500';
}
