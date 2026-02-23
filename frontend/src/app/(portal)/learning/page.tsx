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
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="bg-wisebox-primary/20 rounded-lg p-2.5">
            <BookOpen className="h-6 w-6 text-wisebox-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">{t('learning.title')}</h1>
            <p className="text-wisebox-text-secondary text-sm mt-1">
              {t('learning.subtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-wisebox-text-muted" />
        <input
          type="text"
          placeholder={t('learning.searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-wisebox-background-card border border-wisebox-border text-white text-sm placeholder:text-wisebox-text-muted focus:outline-none focus:border-wisebox-primary/50 transition-colors"
        />
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeCategory === 'all'
              ? 'bg-wisebox-primary text-white'
              : 'bg-wisebox-background-card border border-wisebox-border text-wisebox-text-secondary hover:text-white hover:border-wisebox-border-light'
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
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? 'bg-wisebox-primary text-white'
                  : 'bg-wisebox-background-card border border-wisebox-border text-wisebox-text-secondary hover:text-white hover:border-wisebox-border-light'
              }`}
            >
              {meta.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Article Grid */}
      {filteredArticles.length === 0 ? (
        <Card className="bg-wisebox-background-card border-wisebox-border">
          <CardContent className="p-8 text-center">
            <p className="text-wisebox-text-secondary">
              {searchQuery ? t('learning.noArticlesFor', { query: searchQuery }) : t('learning.noArticles')}
            </p>
          </CardContent>
        </Card>
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
                <Card className="bg-wisebox-background-card border-wisebox-border hover:border-wisebox-border-light transition-all hover:shadow-lg h-full overflow-hidden">
                  {/* Gradient Banner */}
                  <div className={`bg-gradient-to-r ${catMeta.color} p-5 relative`}>
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 text-white text-xs font-medium backdrop-blur-sm">
                        {catMeta.label}
                      </span>
                      <div className="bg-white/10 rounded-lg p-2 group-hover:bg-white/20 transition-colors">
                        <IconComponent className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  </div>
                  <CardContent className="p-5 space-y-3">
                    <h3 className="text-base font-semibold text-white group-hover:text-wisebox-primary transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-sm text-wisebox-text-secondary line-clamp-2 leading-relaxed">
                      {article.description}
                    </p>
                    <div className="flex items-center justify-between pt-1">
                      <span className="flex items-center gap-1.5 text-xs text-wisebox-text-muted">
                        <Clock className="h-3.5 w-3.5" />
                        {t('learning.minRead', { minutes: article.readTime })}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-wisebox-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        {t('learning.readArticle')}
                        <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      {/* CTA Banner */}
      <Card className="bg-gradient-to-r from-wisebox-primary/20 via-blue-900/20 to-cyan-900/20 border-wisebox-primary/30">
        <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-semibold text-white">
              {t('learning.notSureWhereToStart')}
            </h3>
            <p className="text-sm text-wisebox-text-secondary">
              {t('learning.takeAssessment')}
            </p>
          </div>
          <div className="flex gap-3">
            <Button asChild className="bg-white hover:bg-gray-100 text-wisebox-background font-semibold">
              <Link href="/assessment/start">{t('learning.takeFreeAssessment')}</Link>
            </Button>
            <Button asChild variant="outline" className="border-wisebox-border text-white hover:bg-wisebox-background-lighter">
              <Link href="/workspace/services">{t('learning.browseServices')}</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
