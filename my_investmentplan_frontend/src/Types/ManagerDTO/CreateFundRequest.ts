export interface CreateFundRequest {
  fundName: string;
  description: string;
  logo?: string | File; 
  expenseRatio: number;
  aum: number;
  nav: number;
  totalUnits: number;
  minInvestmentAmount: number;
  annualReturnRate: number;
  stocks: {
    stockId: number;
    allocationPercentage: number;
  }[];
}