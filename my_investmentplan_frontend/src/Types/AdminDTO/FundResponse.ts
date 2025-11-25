
export interface FundResponse {
  fundId: number;
  fundName: string;
  description: string;
  expenseRatio: number;
  aum: number;
  nav: number;
  totalUnits: number;
  minInvestmentAmount: number;
  annualReturnRate: number;
  amountReceived: number;
  amountPending: number;
  investmentType: number;
  createdAt: string;
  status: number;
  mutualFundStocks?: {
    fStockId: number;
    fundId: number;
    stockId: number;
    allocationPercentage: number;
    stock: {
      stockId: number;
      stockSymbol: string;
      companyName: string;
      sector: number;
      basePrice: number;
      currentMarketPrice: number;
      totalShares: number;
      volumeTraded: number;
      listedDate: string;
      status: boolean;
      createdAt: string;
      updatedAt: string;
    };
  }[];
}