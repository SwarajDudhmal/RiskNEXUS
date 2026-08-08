'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { handleGenerateCreditScore } from '@/app/actions';
import type { CreditScoreData } from '@/lib/types';
import { useState } from 'react';
import { Loader2, TrendingUp } from 'lucide-react';
import type { CreditScoreInput } from '@/ai/flows/credit-score-starting-point';

const formSchema = z.object({
  age: z.coerce.number().min(18, 'Must be at least 18').max(100),
  income: z.coerce.number().min(0, 'Income cannot be negative'),
  debt: z.coerce.number().min(0, 'Debt cannot be negative'),
  creditCardUtilization: z.coerce.number().min(0).max(100, 'Must be between 0 and 100'),
  openCreditLines: z.coerce.number().int().min(0),
  creditHistoryLength: z.coerce.number().min(0, 'Cannot be negative'),
});

type InitialScoreFormProps = {
  onScoreGenerated: (data: CreditScoreData) => void;
};

export default function InitialScoreForm({ onScoreGenerated }: InitialScoreFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: 35,
      income: 75000,
      debt: 15000,
      creditCardUtilization: 30,
      openCreditLines: 5,
      creditHistoryLength: 10,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    const result = await handleGenerateCreditScore(values as CreditScoreInput);
    setIsLoading(false);

    if (result.success && result.data) {
      onScoreGenerated({
        initialData: values as CreditScoreInput,
        creditScore: result.data.creditScore,
        summary: result.data.summary,
      });
      toast({
        title: 'Success!',
        description: 'Your initial credit score has been generated.',
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error,
      });
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
       <div className="flex items-center gap-4 mb-8">
        <TrendingUp className="h-10 w-10 text-primary" />
        <h1 className="text-4xl md:text-5xl font-bold font-headline tracking-tight text-foreground">
          Credit Foresight
        </h1>
      </div>
      <Card className="w-full max-w-2xl shadow-2xl">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Start Your Simulation</CardTitle>
          <CardDescription>
            Enter your financial details to get a baseline credit score. This information is not stored and is only used for this simulation.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="income"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Annual Income</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="75000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="debt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Debt</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="15000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="creditCardUtilization"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Card Utilization (%)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="30" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="openCreditLines"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Open Credit Lines</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="5" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="creditHistoryLength"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Credit History (Years)</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="10" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Generate Score
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      <p className="mt-8 text-center text-sm text-muted-foreground">
        Powered by Generative AI. All data is for simulation purposes only.
      </p>
    </div>
  );
}
