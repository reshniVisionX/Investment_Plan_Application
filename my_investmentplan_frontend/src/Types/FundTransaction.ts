export interface FundTransaction {
  transactionId: string;
  fundName: string;                // from FundName
  transactionAmount: number;       // Total amount invested or withdrawn
  navAtTransaction: number;        // NAV value at the time of transaction
  unitsTransacted: number;         // Units bought or sold
  fundTransactionType: number;     // Enum (0 = BUY, 1 = SELL)
  transactionDate: string;         // ISO date string
}
