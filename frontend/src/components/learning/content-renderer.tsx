'use client';

import { AlertCircle, Info, Lightbulb } from 'lucide-react';
import type { ContentBlock } from '@/data/learning-content';

const CALLOUT_STYLES = {
  info: {
    bg: 'bg-wisebox-primary/10 border-wisebox-primary/30',
    icon: Info,
    iconColor: 'text-wisebox-primary',
  },
  warning: {
    bg: 'bg-wisebox-status-warning/10 border-wisebox-status-warning/30',
    icon: AlertCircle,
    iconColor: 'text-wisebox-status-warning',
  },
  tip: {
    bg: 'bg-wisebox-status-success/10 border-wisebox-status-success/30',
    icon: Lightbulb,
    iconColor: 'text-wisebox-status-success',
  },
};

function renderBlock(block: ContentBlock, index: number) {
  switch (block.type) {
    case 'paragraph':
      return (
        <p key={index} className="text-wisebox-text-secondary leading-relaxed text-[15px]">
          {block.text}
        </p>
      );

    case 'heading':
      if (block.level === 2) {
        return (
          <h2 key={index} className="text-xl font-semibold text-wisebox-text-primary mt-8 mb-3">
            {block.text}
          </h2>
        );
      }
      return (
        <h3 key={index} className="text-lg font-medium text-wisebox-text-primary mt-6 mb-2">
          {block.text}
        </h3>
      );

    case 'list': {
      const Tag = block.ordered ? 'ol' : 'ul';
      return (
        <Tag
          key={index}
          className={`space-y-2 pl-5 ${block.ordered ? 'list-decimal' : 'list-disc'} text-wisebox-text-secondary text-[15px]`}
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
        <div key={index} className={`flex gap-3 p-4 rounded-xl border ${style.bg}`}>
          <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${style.iconColor}`} />
          <p className="text-sm text-wisebox-text-secondary leading-relaxed">
            {block.text}
          </p>
        </div>
      );
    }

    case 'table':
      return (
        <div key={index} className="overflow-x-auto rounded-xl border border-wisebox-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-wisebox-background-lighter">
                {block.headers.map((h, i) => (
                  <th key={i} className="px-4 py-3 text-left font-medium text-wisebox-text-primary whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, ri) => (
                <tr key={ri} className="border-t border-wisebox-border">
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-4 py-3 text-wisebox-text-secondary">
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
      return <hr key={index} className="border-wisebox-border my-6" />;

    case 'glossary':
      return (
        <div key={index} className="space-y-1">
          {block.terms.map((term, i) => (
            <div
              key={i}
              className="grid grid-cols-[1fr_1fr_2fr] gap-3 py-3 px-4 rounded-lg even:bg-wisebox-background-lighter/50 text-sm"
            >
              <span className="text-wisebox-text-primary font-medium">{term.bn}</span>
              <span className="text-wisebox-primary">{term.en}</span>
              <span className="text-wisebox-text-secondary">{term.meaning}</span>
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
