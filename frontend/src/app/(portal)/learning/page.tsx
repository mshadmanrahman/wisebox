'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import {
  ArrowRight,
  BookOpen,
  Clock,
  Shield,
  Map,
  FileText,
  ScrollText,
  MapPin,
  ClipboardCheck,
  ArrowRightLeft,
  Sparkles,
  Languages,
  Search,
} from 'lucide-react';
import {
  LEARNING_ARTICLES,
  CATEGORY_META,
  type LearningCategory,
} from '@/data/learning-content';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Shield,
  Map,
  FileText,
  ScrollText,
  MapPin,
  ClipboardCheck,
  ArrowRightLeft,
  Sparkles,
  Languages,
  BookOpen,
};

const ALL_CATEGORIES = Object.keys(CATEGORY_META) as LearningCategory[];

export default function LearningPage() {
  const { t } = useTranslation('common');
  const [activeCategory, setActiveCategory] = useState<LearningCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredArticles = LEARNING_ARTICLES.filter((article) => {
    const matchesCategory = activeCategory === 'all' || article.category === activeCategory;
    const matchesSearch =
      searchQuery === '' ||
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="px-6 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t('learning.title')}</h1>
        <p className="text-sm text-muted-foreground">
          {t('learning.subtitle')}
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
        <input
          type="text"
          placeholder={t('learning.searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 h-10 rounded-lg bg-card border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
        />
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveCategory('all')}
          className={`text-sm px-3 py-1.5 rounded-full font-medium transition-all duration-200 ${
            activeCategory === 'all'
              ? 'bg-primary text-primary-foreground border border-primary'
              : 'border border-border text-muted-foreground hover:text-foreground hover:border-border/80'
          }`}
        >
          {t('learning.all')} ({LEARNING_ARTICLES.length})
        </button>
        {ALL_CATEGORIES.map((cat) => {
          const meta = CATEGORY_META[cat];
          const count = LEARNING_ARTICLES.filter((a) => a.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-sm px-3 py-1.5 rounded-full font-medium transition-all duration-200 ${
                activeCategory === cat
                  ? 'bg-primary text-primary-foreground border border-primary'
                  : 'border border-border text-muted-foreground hover:text-foreground hover:border-border/80'
              }`}
            >
              {meta.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Article Grid */}
      {filteredArticles.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-8 shadow-sm dark:shadow-none text-center">
          <p className="text-sm text-muted-foreground">
            {searchQuery ? t('learning.noArticlesFor', { query: searchQuery }) : t('learning.noArticles')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredArticles.map((article) => {
            const catMeta = CATEGORY_META[article.category];
            const IconComponent = ICON_MAP[article.icon] || BookOpen;
            return (
              <Link
                key={article.slug}
                href={`/learning/${article.slug}`}
                className="block group"
              >
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm dark:shadow-none hover:border-border/80 dark:hover:border-white/12 transition-all duration-200 h-full">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        {catMeta.label}
                      </span>
                      <IconComponent className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <h3 className="text-base font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                      {article.description}
                    </p>
                    <div className="flex items-center justify-between pt-1">
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="w-4 h-4" strokeWidth={1.5} />
                        {t('learning.minRead', { minutes: article.readTime })}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        {t('learning.readArticle')}
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* CTA Banner */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm dark:shadow-none">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-base font-medium text-foreground">
              {t('learning.notSureWhereToStart')}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t('learning.takeAssessment')}
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/assessment/start"
              className="bg-primary text-primary-foreground rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-primary/90 transition-all duration-200 inline-flex items-center h-10"
            >
              {t('learning.takeFreeAssessment')}
            </Link>
            <Link
              href="/workspace/services"
              className="bg-transparent border border-border text-foreground rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-muted transition-all duration-200 inline-flex items-center h-10"
            >
              {t('learning.browseServices')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
