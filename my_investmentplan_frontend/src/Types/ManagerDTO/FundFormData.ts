
export interface FundFormData {
  fundName: string;
  description: string;
  expenseRatio: string;
  aum: string;
  nav: string;
  totalUnits: string;
  minInvestmentAmount: string;
  annualReturnRate: string;
  logo: string | File;
  stocks: {
    stockId: string;
    allocationPercentage: string;
  }[];
}
