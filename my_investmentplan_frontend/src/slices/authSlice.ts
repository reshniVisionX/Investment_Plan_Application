import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { http } from "../api/http";
import { tokenstore } from "../auth/tokenstore";
import axios from "axios";
import type { Investor } from "../Types/Investor"; 
import { clearStocks } from "./stockSlice";
import { clearFunds } from "./fundSlice";
import { clearNotifications } from "./notificationSlice";
import type { AppDispatch } from "../store";

// -------------------- TYPES --------------------
type Credentials = {
  email: string;
  password: string;
};

type ApiSuccessResponse = {
  success: true;
  message: string;
  data: Investor;
};

type ApiErrorResponse = {
  message: string;
  Exception: string;
};

type AuthState = {
  user: Investor | null;
  loading: boolean;
  error: string | null;
};


const initialState: AuthState = {
  user:  tokenstore.getInvestor() as Investor | null,
  loading: false,
  error: null,
};


export const loginUser = createAsyncThunk<
  Investor,
  Credentials,
  { rejectValue: string }
>(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await http.post<ApiSuccessResponse>("Investor/login", credentials);

      if (response.data.success) {
        return response.data.data;
      } else {
        return rejectWithValue("Login failed");
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const serverMsg =
          (err.response?.data as ApiErrorResponse | undefined)?.message ||
          err.response?.data.Exception ||
          "Unable to connect to server";
        return rejectWithValue(serverMsg);
      }
      return rejectWithValue("Unable to connect to server");
    }
  }
);


const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user = null;
      tokenstore.clear(); 

    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<Investor>) => {
        state.loading = false;
        state.user = action.payload;
        tokenstore.setToken(action.payload.token);
        tokenstore.setInvestor(action.payload); 

      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? action.error.message ?? "Login failed";
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;

export const logoutAndReset = () => (dispatch: AppDispatch) => {
  console.log("Logging out and clearing Redux...");
  dispatch(logout());
  dispatch(clearStocks());
  dispatch(clearFunds());
  dispatch(clearNotifications());
};
