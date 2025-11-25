export interface StockTransaction {
   transactionId: string;
  stockSymbol: string;             // from StockSymbol
  transactionType: number;         // TransactionType enum (0 = BUY, 1 = SELL)
  price: number;                   // Price per share
  totalValue: number;              // Total transaction value
  quantity: number;                // Shares involved
  transactionDate: string;         // ISO date string
}
