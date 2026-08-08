'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { handlePredictImpact } from '@/app/actions';
import type { ActionCardConfig } from '@/lib/types';
import { Loader2, ArrowDown, ArrowUp } from 'lucide-react';

type ActionCardProps = {
  config: ActionCardConfig;
  currentScore: number;
  onScoreUpdate: (scoreDelta: number) => void;
};

type SimulationResult = {
  scoreImpact: number;
  explanation: string;
};

export default function ActionCard({ config, currentScore, onScoreUpdate }: ActionCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const { toast } = useToast();
  
  const form = useForm();
  const { fields } = config;

  // Set default values for the form from config
  useState(() => {
    if (fields) {
      fields.forEach(field => {
        form.setValue(field.name, field.defaultValue);
      });
    }
  });
  
  const paramValues = form.watch();

  const handleSubmit = async () => {
    setIsLoading(true);
    setResult(null);

    let details = config.description;
    if (fields) {
        details = fields.map(field => `${field.label}: ${paramValues[field.name]}${field.unit || ''}`).join(', ');
    }

    const response = await handlePredictImpact(config.actionText, details, currentScore);
    setIsLoading(false);

    if (response.success && response.data) {
      setResult(response.data);
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: response.error,
      });
    }
  };

  const handleApplyChange = () => {
    if (result) {
      onScoreUpdate(result.scoreImpact);
      toast({
        title: 'Score Updated!',
        description: `Your score changed by ${result.scoreImpact.toFixed(0)} points.`,
      });
      setResult(null);
    }
  };

  return (
    <Card className="flex flex-col justify-between hover:shadow-primary/20 hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <div className="flex items-start gap-4">
          <config.icon className="h-8 w-8 text-primary mt-1" />
          <div>
            <CardTitle className="font-headline text-lg">{config.title}</CardTitle>
            <CardDescription className="mt-1">{config.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        {fields?.map((field) => (
          <div key={field.name} className="space-y-2">
            <div className="flex justify-between items-center">
                <label className="text-sm font-medium">{field.label}</label>
                <span className="text-sm font-bold text-primary">{paramValues[field.name]}{field.unit}</span>
            </div>
            <Slider
              defaultValue={[field.defaultValue]}
              min={field.min}
              max={field.max}
              step={field.step}
              onValueChange={(value) => form.setValue(field.name, value[0])}
            />
          </div>
        ))}
        {result && (
            <div className="p-4 rounded-md bg-muted/50 border border-border animate-in fade-in-50">
                <div className="flex items-center gap-2 mb-2">
                    {result.scoreImpact >= 0 ? (
                        <ArrowUp className="h-5 w-5 text-green-500" />
                    ) : (
                        <ArrowDown className="h-5 w-5 text-red-500" />
                    )}
                    <h4 className="font-semibold">Predicted Impact</h4>
                    <span className={`font-bold text-lg ${result.scoreImpact >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {result.scoreImpact > 0 ? '+' : ''}{result.scoreImpact.toFixed(0)} pts
                    </span>
                </div>
                <p className="text-sm text-muted-foreground">{result.explanation}</p>
            </div>
        )}
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button onClick={handleSubmit} disabled={isLoading} className="flex-1">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            'See Impact'
          )}
        </Button>
        {result && (
          <Button onClick={handleApplyChange} variant="secondary" className="flex-1">
            Apply Change
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
