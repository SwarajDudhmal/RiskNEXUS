import * as XLSX from 'xlsx';
import { AppState, BankMetadata, MaturityBucket, FTPTransaction, CreditAccount, BusinessUnit } from '../types';

export function parseExcelData(buffer: ArrayBuffer): Partial<AppState> {
  const wb = XLSX.read(buffer, { type: 'array' });
  const data: Partial<AppState> = {
    metadata: {} as BankMetadata,
    buckets: [],
    ftpTransactions: [],
    creditAccounts: [],
    businessUnits: [],
  };

  // Parse Metadata
  if (wb.SheetNames.includes('BANK_METADATA')) {
    const sheet = wb.Sheets['BANK_METADATA'];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
    rows.forEach(row => {
      if (!row[0]) return;
      const key = String(row[0]).trim();
      const val = row[1];
      if (key === 'Bank Name') data.metadata!.bankName = String(val);
      if (key === 'Total Assets') data.metadata!.totalAssets = Number(val);
      if (key === 'Total Liabilities') data.metadata!.totalLiabilities = Number(val);
      if (key === 'Net Worth / Equity') data.metadata!.equity = Number(val);
      if (key === 'Quarter') data.metadata!.quarter = String(val);
      if (key === 'MCLR (1Y)') data.metadata!.mclr = Number(val);
    });
  }

  // Parse Maturity Buckets
  if (wb.SheetNames.includes('MATURITY_BUCKETS')) {
    const sheet = wb.Sheets['MATURITY_BUCKETS'];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
    let cumulativeGap = 0;
    data.buckets = rows.slice(3).filter(r => r[0] && !String(r[0]).startsWith('TOTAL')).map(r => {
      const assets = Number(r[2]) || 0;
      const liabilities = Number(r[3]) || 0;
      const gap = assets - liabilities;
      cumulativeGap += gap;
      return {
        label: String(r[0]),
        code: String(r[1]),
        assets,
        liabilities,
        gap,
        cumulativeGap,
        gapPercentage: data.metadata?.totalAssets ? (gap / data.metadata.totalAssets) * 100 : 0,
        ftpRate: Number(r[7]) || 0,
        niiImpact: gap * 0.01,
      };
    });
  }

  // Parse FTP Transactions
  if (wb.SheetNames.includes('FTP_RATES')) {
    const sheet = wb.Sheets['FTP_RATES'];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
    let inTxn = false;
    data.ftpTransactions = rows.filter(r => {
      if (String(r[0]).includes('SECTION B')) { inTxn = true; return false; }
      return inTxn && String(r[0]).startsWith('TXN');
    }).map(r => ({
      id: String(r[0]),
      product: String(r[1]),
      unit: String(r[2]),
      amount: Number(r[3]),
      maturity: Number(r[4]),
      contractRate: Number(r[5]),
      poolRate: Number(r[6]),
      liquidityPremium: Number(r[7]),
      netSpread: Number(r[9]) || (Number(r[5]) - Number(r[6])),
    }));
  }

  // Parse Credit Risk
  if (wb.SheetNames.includes('CREDIT_RISK')) {
    const sheet = wb.Sheets['CREDIT_RISK'];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
    data.creditAccounts = rows.slice(4).filter(r => r[0] && String(r[0]).startsWith('ACC')).map(r => {
      const ead = Number(r[3]) || 0;
      const pd = Number(r[4]) || 0;
      const lgd = Number(r[5]) || 0;
      return {
        id: String(r[0]),
        borrower: String(r[1]),
        sector: String(r[2]),
        ead,
        pd,
        lgd,
        el: ead * pd * lgd,
        ul: ead * lgd * Math.sqrt(pd * (1 - pd)),
        rating: String(r[8]),
        isWatchlist: String(r[9]).toLowerCase() === 'yes',
        provision: ead * pd * lgd * 1.1,
      };
    });
  }

  // Parse Unit Profitability
  if (wb.SheetNames.includes('UNIT_PROFITABILITY')) {
    const sheet = wb.Sheets['UNIT_PROFITABILITY'];
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
    data.businessUnits = rows.slice(4).filter(r => r[0] && !String(r[0]).startsWith('TOTAL')).map(r => ({
      name: String(r[0]),
      loans: Number(r[1]),
      deposits: Number(r[2]),
      loanYield: Number(r[3]),
      depositCost: Number(r[4]),
      ftpCharge: Number(r[5]),
      ftpCredit: Number(r[6]),
      lendingSpread: Number(r[3]) - Number(r[5]),
      depositSpread: Number(r[6]) - Number(r[4]),
      netFtpNim: Number(r[9]) || 0,
      raroc: Number(r[11]) || 0,
    }));
  }

  return data;
}

export function generateSampleExcel(riskLevel: 'low' | 'moderate' | 'high'): ArrayBuffer {
  const wb = XLSX.utils.book_new();
  
  // Metadata
  const meta = [
    ['Bank Name', riskLevel.toUpperCase() + ' Risk Commercial Bank'],
    ['Report Date', new Date().toISOString().split('T')[0]],
    ['Quarter', 'Q1 2026'],
    ['Total Assets', riskLevel === 'high' ? 85000 : 45000],
    ['Total Liabilities', riskLevel === 'high' ? 78000 : 40000],
    ['Net Worth / Equity', 7000],
    ['MCLR (1Y)', 8.5],
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(meta), 'BANK_METADATA');

  // Maturity Buckets
  const buckets = [
    ['MATURITY GAP ANALYSIS', '', '', '', '', '', '', ''],
    ['Bucket', 'Code', 'Assets', 'Liabilities', 'Gap', 'Cumul. Gap', 'Gap %', 'FTP Rate'],
    ['---', '---', '---', '---', '---', '---', '---', '---'],
    ['1-7 Days', 'D7', 1200, 1800, -600, -600, -1.3, 6.2],
    ['8-14 Days', 'D14', 800, 1200, -400, -1000, -0.9, 6.3],
    ['15-30 Days', 'D30', 2500, 2200, 300, -700, 0.7, 6.5],
    ['1-3 Months', 'M3', 5000, 6500, -1500, -2200, -3.3, 6.8],
    ['3-6 Months', 'M6', 8000, 7200, 800, -1400, 1.8, 7.2],
    ['6-12 Months', 'M12', 12000, 11000, 1000, -400, 2.2, 7.5],
    ['1-3 Years', 'Y3', 25000, 20000, 5000, 4600, 11.1, 8.1],
    ['>3 Years', 'Y5', 30000, 25000, 5000, 9600, 11.1, 8.5],
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(buckets), 'MATURITY_BUCKETS');

  // Credit Risk
  const pd = riskLevel === 'high' ? 0.08 : riskLevel === 'moderate' ? 0.03 : 0.01;
  const credit = [
    ['CREDIT RISK PORTFOLIO', '', '', '', '', '', '', '', '', ''],
    ['ID', 'Borrower', 'Sector', 'EAD', 'PD', 'LGD', 'EL', 'UL', 'Rating', 'Watchlist'],
    ['---', '---', '---', '---', '---', '---', '---', '---', '---', '---'],
    ['ACC001', 'Global Infra Corp', 'Infrastructure', 500, pd, 0.45, 0, 0, 'BBB', riskLevel === 'high' ? 'Yes' : 'No'],
    ['ACC002', 'Tech Solutions Ltd', 'Technology', 200, pd * 0.5, 0.4, 0, 0, 'A', 'No'],
    ['ACC003', 'Retail Giant Inc', 'Retail', 350, pd * 1.2, 0.5, 0, 0, 'BB', riskLevel !== 'low' ? 'Yes' : 'No'],
    ['ACC004', 'Energy Systems', 'Energy', 800, pd * 0.8, 0.45, 0, 0, 'BBB+', 'No'],
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(credit), 'CREDIT_RISK');

  // Unit Profitability
  const units = [
    ['UNIT PROFITABILITY', '', '', '', '', '', '', '', '', '', '', ''],
    ['Unit', 'Loans', 'Deposits', 'Yield', 'Cost', 'FTP Charge', 'FTP Credit', 'LS', 'DS', 'NIM', 'Capital', 'RAROC'],
    ['---', '---', '---', '---', '---', '---', '---', '---', '---', '---', '---', '---'],
    ['Retail Banking', 15000, 22000, 10.5, 4.5, 7.2, 7.0, 3.3, 2.5, 2.9, 1500, 18.5],
    ['Corporate Banking', 25000, 8000, 9.2, 5.2, 7.5, 7.2, 1.7, 2.0, 2.1, 2500, 14.2],
    ['SME Banking', 8000, 5000, 11.5, 5.0, 7.8, 7.4, 3.7, 2.4, 3.2, 1000, 16.8],
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(units), 'UNIT_PROFITABILITY');

  // FTP Rates
  const ftp = [
    ['FTP POOL RATES', '', '', '', '', '', '', '', ''],
    ['Tenor', 'Code', 'Base', 'LP', 'CS', 'OC', 'Total', 'MCLR', 'G-Sec'],
    ['---', '---', '---', '---', '---', '---', '---', '---', '---'],
    ['1 Month', 'M1', 6.5, 0.1, 0.2, 0.1, 6.9, 8.2, 6.8],
    ['1 Year', 'Y1', 7.4, 0.2, 0.3, 0.1, 8.0, 8.5, 7.4],
    ['SECTION B: TRANSACTIONS', '', '', '', '', '', '', '', ''],
    ['TXN001', 'Term Loan', 'Corporate', 100, 36, 9.5, 7.8, 0.2, 0.4, 1.1],
    ['TXN002', 'Savings', 'Retail', 50, 0, 4.0, 6.5, 0.1, 0.0, 2.4],
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(ftp), 'FTP_RATES');

  const out = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
  return out;
}
