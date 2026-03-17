'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ChevronLeft } from 'lucide-react';
import { AssessmentHeader } from '@/components/assessment/assessment-header';
import type { ApiResponse, AssessmentQuestion, RecommendedService } from '@/types';

interface AssessmentResult {
  score: number;
  status: 'red' | 'yellow' | 'green';
  summary: string;
  gaps: string[];
  recommended_services: RecommendedService[];
}

function statusClasses(status: 'red' | 'yellow' | 'green'): string {
  if (status === 'green') return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
  if (status === 'yellow') return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
  return 'bg-destructive/10 text-destructive border-destructive/20';
}

// Encouraging, human messages that rotate with each question.
// Property stuff is intimidating; these keep people going.
const ENCOURAGEMENTS = [
  "No wrong answers here. Just honest ones. Let's see where you stand.",
  "Most property owners can't answer half of these. You're already ahead!",
  "Think of this like a health check-up... but for your land.",
  "Fun fact: 73% of property owners in Bangladesh have incomplete docs. You're not alone.",
  "Every 'No' just means there's something we can help with. That's literally why we exist.",
  "You're doing great. Even seasoned lawyers miss some of these.",
  "Halfway there! Your property is already feeling more secure.",
  "This is usually where people go 'Oh... I should probably look into that.'",
  "Pro tip: answering honestly now saves you from expensive surprises later.",
  "Almost there! Your future self is going to thank you for doing this.",
  "You now know more about your property status than most owners ever will.",
  "Home stretch! Just a few more to go.",
  "Last few questions! You're about to get the full picture.",
  "Nearly done. We promise the results are worth the 3 minutes.",
  "Final question! Your property readiness score is almost ready.",
];

export default function FreeAssessmentPage() {
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, boolean>>({});
  const [email, setEmail] = useState('');
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadQuestions = async () => {
      try {
        const response = await api.get<ApiResponse<AssessmentQuestion[]>>('/assessments/questions');
        if (mounted) {
          setQuestions(response.data.data);
        }
      } catch {
        if (mounted) {
          setQuestions([]);
        }
      } finally {
        if (mounted) {
          setIsLoadingQuestions(false);
        }
      }
    };

    loadQuestions();

    return () => {
      mounted = false;
    };
  }, []);

  const totalQuestions = questions.length;
  const answeredCount = useMemo(
    () => questions.filter((question) => Object.prototype.hasOwnProperty.call(answers, question.id)).length,
    [answers, questions]
  );

  const progress = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;
  const currentQuestion = questions[currentIndex] ?? null;
  const allAnswered = totalQuestions > 0 && answeredCount === totalQuestions;

  const encouragement = ENCOURAGEMENTS[currentIndex % ENCOURAGEMENTS.length];

  // Clicking Yes or No records the answer and auto-advances to the next question
  const handleAnswer = useCallback(
    (answer: boolean) => {
      if (!currentQuestion || isAdvancing) return;
      setAnswers((prev) => ({ ...prev, [currentQuestion.id]: answer }));

      // Auto-advance after brief visual feedback (unless it's the last question)
      if (currentIndex < totalQuestions - 1) {
        setIsAdvancing(true);
        setTimeout(() => {
          setCurrentIndex((prev) => prev + 1);
          setIsAdvancing(false);
        }, 400);
      }
    },
    [currentQuestion, currentIndex, totalQuestions, isAdvancing]
  );

  const submitAssessment = async () => {
    setIsSubmitting(true);
    setSubmitError('');

    try {
      const payload = {
        email,
        answers: questions.map((question) => ({
          question_id: question.id,
          answer: Boolean(answers[question.id]),
        })),
      };

      const response = await api.post<ApiResponse<AssessmentResult>>('/assessments/free', payload);
      setResult(response.data.data);
    } catch {
      setSubmitError('Could not process the assessment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Results Screen ────────────────────────────────────────────
  if (result) {
    return (
      <div className="min-h-screen bg-background">
        <AssessmentHeader progress={100} />
        <div className="max-w-xl mx-auto space-y-6 px-6 py-8">
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm dark:shadow-none">
            <div className="space-y-1 mb-6">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground">Your Free Property Readiness Score</h2>
              <p className="text-sm text-muted-foreground">Instant assessment based on your answers.</p>
            </div>
            <div className="space-y-5">
              <div className={`rounded-full border px-4 py-1.5 inline-flex items-center gap-2 text-xs font-medium ${statusClasses(result.status)}`}>
                <span className="text-sm font-semibold">{result.score}/100</span>
                <span className="capitalize">{result.status}</span>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed">{result.summary}</p>

              <div className="space-y-2">
                <h3 className="text-base font-medium text-foreground">Detected gaps</h3>
                {result.gaps.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No major gaps from your current answers.</p>
                ) : (
                  <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                    {result.gaps.slice(0, 8).map((gap) => (
                      <li key={gap}>{gap}</li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="space-y-2">
                <h3 className="text-base font-medium text-foreground">Recommended services</h3>
                <div className="grid gap-2 sm:grid-cols-2">
                  {result.recommended_services.map((service: RecommendedService) => (
                    <div key={service.id} className="bg-card border border-border rounded-xl p-3">
                      <p className="text-sm font-medium text-foreground">{service.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">Starting at ${service.price.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <Button asChild className="bg-primary text-primary-foreground rounded-lg font-medium transition-all duration-200">
                  <Link href="/register">Create account to protect your property</Link>
                </Button>
                <Button asChild variant="outline" className="border border-border text-foreground hover:bg-muted rounded-lg transition-all duration-200">
                  <Link href="/workspace/services">Talk to an expert</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Assessment Flow ───────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      <AssessmentHeader progress={progress} />
      <div className="max-w-xl mx-auto space-y-6 px-6 py-8">
        {/* Page Header */}
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Free Property Assessment</h1>
          <p className="text-base text-muted-foreground">
            Answer a few quick questions. No sign-up required. Takes under 3 minutes.
          </p>
        </div>

        {/* Progress Card with Encouraging Message */}
        <div className="bg-card border border-border rounded-xl p-5 max-w-2xl mx-auto shadow-sm dark:shadow-none">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                {answeredCount} / {totalQuestions} answered
              </span>
              <span>{progress}% complete</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500 ease-out rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
            {/* Encouraging message */}
            {totalQuestions > 0 && (
              <p className="text-sm text-muted-foreground italic pt-1 transition-opacity duration-300">
                {encouragement}
              </p>
            )}
          </div>
        </div>

        {/* Question Card */}
        {isLoadingQuestions || !currentQuestion ? (
          <div className="bg-card border border-border rounded-xl p-6 max-w-2xl mx-auto shadow-sm dark:shadow-none">
            <p className="text-sm text-muted-foreground">
              {isLoadingQuestions ? 'Loading assessment questions...' : 'Questions are unavailable right now.'}
            </p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl p-6 max-w-2xl mx-auto shadow-sm dark:shadow-none">
            <div className="space-y-1 mb-4">
              <h3 className="text-base font-medium text-foreground">Question {currentIndex + 1}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mt-1">
                {currentQuestion.question}
              </p>
            </div>
            <div className="space-y-4">
              {/* Yes / No buttons: clicking either auto-advances */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={isAdvancing}
                  onClick={() => handleAnswer(true)}
                  className={`flex items-center justify-center gap-2 h-12 rounded-lg border transition-all duration-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-60 ${
                    answers[currentQuestion.id] === true
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border bg-card text-foreground hover:bg-muted'
                  }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  disabled={isAdvancing}
                  onClick={() => handleAnswer(false)}
                  className={`flex items-center justify-center gap-2 h-12 rounded-lg border transition-all duration-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-60 ${
                    answers[currentQuestion.id] === false
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border bg-card text-foreground hover:bg-muted'
                  }`}
                >
                  No
                </button>
              </div>

              {/* Navigation: just a Previous button; Next is handled by auto-advance */}
              <div className="flex items-center justify-between pt-2">
                <Button
                  variant="ghost"
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex((value) => Math.max(0, value - 1))}
                  className="border border-border text-foreground hover:bg-muted rounded-lg transition-all duration-200"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" strokeWidth={1.5} />
                  Previous
                </Button>
                <span className="text-xs text-muted-foreground">
                  {currentIndex + 1} of {totalQuestions}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Email + Submit (appears after all questions answered) */}
        {allAnswered && (
          <div className="bg-card border border-border rounded-xl p-6 max-w-2xl mx-auto shadow-sm dark:shadow-none">
            <div className="space-y-1 mb-4">
              <h3 className="text-base font-medium text-foreground">Get your score</h3>
              <p className="text-sm text-muted-foreground">
                Enter your email to receive your assessment result.
              </p>
            </div>
            <div className="space-y-3">
              <Input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="bg-background border-border text-foreground placeholder:text-muted-foreground"
              />
              <Button
                disabled={isSubmitting || email.trim() === ''}
                onClick={submitAssessment}
                className="bg-primary text-primary-foreground rounded-lg font-medium transition-all duration-200"
              >
                {isSubmitting ? 'Calculating...' : 'See my assessment'}
              </Button>
              {submitError && <p className="text-sm text-destructive">{submitError}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
