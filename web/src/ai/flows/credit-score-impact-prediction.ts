'use server';
/**
 * @fileOverview Predicts the impact of various financial actions on a user's credit score.
 *
 * - predictCreditScoreImpact - A function that predicts the impact of a financial action on a user's credit score.
 * - CreditScoreImpactInput - The input type for the predictCreditScoreImpact function.
 * - CreditScoreImpactOutput - The return type for the predictCreditScoreImpact function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CreditScoreImpactInputSchema = z.object({
  action: z
    .string()
    .describe(
      'The financial action taken by the user, e.g., miss a payment, pay off a loan, open a new credit card.'
    ),
  details: z
    .string()
    .describe(
      'Specific details about the action, such as the number of days a payment was missed or the amount of the loan paid off.'
    ),
  currentScore: z.number().describe('The user\'s current credit score.'),
});
export type CreditScoreImpactInput = z.infer<typeof CreditScoreImpactInputSchema>;

const CreditScoreImpactOutputSchema = z.object({
  scoreImpact: z
    .number()
    .describe(
      'The predicted change in the user\'s credit score as a result of the action.'
    ),
  explanation: z
    .string()
    .describe(
      'A detailed explanation of why the action affects the credit score and how the score is affected.'
    ),
});
export type CreditScoreImpactOutput = z.infer<typeof CreditScoreImpactOutputSchema>;

export async function predictCreditScoreImpact(
  input: CreditScoreImpactInput
): Promise<CreditScoreImpactOutput> {
  return creditScoreImpactFlow(input);
}

const prompt = ai.definePrompt({
  name: 'creditScoreImpactPrompt',
  input: {schema: CreditScoreImpactInputSchema},
  output: {schema: CreditScoreImpactOutputSchema},
  prompt: `You are a credit score expert. Given a user\'s current credit score, the financial action they are considering taking, and details about that action, you will predict the impact on their credit score.

Current Credit Score: {{{currentScore}}}
Action: {{{action}}}
Details: {{{details}}}

Consider various factors when determining how a financial action impacts credit score, including payment history, amounts owed, length of credit history, credit mix, and new credit.

Your response should include the predicted score impact as a number and a detailed explanation of the reasons for the change.
`,
});

const creditScoreImpactFlow = ai.defineFlow(
  {
    name: 'creditScoreImpactFlow',
    inputSchema: CreditScoreImpactInputSchema,
    outputSchema: CreditScoreImpactOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
