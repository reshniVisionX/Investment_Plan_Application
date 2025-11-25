import { type MutualFundStock } from "./MutualFundStock";

// ✅ Enum-like mapping for investment types
export const InvestmentTypeMap: Record<number, string> = {
  0: "LumpSum",
  1: "SIP",
};

// ✅ Represents a single fund with all details
export interface Fund {
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
  logo?:string;
  investmentType: number;
  updatedAt:string;
  createdAt: string;
  status: number;
  mutualFundStocks: MutualFundStock[];
}
