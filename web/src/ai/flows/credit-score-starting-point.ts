// This file is the starting point of the credit score simulation, which generates a credit score based on the user's financial history.

'use server';

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CreditScoreInputSchema = z.object({
  age: z.number().describe('The age of the user.'),
  income: z.number().describe('The annual income of the user.'),
  debt: z.number().describe('The total debt of the user.'),
  creditCardUtilization: z.number().describe('The credit card utilization rate of the user (as a percentage).'),
  openCreditLines: z.number().describe('The number of open credit lines the user has.'),
  creditHistoryLength: z.number().describe('The length of the user\'s credit history in years.'),
});
export type CreditScoreInput = z.infer<typeof CreditScoreInputSchema>;

const CreditScoreOutputSchema = z.object({
  creditScore: z.number().describe('The estimated credit score of the user.'),
  summary: z.string().describe('A summary of the factors that contributed to the credit score.'),
});
export type CreditScoreOutput = z.infer<typeof CreditScoreOutputSchema>;

export async function generateCreditScore(input: CreditScoreInput): Promise<CreditScoreOutput> {
  return generateCreditScoreFlow(input);
}

const prompt = ai.definePrompt({
  name: 'creditScorePrompt',
  input: {schema: CreditScoreInputSchema},
  output: {schema: CreditScoreOutputSchema},
  prompt: `You are a credit score expert. Based on the following information, estimate the user's credit score and provide a summary of the factors that influenced the score.\n\nAge: {{{age}}}\nIncome: {{{income}}}\nDebt: {{{debt}}}\nCredit Card Utilization: {{{creditCardUtilization}}}\nOpen Credit Lines: {{{openCreditLines}}}\nCredit History Length: {{{creditHistoryLength}}} years\n\nEstimate the credit score and provide a summary of the factors that influenced the score.`,
});

const generateCreditScoreFlow = ai.defineFlow(
  {
    name: 'generateCreditScoreFlow',
    inputSchema: CreditScoreInputSchema,
    outputSchema: CreditScoreOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
