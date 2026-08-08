import {
  Ban,
  CreditCard,
  Home,
  Car,
  DollarSign,
  XCircle,
  TrendingDown,
  FileQuestion,
  PlusCircle,
} from 'lucide-react';
import type { ActionCardConfig } from './types';

export const ACTION_CARDS_CONFIG: ActionCardConfig[] = [
  {
    type: 'miss_payment',
    title: 'Miss a Payment',
    description: 'Simulate the impact of missing a payment by a certain number of days.',
    icon: Ban,
    actionText: 'Miss a payment',
    fields: [
      { name: 'delay', label: 'Days Delayed', defaultValue: 30, min: 1, max: 180, step: 1, unit: 'days' },
    ],
  },
  {
    type: 'default_loan',
    title: 'Default on a Loan',
    description: 'See what happens if you default on a loan or credit card.',
    icon: XCircle,
    actionText: 'Default on loan',
  },
  {
    type: 'pay_loan',
    title: 'Pay Off Loan',
    description: 'Analyze the effect of paying off an outstanding loan or card balance.',
    icon: DollarSign,
    actionText: 'Pay off loan',
    fields: [
        { name: 'amount', label: 'Amount Paid Off', defaultValue: 5000, min: 100, max: 100000, step: 100, unit: '$' },
    ]
  },
  {
    type: 'close_card',
    title: 'Close Old Credit Card',
    description: 'Find out how closing an old credit card can affect your score.',
    icon: CreditCard,
    actionText: 'Close credit card',
  },
  {
    type: 'change_utilization',
    title: 'Change Card Utilization',
    description: 'Adjust your credit card utilization to see the potential score change.',
    icon: TrendingDown,
    actionText: 'Change card utilization',
    fields: [
      { name: 'utilization', label: 'New Utilization', defaultValue: 30, min: 0, max: 100, step: 1, unit: '%' },
    ],
  },
  {
    type: 'new_home_loan',
    title: 'Take a New Home Loan',
    description: 'Simulate applying for and receiving a new home loan.',
    icon: Home,
    actionText: 'Take new home loan',
  },
  {
    type: 'new_credit_card',
    title: 'Open a New Credit Card',
    description: 'See the impact of opening a new credit card account.',
    icon: PlusCircle,
    actionText: 'Open new credit card',
  },
  {
    type: 'new_car_loan',
    title: 'Take a New Car Loan',
    description: 'Simulate applying for and receiving a new car loan.',
    icon: Car,
    actionText: 'Take new car loan',
  },
  {
    type: 'new_loan_enquiry',
    title: 'Enquiry for New Loan',
    description: 'A hard inquiry can affect your score. See by how much.',
    icon: FileQuestion,
    actionText: 'Enquire for new loan',
  },
];
