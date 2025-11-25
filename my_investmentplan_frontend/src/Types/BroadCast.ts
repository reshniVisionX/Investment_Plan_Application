
export interface BroadCastStockUpdDTO {
  stockId: number;
  sector: number; 
  currentMarketPrice: number;
  totalShares: number;
  volumeTraded: number;
  updatedAt: string;
}

export interface BroadCastFundUpdDTO {
  fundId: number;
  fundName: string;
  nav: number;
  aum :number;
  totalUnits:number;
  minInvestmentAmount:number;
  updatedAt: string;
}

export interface NotificationDTO {
  notificationId: number;
    publicInvestorId:string,
    isRead:boolean,
  message: string;
  createdAt: string;
}
