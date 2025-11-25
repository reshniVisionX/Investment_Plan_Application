import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { getAllStocks } from "../api/Service/investor.api";
import type { Stock } from "../Types/Stock";
import { subscribeToStock } from "../api/signalrService";


export interface StockUpdate {
  stockId: number;
  currentMarketPrice: number;
  totalShares: number;
  volumeTraded: number;
  updatedAt: string;
}

type StockState = {
  updates: (Stock & { isUp?: boolean | null; history?: number[] })[];
  loading: boolean;
  error: string | null;
};


const initialState: StockState = {
  updates: [],
  loading: false,
  error: null,
};


export const fetchAllStocks = createAsyncThunk<
  Stock[],
  {shouldSubscribe:boolean},
  { rejectValue: string }
>("stocks/fetchAll", async ({ shouldSubscribe },  { rejectWithValue }) => {
  try {
    const result = await getAllStocks();
    if(shouldSubscribe)
      result.forEach(stock => subscribeToStock(stock.stockId));

    return result.map(stock => ({
      ...stock,
      history: [stock.currentMarketPrice],
      isUp: null,
    }));
  } catch (err) {
    return rejectWithValue((err as Error).message);
  }
});


const stockSlice = createSlice({
  name: "stocks",
  initialState,
  reducers: {

    addStockUpdate: (state, action: PayloadAction<StockUpdate>) => {
      const existing = state.updates.find(s => s.stockId === action.payload.stockId);

      if (existing) {
      
        if (!existing.history) existing.history = [];
        if (existing.history.length >= 3) existing.history.shift();
        existing.history.push(action.payload.currentMarketPrice);

        const prevPrice = existing.history[existing.history.length - 2];
        const newPrice = action.payload.currentMarketPrice;

        if (prevPrice !== undefined) {
          if (newPrice > prevPrice) existing.isUp = true;
          else if (newPrice < prevPrice) existing.isUp = false;
        }

        
        existing.currentMarketPrice = newPrice;
        existing.totalShares = action.payload.totalShares;
        existing.volumeTraded = action.payload.volumeTraded;
        existing.updatedAt = action.payload.updatedAt;
      console.log("Stock update isProfit "+existing.isUp);
      } else{
        console.log("No existing stock");
      }
    },

    clearStocks: (state) => {
      state.updates = [];
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchAllStocks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllStocks.fulfilled, (state, action) => {
        state.loading = false;
       
        state.updates = action.payload;
      })
      .addCase(fetchAllStocks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch stocks.";
      });
  },
});

export const { addStockUpdate, clearStocks } = stockSlice.actions;
export default stockSlice.reducer;
