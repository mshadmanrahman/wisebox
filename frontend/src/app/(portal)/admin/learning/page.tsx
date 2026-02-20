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
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardContent className="p-8 text-center space-y-2">
            <p className="text-slate-900 font-medium">Access Denied</p>
            <p className="text-sm text-slate-500">
              Only admins can manage learning content.
            </p>
            <Button asChild variant="outline" className="mt-3 border-slate-200 text-slate-700 hover:bg-slate-50">
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
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Admin Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <div className="bg-amber-50 rounded-lg p-2.5">
              <Settings className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Manage Learning Content</h1>
              <p className="text-slate-500 text-sm">
                {LEARNING_ARTICLES.length} articles across {Object.keys(CATEGORY_META).length} categories
              </p>
            </div>
          </div>
        </div>
        <Button disabled className="bg-slate-100 text-slate-400 cursor-not-allowed border-slate-200">
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
                  ? 'border-amber-400 bg-amber-50 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
              }`}
            >
              <p className="text-xs text-slate-500">{meta.label}</p>
              <p className="text-lg font-bold text-slate-900 mt-0.5">{categoryCounts[cat]}</p>
            </button>
          );
        })}
      </div>

      {/* Info Banner */}
      <Card className="border-blue-200 bg-blue-50 shadow-sm">
        <CardContent className="p-4 flex items-start gap-3">
          <BookOpen className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
          <div className="space-y-1">
            <p className="text-sm text-blue-800 font-medium">
              Static Content Mode
            </p>
            <p className="text-xs text-blue-600">
              Articles are currently stored in the frontend codebase. To add new articles dynamically, a backend API endpoint needs to be created at <code className="bg-blue-100 px-1 rounded text-blue-800">POST /api/v1/admin/learning-articles</code>. Once available, this page will support full CRUD operations with a rich editor.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Articles Table */}
      <div className="rounded-xl border border-slate-200 overflow-hidden bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="px-4 py-3 text-left font-medium text-slate-700">Title</th>
              <th className="px-4 py-3 text-left font-medium text-slate-700">Category</th>
              <th className="px-4 py-3 text-left font-medium text-slate-700">Read Time</th>
              <th className="px-4 py-3 text-left font-medium text-slate-700">Content Blocks</th>
              <th className="px-4 py-3 text-right font-medium text-slate-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredArticles.map((article) => {
              const catMeta = CATEGORY_META[article.category];
              return (
                <tr key={article.slug} className="border-t border-slate-100 hover:bg-slate-50/50">
                  <td className="px-4 py-3">
                    <p className="text-slate-900 font-medium">{article.title}</p>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{article.description}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r ${catMeta.color} text-white`}>
                      {catMeta.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 text-slate-500">
                      <Clock className="h-3.5 w-3.5" />
                      {article.readTime} min
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {article.content.length} blocks
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/learning/${article.slug}`}
                      className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
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
