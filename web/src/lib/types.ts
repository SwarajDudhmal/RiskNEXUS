import type { CreditScoreInput, CreditScoreOutput } from "@/ai/flows/credit-score-starting-point";
import type { LucideIcon } from "lucide-react";

export type CreditScoreData = {
  initialData: CreditScoreInput;
  creditScore: number;
  summary: string;
};

export type ActionType = 
  | 'miss_payment'
  | 'default_loan'
  | 'pay_loan'
  | 'close_card'
  | 'change_utilization'
  | 'new_home_loan'
  | 'new_credit_card'
  | 'new_car_loan'
  | 'new_loan_enquiry';

export type ActionCardConfig = {
  type: ActionType;
  title: string;
  description: string;
  icon: LucideIcon;
  actionText: string;
  fields?: {
    name: string;
    label: string;
    defaultValue: number;
    min?: number;
    max?: number;
    step?: number;
    unit?: string;
  }[];
};
