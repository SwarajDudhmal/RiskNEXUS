'use server';

import { generateCreditScore, type CreditScoreInput } from '@/ai/flows/credit-score-starting-point';
import { predictCreditScoreImpact } from '@/ai/flows/credit-score-impact-prediction';
import { getPersonalizedRecommendations } from '@/ai/flows/personalized-recommendation';
import type { CreditScoreData } from '@/lib/types';

export async function handleGenerateCreditScore(input: CreditScoreInput) {
  try {
    const result = await generateCreditScore(input);
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Failed to generate credit score.' };
  }
}

export async function handlePredictImpact(action: string, details: string, currentScore: number) {
  try {
    const result = await predictCreditScoreImpact({ action, details, currentScore });
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Failed to predict impact.' };
  }
}

export async function handleGetRecommendations(data: CreditScoreData) {
    const financialSituation = `
      Age: ${data.initialData.age}
      Income: $${data.initialData.income.toLocaleString()}
      Total Debt: $${data.initialData.debt.toLocaleString()}
      Credit Card Utilization: ${data.initialData.creditCardUtilization}%
      Open Credit Lines: ${data.initialData.openCreditLines}
      Credit History Length: ${data.initialData.creditHistoryLength} years
    `;
  
    try {
      const result = await getPersonalizedRecommendations({
        creditScore: data.creditScore,
        financialSituation,
      });
      return { success: true, data: result };
    } catch (error) {
      console.error(error);
      return { success: false, error: 'Failed to get recommendations.' };
    }
}
