'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { handleGetRecommendations } from '@/app/actions';
import type { CreditScoreData } from '@/lib/types';
import { Loader2, Sparkles, CheckCircle } from 'lucide-react';

type PersonalizedRecommendationsProps = {
  data: CreditScoreData;
};

export default function PersonalizedRecommendations({ data }: PersonalizedRecommendationsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const { toast } = useToast();

  const onGetRecommendations = async () => {
    setIsLoading(true);
    setRecommendations([]);
    const result = await handleGetRecommendations(data);
    setIsLoading(false);

    if (result.success && result.data) {
      setRecommendations(result.data.recommendations);
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error,
      });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary" className="w-full">
          <Sparkles className="mr-2 h-4 w-4" />
          Get Personalized Tips
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]" onOpenAutoFocus={onGetRecommendations}>
        <DialogHeader>
          <DialogTitle className="font-headline">Personalized Recommendations</DialogTitle>
          <DialogDescription>
            Based on your simulated profile, here are some AI-generated tips to improve your score.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {isLoading && (
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p>Generating your tips...</p>
            </div>
          )}
          {recommendations.length > 0 && (
            <ul className="space-y-3">
              {recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-foreground">{rec}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
