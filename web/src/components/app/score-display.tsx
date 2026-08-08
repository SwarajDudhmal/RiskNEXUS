'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

type ScoreDisplayProps = {
  score: number;
  summary: string;
};

const getScoreColor = (score: number) => {
  if (score >= 800) return 'text-green-400';
  if (score >= 740) return 'text-green-500';
  if (score >= 670) return 'text-yellow-400';
  if (score >= 580) return 'text-orange-400';
  return 'text-red-500';
};

export default function ScoreDisplay({ score, summary }: ScoreDisplayProps) {
  const scorePercentage = ((score - 300) / (850 - 300)) * 100;

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-xl">Your Simulated Score</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center text-center">
        <div className="relative h-40 w-40">
          <svg className="h-full w-full" viewBox="0 0 36 36">
            <path
              className="text-muted"
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            />
            <path
              className={getScoreColor(score)}
              stroke="currentColor"
              strokeWidth="3"
              strokeDasharray={`${scorePercentage}, 100`}
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              strokeLinecap="round"
              transform="rotate(-90 18 18)"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-5xl font-bold font-headline ${getScoreColor(score)}`}>
              {Math.round(score)}
            </span>
            <span className="text-sm text-muted-foreground">out of 850</span>
          </div>
        </div>

        <div className="mt-6 w-full text-left">
          <h4 className="font-semibold mb-2">Score Factors Summary</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {summary}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
