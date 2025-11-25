import {type Stock} from './Stock';

export interface MutualFundStock {
  fStockId: number;
  fundId: number;
  stockId: number;
  allocationPercentage: number;
  stock: Stock;
}