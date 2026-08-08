'use client';

import { useState, useEffect } from 'react';
import type { CreditScoreData } from '@/lib/types';
import InitialScoreForm from '@/components/app/initial-score-form';
import Dashboard from '@/components/app/dashboard';
import { Skeleton } from '@/components/ui/skeleton';

const LOCAL_STORAGE_KEY = 'credit-foresight-data';

export default function Home() {
  const [data, setData] = useState<CreditScoreData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(LOCAL_STORAGE_KEY);
      if (item) {
        setData(JSON.parse(item));
      }
    } catch (error) {
      console.error('Failed to parse data from localStorage', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDataUpdate = (newData: CreditScoreData) => {
    setData(newData);
    try {
      window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newData));
    } catch (error) {
      console.error('Failed to save data to localStorage', error);
    }
  };

  const handleReset = () => {
    setData(null);
    try {
      window.localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to remove data from localStorage', error);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background p-4">
        <div className="w-full max-w-2xl space-y-8">
          <Skeleton className="h-16 w-1/2" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-12 w-32" />
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      {data?.creditScore ? (
        <Dashboard data={data} onDataUpdate={handleDataUpdate} onReset={handleReset} />
      ) : (
        <InitialScoreForm onScoreGenerated={handleDataUpdate} />
      )}
    </main>
  );
}
