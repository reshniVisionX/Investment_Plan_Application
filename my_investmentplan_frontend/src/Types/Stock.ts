export interface Stock {
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
   verificationStatus: number;
}


  export const StockSectorTypeMap: Record<number, string> = {
  1: "NSE",
  2: "BSE",
};


