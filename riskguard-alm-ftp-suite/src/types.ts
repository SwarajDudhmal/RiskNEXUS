export interface BankMetadata {
  bankName: string;
  reportDate: string;
  quarter: string;
  totalAssets: number;
  totalLiabilities: number;
  equity: number;
  mclr: number;
  repoRate: number;
}

export interface MaturityBucket {
  label: string;
  code: string;
  assets: number;
  liabilities: number;
  gap: number;
  cumulativeGap: number;
  gapPercentage: number;
  ftpRate: number;
  niiImpact: number;
}

export interface FTPTransaction {
  id: string;
  product: string;
  unit: string;
  amount: number;
  maturity: number;
  contractRate: number;
  poolRate: number;
  liquidityPremium: number;
  netSpread: number;
}

export interface CreditAccount {
  id: string;
  borrower: string;
  sector: string;
  ead: number;
  pd: number;
  lgd: number;
  el: number;
  ul: number;
  rating: string;
  isWatchlist: boolean;
  provision: number;
}

export interface BusinessUnit {
  name: string;
  loans: number;
  deposits: number;
  loanYield: number;
  depositCost: number;
  ftpCharge: number;
  ftpCredit: number;
  lendingSpread: number;
  depositSpread: number;
  netFtpNim: number;
  raroc: number;
}

export interface AppState {
  metadata: BankMetadata;
  buckets: MaturityBucket[];
  ftpTransactions: FTPTransaction[];
  creditAccounts: CreditAccount[];
  businessUnits: BusinessUnit[];
  isLoaded: boolean;
}
