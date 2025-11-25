export interface CreateStockRequest {
  stockSymbol: string;
  companyName: string;
  sector: number; // NSE = 1, BSE = 2
  basePrice: number;
  currentMarketPrice: number;
  totalShares: number;
  volumeTraded?: number;
  listedDate: string;
}