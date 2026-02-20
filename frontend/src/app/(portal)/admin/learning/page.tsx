'use client';

import { useState } from 'react';
import Link from 'next/link';
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
  const [filterCategory, setFilterCategory] = useState<LearningCategory | 'all'>('all');

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  if (!isAdmin) {
    return (
      <div className="px-6 py-8">
        <Card className="bg-wisebox-background-card border-wisebox-border">
          <CardContent className="p-8 text-center space-y-2">
            <p className="text-white font-medium">Access Denied</p>
            <p className="text-sm text-wisebox-text-secondary">
              Only admins can manage learning content.
            </p>
            <Button asChild variant="outline" className="mt-3 border-wisebox-border text-white hover:bg-wisebox-background-lighter">
              <Link href="/dashboard">Back to Dashboard</Link>
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
            className="inline-flex items-center gap-1.5 text-sm text-wisebox-text-secondary hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Admin Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <div className="bg-wisebox-primary/20 rounded-lg p-2.5">
              <Settings className="h-5 w-5 text-wisebox-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Manage Learning Content</h1>
              <p className="text-wisebox-text-secondary text-sm">
                {LEARNING_ARTICLES.length} articles across {Object.keys(CATEGORY_META).length} categories
              </p>
            </div>
          </div>
        </div>
        <Button disabled className="bg-wisebox-primary/50 text-white/50 cursor-not-allowed">
          <Plus className="h-4 w-4 mr-2" />
          Add Article (Coming Soon)
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
                  ? 'border-wisebox-primary bg-wisebox-primary/10'
                  : 'border-wisebox-border bg-wisebox-background-card hover:border-wisebox-border-light'
              }`}
            >
              <p className="text-xs text-wisebox-text-muted">{meta.label}</p>
              <p className="text-lg font-bold text-white mt-0.5">{categoryCounts[cat]}</p>
            </button>
          );
        })}
      </div>

      {/* Info Banner */}
      <Card className="border-blue-500/20 bg-blue-500/5">
        <CardContent className="p-4 flex items-start gap-3">
          <BookOpen className="h-5 w-5 text-blue-400 mt-0.5 shrink-0" />
          <div className="space-y-1">
            <p className="text-sm text-blue-300 font-medium">
              Static Content Mode
            </p>
            <p className="text-xs text-blue-400/80">
              Articles are currently stored in the frontend codebase. To add new articles dynamically, a backend API endpoint needs to be created at <code className="bg-blue-500/10 px-1 rounded">POST /api/v1/admin/learning-articles</code>. Once available, this page will support full CRUD operations with a rich editor.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Articles Table */}
      <div className="rounded-xl border border-wisebox-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-wisebox-background-lighter">
              <th className="px-4 py-3 text-left font-medium text-white">Title</th>
              <th className="px-4 py-3 text-left font-medium text-white">Category</th>
              <th className="px-4 py-3 text-left font-medium text-white">Read Time</th>
              <th className="px-4 py-3 text-left font-medium text-white">Content Blocks</th>
              <th className="px-4 py-3 text-right font-medium text-white">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredArticles.map((article) => {
              const catMeta = CATEGORY_META[article.category];
              return (
                <tr key={article.slug} className="border-t border-wisebox-border hover:bg-wisebox-background-lighter/50">
                  <td className="px-4 py-3">
                    <p className="text-white font-medium">{article.title}</p>
                    <p className="text-xs text-wisebox-text-muted mt-0.5 line-clamp-1">{article.description}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r ${catMeta.color} text-white`}>
                      {catMeta.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 text-wisebox-text-secondary">
                      <Clock className="h-3.5 w-3.5" />
                      {article.readTime} min
                    </span>
                  </td>
                  <td className="px-4 py-3 text-wisebox-text-secondary">
                    {article.content.length} blocks
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/learning/${article.slug}`}
                      className="inline-flex items-center gap-1 text-xs text-wisebox-primary hover:text-wisebox-primary/80 transition-colors"
                    >
                      View
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
