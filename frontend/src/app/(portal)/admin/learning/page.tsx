'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, BookOpen, Clock, ExternalLink, Plus, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuthStore } from '@/stores/auth';
import {
  LEARNING_ARTICLES,
  CATEGORY_META,
  type LearningCategory,
} from '@/data/learning-content';

export default function AdminLearningPage() {
  const { user } = useAuthStore();
  const { t } = useTranslation(['admin', 'common']);
  const [filterCategory, setFilterCategory] = useState<LearningCategory | 'all'>('all');

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  if (!isAdmin) {
    return (
      <div className="px-6 py-8">
        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-8 text-center space-y-2">
            <p className="text-foreground font-medium">{t('admin:learning.accessDenied')}</p>
            <p className="text-sm text-muted-foreground">
              {t('admin:learning.adminOnly')}
            </p>
            <Button asChild variant="outline" className="mt-3 border-border text-foreground hover:bg-muted">
              <Link href="/dashboard">{t('admin:learning.backToDashboard')}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredArticles = filterCategory === 'all'
    ? LEARNING_ARTICLES
    : LEARNING_ARTICLES.filter((a) => a.category === filterCategory);

  const categoryCounts = Object.fromEntries(
    (Object.keys(CATEGORY_META) as LearningCategory[]).map((cat) => [
      cat,
      LEARNING_ARTICLES.filter((a) => a.category === cat).length,
    ])
  );

  return (
    <div className="px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('admin:learning.adminDashboard')}
          </Link>
          <div className="flex items-center gap-3">
            <div className="bg-wisebox-status-warning/10 rounded-lg p-2.5">
              <Settings className="h-5 w-5 text-wisebox-status-warning" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{t('admin:learning.manageContent')}</h1>
              <p className="text-muted-foreground text-sm">
                {LEARNING_ARTICLES.length} articles across {Object.keys(CATEGORY_META).length} categories
              </p>
            </div>
          </div>
        </div>
        <Button disabled className="bg-muted text-muted-foreground cursor-not-allowed border-border">
          <Plus className="h-4 w-4 mr-2" />
          {t('admin:learning.addArticle')}
        </Button>
      </div>

      {/* Category Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {(Object.keys(CATEGORY_META) as LearningCategory[]).map((cat) => {
          const meta = CATEGORY_META[cat];
          return (
            <button
              key={cat}
              onClick={() => setFilterCategory(filterCategory === cat ? 'all' : cat)}
              className={`rounded-xl p-3 text-left transition-all border ${
                filterCategory === cat
                  ? 'border-wisebox-status-warning bg-wisebox-status-warning/10 shadow-sm'
                  : 'border-border bg-card hover:border-border hover:shadow-sm'
              }`}
            >
              <p className="text-xs text-muted-foreground">{meta.label}</p>
              <p className="text-lg font-bold text-foreground mt-0.5">{categoryCounts[cat]}</p>
            </button>
          );
        })}
      </div>

      {/* Info Banner */}
      <Card className="border-wisebox-status-info/20 bg-wisebox-status-info/10 shadow-sm">
        <CardContent className="p-4 flex items-start gap-3">
          <BookOpen className="h-5 w-5 text-wisebox-status-info mt-0.5 shrink-0" />
          <div className="space-y-1">
            <p className="text-sm text-wisebox-status-info font-medium">
              {t('admin:learning.staticContentMode')}
            </p>
            <p className="text-xs text-wisebox-status-info">
              {t('admin:learning.staticContentDescription')}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Articles Table */}
      <div className="rounded-xl border border-border overflow-hidden bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted border-b border-border">
              <th className="px-4 py-3 text-left font-medium text-foreground">{t('admin:learning.colTitle')}</th>
              <th className="px-4 py-3 text-left font-medium text-foreground">{t('admin:learning.colCategory')}</th>
              <th className="px-4 py-3 text-left font-medium text-foreground">{t('admin:learning.colReadTime')}</th>
              <th className="px-4 py-3 text-left font-medium text-foreground">{t('admin:learning.colContentBlocks')}</th>
              <th className="px-4 py-3 text-right font-medium text-foreground">{t('admin:learning.colActions')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredArticles.map((article) => {
              const catMeta = CATEGORY_META[article.category];
              return (
                <tr key={article.slug} className="border-t border-border hover:bg-muted/50">
                  <td className="px-4 py-3">
                    <p className="text-foreground font-medium">{article.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{article.description}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r ${catMeta.color} text-white`}>
                      {catMeta.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      {article.readTime} {t('admin:learning.min')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {article.content.length} {t('admin:learning.blocks')}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/learning/${article.slug}`}
                      className="inline-flex items-center gap-1 text-xs text-wisebox-status-info hover:text-wisebox-status-info transition-colors"
                    >
                      {t('admin:learning.view')}
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
