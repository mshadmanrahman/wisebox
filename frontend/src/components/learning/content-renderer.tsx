'use client';

import { AlertCircle, Info, Lightbulb } from 'lucide-react';
import type { ContentBlock } from '@/data/learning-content';

const CALLOUT_STYLES = {
  info: {
    bg: 'bg-muted border-l-2 border-primary',
    icon: Info,
    iconColor: 'text-primary',
  },
  warning: {
    bg: 'bg-muted border-l-2 border-destructive',
    icon: AlertCircle,
    iconColor: 'text-destructive',
  },
  tip: {
    bg: 'bg-muted border-l-2 border-primary',
    icon: Lightbulb,
    iconColor: 'text-primary',
  },
};

function renderBlock(block: ContentBlock, index: number) {
  switch (block.type) {
    case 'paragraph':
      return (
        <p key={index} className="text-sm text-muted-foreground leading-relaxed">
          {block.text}
        </p>
      );

    case 'heading':
      if (block.level === 2) {
        return (
          <h2 key={index} className="text-xl font-semibold text-foreground mt-8 mb-3">
            {block.text}
          </h2>
        );
      }
      return (
        <h3 key={index} className="text-lg font-medium text-foreground mt-6 mb-2">
          {block.text}
        </h3>
      );

    case 'list': {
      const Tag = block.ordered ? 'ol' : 'ul';
      return (
        <Tag
          key={index}
          className={`space-y-2 pl-5 ${block.ordered ? 'list-decimal' : 'list-disc'} text-sm text-muted-foreground`}
        >
          {block.items.map((item, i) => (
            <li key={i} className="leading-relaxed">
              {item}
            </li>
          ))}
        </Tag>
      );
    }

    case 'callout': {
      const style = CALLOUT_STYLES[block.variant];
      const Icon = style.icon;
      return (
        <div key={index} className={`flex gap-3 rounded-lg p-4 ${style.bg}`}>
          <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${style.iconColor}`} strokeWidth={1.5} />
          <p className="text-sm text-muted-foreground leading-relaxed">
            {block.text}
          </p>
        </div>
      );
    }

    case 'table':
      return (
        <div key={index} className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted">
                {block.headers.map((h, i) => (
                  <th key={i} className="px-4 py-3 text-left text-sm font-medium text-foreground whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, ri) => (
                <tr key={ri} className="border-t border-border">
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-4 py-3 text-sm text-muted-foreground">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case 'divider':
      return <hr key={index} className="border-border my-6" />;

    case 'glossary':
      return (
        <div key={index} className="space-y-1">
          {block.terms.map((term, i) => (
            <div
              key={i}
              className="grid grid-cols-[1fr_1fr_2fr] gap-3 py-3 px-4 rounded-lg even:bg-muted/50 text-sm"
            >
              <span className="text-sm font-medium text-foreground">{term.bn}</span>
              <span className="text-primary">{term.en}</span>
              <span className="text-sm text-muted-foreground">{term.meaning}</span>
            </div>
          ))}
        </div>
      );

    default:
      return null;
  }
}

interface ContentRendererProps {
  blocks: ContentBlock[];
}

export function ContentRenderer({ blocks }: ContentRendererProps) {
  return (
    <div className="space-y-4">
      {blocks.map((block, index) => renderBlock(block, index))}
    </div>
  );
}
