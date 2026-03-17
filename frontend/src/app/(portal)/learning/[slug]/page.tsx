'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, BookOpen, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ContentRenderer } from '@/components/learning/content-renderer';
import {
  LEARNING_ARTICLES,
  CATEGORY_META,
} from '@/data/learning-content';

export default function LearningArticlePage() {
  const { t } = useTranslation('common');
  const { slug } = useParams<{ slug: string }>();

  const article = LEARNING_ARTICLES.find((a) => a.slug === slug);

  if (!article) {
    return (
      <div className="px-6 py-8 space-y-4">
        <Link
          href="/learning"
          className="inline-flex items-center gap-1.5 text-sm text-wisebox-text-secondary hover:text-wisebox-text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('learning.backToLearning')}
        </Link>
        <Card className="bg-wisebox-background-card border-wisebox-border">
          <CardContent className="p-8 text-center space-y-3">
            <BookOpen className="h-10 w-10 text-wisebox-text-muted mx-auto" />
            <p className="text-wisebox-text-primary font-medium">{t('learning.articleNotFound')}</p>
            <p className="text-sm text-wisebox-text-secondary">
              {t('learning.articleNotFoundDescription')}
            </p>
            <Button asChild variant="outline" className="border-wisebox-border text-wisebox-text-primary hover:bg-wisebox-background-lighter mt-2">
              <Link href="/learning">{t('learning.browseAllArticles')}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const catMeta = CATEGORY_META[article.category];

  // Find related articles in the same category (excluding current)
  const relatedArticles = LEARNING_ARTICLES.filter(
    (a) => a.category === article.category && a.slug !== article.slug
  ).slice(0, 3);

  return (
    <div className="px-6 py-8 space-y-6 max-w-4xl mx-auto">
      {/* Back Link */}
      <Link
        href="/learning"
        className="inline-flex items-center gap-1.5 text-sm text-wisebox-text-secondary hover:text-wisebox-text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        {t('learning.backToLearning')}
      </Link>

      {/* Article Header */}
      <div className={`bg-gradient-to-r ${catMeta.color} rounded-2xl p-6 sm:p-8 space-y-4`}>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-medium backdrop-blur-sm">
          {catMeta.label}
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
          {article.title}
        </h1>
        <p className="text-white/80 text-sm leading-relaxed max-w-2xl">
          {article.description}
        </p>
        <div className="flex items-center gap-1.5 text-white/60 text-xs">
          <Clock className="h-3.5 w-3.5" />
          {t('learning.minRead', { minutes: article.readTime })}
        </div>
      </div>

      {/* Article Content */}
      <Card className="bg-wisebox-background-card border-wisebox-border">
        <CardContent className="p-6 sm:p-8">
          <ContentRenderer blocks={article.content} />
        </CardContent>
      </Card>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-wisebox-text-primary">
            {t('learning.moreIn', { category: catMeta.label })}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {relatedArticles.map((related) => (
              <Link
                key={related.slug}
                href={`/learning/${related.slug}`}
                className="block group"
              >
                <Card className="bg-wisebox-background-card border-wisebox-border hover:border-wisebox-border-light transition-all h-full">
                  <CardContent className="p-4 space-y-2">
                    <h3 className="text-sm font-medium text-wisebox-text-primary group-hover:text-wisebox-primary transition-colors line-clamp-2">
                      {related.title}
                    </h3>
                    <span className="flex items-center gap-1 text-xs text-wisebox-text-muted">
                      <Clock className="h-3 w-3" />
                      {t('learning.min', { count: related.readTime })}
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <Card className="bg-gradient-to-r from-wisebox-primary/20 via-wisebox-primary/10 to-wisebox-primary/5 border-wisebox-primary/30">
        <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-semibold text-wisebox-text-primary">{t('learning.needHelp')}</h3>
            <p className="text-sm text-wisebox-text-secondary">
              {t('learning.needHelpDescription')}
            </p>
          </div>
          <Button asChild className="bg-white hover:bg-white/90 text-wisebox-background font-semibold shrink-0">
            <Link href="/workspace/services">{t('learning.bookFreeConsultation')}</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
