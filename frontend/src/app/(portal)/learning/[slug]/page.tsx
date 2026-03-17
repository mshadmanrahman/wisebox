'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, BookOpen, Clock } from 'lucide-react';
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
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
          {t('learning.backToLearning')}
        </Link>
        <div className="bg-card border border-border rounded-xl p-8 shadow-sm dark:shadow-none text-center space-y-3">
          <BookOpen className="w-5 h-5 text-muted-foreground mx-auto" strokeWidth={1.5} />
          <p className="text-base font-medium text-foreground">{t('learning.articleNotFound')}</p>
          <p className="text-sm text-muted-foreground">
            {t('learning.articleNotFoundDescription')}
          </p>
          <Link
            href="/learning"
            className="inline-flex items-center bg-transparent border border-border text-foreground rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-muted transition-all duration-200 h-10 mt-2"
          >
            {t('learning.browseAllArticles')}
          </Link>
        </div>
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
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
        {t('learning.backToLearning')}
      </Link>

      {/* Article Header */}
      <div className="space-y-4">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
          {catMeta.label}
        </span>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground leading-tight">
          {article.title}
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
          {article.description}
        </p>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="w-4 h-4" strokeWidth={1.5} />
          {t('learning.minRead', { minutes: article.readTime })}
        </div>
      </div>

      {/* Article Content */}
      <div className="bg-card border border-border rounded-xl p-8 shadow-sm dark:shadow-none">
        <ContentRenderer blocks={article.content} />
      </div>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-base font-medium text-foreground">
            {t('learning.moreIn', { category: catMeta.label })}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {relatedArticles.map((related) => (
              <Link
                key={related.slug}
                href={`/learning/${related.slug}`}
                className="block group"
              >
                <div className="bg-card border border-border rounded-xl p-4 shadow-sm dark:shadow-none hover:border-border/80 dark:hover:border-white/12 transition-all duration-200 h-full space-y-2">
                  <h3 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
                    {related.title}
                  </h3>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-4 h-4" strokeWidth={1.5} />
                    {t('learning.min', { count: related.readTime })}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="bg-card border border-border rounded-xl p-6 shadow-sm dark:shadow-none">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-base font-medium text-foreground">{t('learning.needHelp')}</h3>
            <p className="text-sm text-muted-foreground">
              {t('learning.needHelpDescription')}
            </p>
          </div>
          <Link
            href="/workspace/services"
            className="bg-primary text-primary-foreground rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-primary/90 transition-all duration-200 inline-flex items-center h-10 shrink-0"
          >
            {t('learning.bookFreeConsultation')}
          </Link>
        </div>
      </div>
    </div>
  );
}
