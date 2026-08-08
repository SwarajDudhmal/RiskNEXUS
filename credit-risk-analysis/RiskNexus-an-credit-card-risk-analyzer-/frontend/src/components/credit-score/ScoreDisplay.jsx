import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';

const getScoreColor = (score) => {
  if (score >= 800) return 'text-green-400';
  if (score >= 740) return 'text-green-500';
  if (score >= 670) return 'text-yellow-400';
  if (score >= 580) return 'text-orange-400';
  return 'text-red-500';
};

export default function ScoreDisplay({ score, summary }) {
  const scorePercentage = ((score - 300) / (850 - 300)) * 100;

  return (
    <Card className="shadow-lg w-full max-w-md mx-auto mt-8 bg-white dark:bg-gray-800">
      <CardHeader>
        <CardTitle className="font-headline text-xl text-center">Your Simulated Score</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center text-center">
        <div className="relative h-40 w-40">
          <svg className="h-full w-full" viewBox="0 0 36 36">
            <path
              className="text-gray-200"
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
            <span className="text-sm text-gray-500">out of 850</span>
          </div>
        </div>

        <div className="mt-6 w-full text-left">
          <h4 className="font-semibold mb-2">Score Factors Summary</h4>
          <p className="text-sm text-gray-600 leading-relaxed">
            {summary}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
