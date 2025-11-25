

export interface Portfolio {
  portfolioId: number;
  publicInvestorId: string;
  stockId: number;
  quantity: number;
  stockSymbol: string;
  companyName:string;
  sector:number;
  avgBuyPrice: number;
  currentMarketPrice: number;
  currentValue: number;
  profitLoss: number;
  boughtAt: string;

}
