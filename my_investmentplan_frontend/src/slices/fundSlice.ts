import { createSlice, createAsyncThunk,type PayloadAction } from "@reduxjs/toolkit";
import { getAllFunds } from "../api/Service/investor.api";
import { subscribeToFund } from "../api/signalrService";
import type { Fund } from "../Types/Fund";

// ----- Types -----
export interface FundUpdate {
  fundId: number;
  fundName: string;   // From backend broadcast
  nav: number;
  aum: number;
  totalUnits: number;
  minInvestmentAmount: number;
  updatedAt: string;
}

type FundState = {
  updates: (Fund & { isUp?: boolean | null; history?: number[] })[];
  loading: boolean;
  error: string | null;
};

// ----- Initial State -----
const initialState: FundState = {
  updates: [],
  loading: false,
  error: null,
};

// ----- THUNK: Fetch all funds with full data -----
export const fetchAllFunds = createAsyncThunk<
  Fund[],
   { shouldSubscribe: boolean },
  { rejectValue: string }
>("funds/fetchAll", async ({ shouldSubscribe },  { rejectWithValue }) => {
  try {
    const result = await getAllFunds();

    if (shouldSubscribe) {
      result.forEach((fund) => subscribeToFund(fund.fundId));
    }
    return result;
  } catch (error) {
    return rejectWithValue((error as Error).message);
  }
});

// ----- SLICE -----
const fundSlice = createSlice({
  name: "funds",
  initialState,

  reducers: {
    // 🔥 LIVE UPDATE FROM SIGNALR -------------------------
    addFundUpdate: (state, action: PayloadAction<FundUpdate>) => {
      const update = action.payload;

      const existing = state.updates.find((f) => f.fundId === update.fundId);

      if (existing) {
        // Track NAV history (last 3 values)
        if (!existing.history) existing.history = [];
        if (existing.history.length >= 3) existing.history.shift();
        existing.history.push(update.nav);

        const prev = existing.history[existing.history.length - 2];
        const cur = update.nav;

        if (prev !== undefined) {
          existing.isUp = cur > prev ? true : cur < prev ? false : null;
        }

        existing.nav = update.nav;
        existing.aum = update.aum;
        existing.totalUnits = update.totalUnits;
        existing.minInvestmentAmount = update.minInvestmentAmount;
        existing.updatedAt = update.updatedAt;
       console.log("Fund update isProfit"+existing.isUp);
      }
    },

    clearFunds: (state) => {
      state.updates = [];
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchAllFunds.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchAllFunds.fulfilled, (state, action) => {
        state.loading = false;

        state.updates = action.payload.map((f) => ({
          ...f,
          history: [f.nav],
          isUp: null,
        }));
      })

      .addCase(fetchAllFunds.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? "Failed to fetch funds.";
      });
  },
});

export const { addFundUpdate, clearFunds } = fundSlice.actions;

export default fundSlice.reducer;
