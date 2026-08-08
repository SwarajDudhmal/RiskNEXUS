import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Loader2, TrendingUp } from 'lucide-react';

const formSchema = z.object({
  age: z.coerce.number().min(18, 'Must be at least 18').max(100),
  income: z.coerce.number().min(0, 'Income cannot be negative'),
  debt: z.coerce.number().min(0, 'Debt cannot be negative'),
  creditCardUtilization: z.coerce.number().min(0).max(100, 'Must be between 0 and 100'),
  openCreditLines: z.coerce.number().int().min(0),
  creditHistoryLength: z.coerce.number().min(0, 'Cannot be negative'),
});

export default function InitialScoreForm({ onScoreGenerated }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm({
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

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:5000/api/calculate-score', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        onScoreGenerated({
            creditScore: result.data.creditScore,
            summary: result.data.summary,
            initialData: data
        });
      } else {
        setError(result.error || 'Failed to generate score');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const InputField = ({ label, name, type = "number", placeholder }) => (
    <div className="space-y-2">
      <label htmlFor={name} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
        {label}
      </label>
      <input
        id={name}
        type={type}
        placeholder={placeholder}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 border-gray-300"
        {...register(name, { valueAsNumber: true })}
      />
      {errors[name] && <p className="text-sm text-red-500">{errors[name].message}</p>}
    </div>
  );

  return (
    <div className="flex flex-col items-center justify-center p-4 w-full">
      <div className="flex items-center gap-4 mb-8">
        <TrendingUp className="h-10 w-10 text-blue-600" />
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
          Credit Foresight
        </h1>
      </div>
      
      <Card className="w-full max-w-2xl shadow-xl bg-white">
        <CardHeader>
          <CardTitle className="text-2xl">Start Your Simulation</CardTitle>
          <CardDescription>
            Enter your financial details to get a baseline credit score.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <InputField label="Age" name="age" />
              <InputField label="Annual Income ($)" name="income" />
              <InputField label="Total Debt ($)" name="debt" />
              <InputField label="Credit Card Utilization (%)" name="creditCardUtilization" />
              <InputField label="Open Credit Lines" name="openCreditLines" />
              <InputField label="Credit History Length (Years)" name="creditHistoryLength" />
            </div>

            {error && <div className="text-red-500 text-sm text-center">{error}</div>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Score...
                </>
              ) : (
                'Generate Credit Score'
              )}
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
