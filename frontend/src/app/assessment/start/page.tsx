'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ChevronLeft } from 'lucide-react';
import type { ApiResponse, AssessmentQuestion, RecommendedService } from '@/types';

interface AssessmentResult {
  score: number;
  status: 'red' | 'yellow' | 'green';
  summary: string;
  gaps: string[];
  recommended_services: RecommendedService[];
}

function statusClasses(status: 'red' | 'yellow' | 'green'): string {
  if (status === 'green') return 'bg-green-500/20 text-green-400 border-green-500/30';
  if (status === 'yellow') return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
  return 'bg-red-500/20 text-red-400 border-red-500/30';
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
      <div className="min-h-screen bg-wisebox-background px-4 py-10">
        <div className="max-w-3xl mx-auto space-y-6">
          <Card className="bg-wisebox-background-card border-wisebox-border">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Your Free Property Readiness Score</CardTitle>
              <CardDescription className="text-wisebox-text-secondary">Instant assessment based on your answers.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className={`rounded-lg border px-4 py-3 inline-flex items-center gap-2 ${statusClasses(result.status)}`}>
                <span className="text-lg font-bold">{result.score}/100</span>
                <span className="capitalize">{result.status}</span>
              </div>

              <p className="text-sm text-wisebox-text-secondary">{result.summary}</p>

              <div className="space-y-2">
                <h3 className="font-semibold text-white">Detected gaps</h3>
                {result.gaps.length === 0 ? (
                  <p className="text-sm text-wisebox-text-secondary">No major gaps from your current answers.</p>
                ) : (
                  <ul className="list-disc pl-5 text-sm text-wisebox-text-secondary space-y-1">
                    {result.gaps.slice(0, 8).map((gap) => (
                      <li key={gap}>{gap}</li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-white">Recommended services</h3>
                <div className="grid gap-2 sm:grid-cols-2">
                  {result.recommended_services.map((service: RecommendedService) => (
                    <div key={service.id} className="rounded-lg border border-wisebox-border p-3 bg-wisebox-background-lighter">
                      <p className="font-medium text-sm text-white">{service.name}</p>
                      <p className="text-xs text-wisebox-text-secondary mt-1">Starting at ${service.price.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <Button asChild className="bg-white hover:bg-gray-100 text-wisebox-background font-semibold">
                  <Link href="/register">Create account to protect your property</Link>
                </Button>
                <Button asChild variant="outline" className="border-wisebox-border text-white hover:bg-wisebox-background-lighter">
                  <Link href="/workspace/services">Talk to an expert</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ─── Assessment Flow ───────────────────────────────────────────
  return (
    <div className="min-h-screen bg-wisebox-background px-4 py-10">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold text-white">Free Property Assessment</h1>
          <p className="text-wisebox-text-secondary">
            Answer a few quick questions. No sign-up required. Takes under 3 minutes.
          </p>
        </div>

        {/* Progress Card with Encouraging Message */}
        <Card className="bg-wisebox-background-card border-wisebox-border">
          <CardContent className="pt-6 space-y-3">
            <div className="flex items-center justify-between text-sm text-wisebox-text-secondary">
              <span>
                {answeredCount} / {totalQuestions} answered
              </span>
              <span>{progress}% complete</span>
            </div>
            <div className="h-2 rounded-full bg-wisebox-background-lighter overflow-hidden">
              <div
                className="h-full bg-wisebox-primary transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            {/* Encouraging message */}
            {totalQuestions > 0 && (
              <p className="text-sm text-wisebox-primary/80 italic pt-1 transition-opacity duration-300">
                {encouragement}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Question Card */}
        {isLoadingQuestions || !currentQuestion ? (
          <Card className="bg-wisebox-background-card border-wisebox-border">
            <CardContent className="p-6 text-sm text-wisebox-text-secondary">
              {isLoadingQuestions ? 'Loading assessment questions...' : 'Questions are unavailable right now.'}
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-wisebox-background-card border-wisebox-border">
            <CardHeader>
              <CardTitle className="text-white text-lg">Question {currentIndex + 1}</CardTitle>
              <CardDescription className="text-wisebox-text-secondary text-base mt-1">
                {currentQuestion.question}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Yes / No buttons: clicking either auto-advances */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={isAdvancing}
                  onClick={() => handleAnswer(true)}
                  className={`flex items-center justify-center gap-2 rounded-lg border-2 py-5 text-lg font-semibold transition-all min-h-[72px] focus:outline-none focus:ring-2 focus:ring-wisebox-primary focus:ring-offset-2 focus:ring-offset-wisebox-background disabled:opacity-60 ${
                    answers[currentQuestion.id] === true
                      ? 'border-green-500 bg-green-500/15 text-green-400'
                      : 'border-wisebox-border bg-wisebox-background-card text-white hover:border-green-500/40 hover:bg-green-500/5'
                  }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  disabled={isAdvancing}
                  onClick={() => handleAnswer(false)}
                  className={`flex items-center justify-center gap-2 rounded-lg border-2 py-5 text-lg font-semibold transition-all min-h-[72px] focus:outline-none focus:ring-2 focus:ring-wisebox-border-light focus:ring-offset-2 focus:ring-offset-wisebox-background disabled:opacity-60 ${
                    answers[currentQuestion.id] === false
                      ? 'border-wisebox-border-light bg-wisebox-background-lighter text-wisebox-text-secondary'
                      : 'border-wisebox-border bg-wisebox-background-card text-white hover:border-wisebox-border-light hover:bg-wisebox-background-lighter'
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
                  className="text-wisebox-text-secondary hover:text-white hover:bg-wisebox-background-lighter"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                <span className="text-xs text-wisebox-text-muted">
                  {currentIndex + 1} of {totalQuestions}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Email + Submit (appears after all questions answered) */}
        {allAnswered && (
          <Card className="bg-wisebox-background-card border-wisebox-border">
            <CardHeader>
              <CardTitle className="text-white">Get your score</CardTitle>
              <CardDescription className="text-wisebox-text-secondary">
                Enter your email to receive your assessment result.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                className="bg-wisebox-background-input border-wisebox-border text-white placeholder:text-wisebox-text-muted"
              />
              <Button
                disabled={isSubmitting || email.trim() === ''}
                onClick={submitAssessment}
                className="bg-white hover:bg-gray-100 text-wisebox-background font-semibold"
              >
                {isSubmitting ? 'Calculating...' : 'See my assessment'}
              </Button>
              {submitError && <p className="text-sm text-red-400">{submitError}</p>}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
