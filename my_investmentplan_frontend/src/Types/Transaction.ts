export const TransactionType = {
  BUY: 1,
  SELL: 2,
} as const;

export type TransactionType = (typeof TransactionType)[keyof typeof TransactionType];

export interface TransactionRequestDTO {
  publicInvestorId: string;
  stockId: number;
  transactionType: TransactionType;
  quantity: number;
}
