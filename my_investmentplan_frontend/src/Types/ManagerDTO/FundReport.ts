

export interface FundReport {
  fundName: string;
  currentValue: number;
  totalInvested: number;
  profitLoss: number;
  nav: number;
  aum: number;
  noOfInvestors: number;
  stocks: StockAllocations[]
}

export interface StockAllocations {
  stockId: number;
  stockName: string;
  sector: number;
  allocationPercentage: number;
  marketPrice: number;
  totalAmountInvested: number;
}


export type GetAllFundReportsResponse = FundReport[];
