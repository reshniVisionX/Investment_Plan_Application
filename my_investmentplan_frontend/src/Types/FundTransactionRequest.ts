
export interface FundTransactionRequest {
  publicInvestorId: string;
  fundId: number;
  transactionAmount: number;
  fundTransactionType: number; 
}

export interface FundTransactionResponse {
  success: boolean;
  message: string;
}
