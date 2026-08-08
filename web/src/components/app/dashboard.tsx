'use client';

import { useState } from 'react';
import Header from './header';
import ScoreDisplay from './score-display';
import ActionCard from './action-card';
import PersonalizedRecommendations from './personalized-recommendations';
import { Button } from '@/components/ui/button';
import { ACTION_CARDS_CONFIG } from '@/lib/constants';
import type { CreditScoreData } from '@/lib/types';

type DashboardProps = {
  data: CreditScoreData;
  onDataUpdate: (data: CreditScoreData) => void;
  onReset: () => void;
};

export default function Dashboard({ data, onDataUpdate, onReset }: DashboardProps) {
  const [currentScore, setCurrentScore] = useState(data.creditScore);

  const handleScoreUpdate = (scoreDelta: number) => {
    const newScore = Math.max(300, Math.min(850, currentScore + scoreDelta));
    setCurrentScore(newScore);
    onDataUpdate({ ...data, creditScore: newScore });
  };
  
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container mx-auto pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-8">
            <ScoreDisplay score={currentScore} summary={data.summary} />
            <PersonalizedRecommendations data={data} />
            <div className="p-4 rounded-lg bg-card border">
              <h3 className="font-semibold mb-2">Start Over</h3>
              <p className="text-sm text-muted-foreground mb-4">Reset the simulation and start with a new financial profile.</p>
              <Button variant="destructive" onClick={onReset} className="w-full">
                Reset Simulation
              </Button>
            </div>
          </div>
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold font-headline mb-6">Financial Actions Simulator</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {ACTION_CARDS_CONFIG.map((config) => (
                <ActionCard
                  key={config.type}
                  config={config}
                  currentScore={currentScore}
                  onScoreUpdate={handleScoreUpdate}
                />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
