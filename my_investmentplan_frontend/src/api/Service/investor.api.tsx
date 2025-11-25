import { http } from "../http";
import { type SignUpResponse } from "../../Types/SignUpResponse";
import { type Fund } from "../../Types/Fund";
import { type ApiResponse } from "../../Types/ApiResponse";
import { type Stock } from "../../Types/Stock";
import { type Portfolio } from "../../Types/Portfolio";
import { type TransactionRequestDTO} from "../../Types/Transaction";
import { type FundTransaction } from "../../Types/FundTransaction";
import { type StockTransaction } from "../../Types/StockTransaction";
import { type Notification as AppNotification } from "../../Types/Notification";
import {  type InvestorProfile } from "../../Types/InvestorProfile";
import type { FundOfInvestor } from "../../Types/FundOfInvestor";
import { type FundTransactionRequest,type FundTransactionResponse } from "../../Types/FundTransactionRequest";
import { type CheckDuplicateResponse } from "../../Types/CheckDuplicateResponse";
import { handleApiError } from "../../utils/HandleApiError";
import {type Redeem } from "../../Types/Redeem";

// REGISTER INVESTOR
export const registerInvestor = async (formData: FormData): Promise<SignUpResponse> => {
  try {
    const { data } = await http.post<SignUpResponse>("Investor/signup", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  } catch (err) {
    return handleApiError(err, "Failed to register investor.");
  }
};

//redeem by investor
export const redeemFund = async (payload: {
  investorId: string;
  fundId: number;
  redeemAmount: number;
}): Promise<ApiResponse<Redeem>> => {
  try {
    const { data } = await http.post("manager/Manager/redeem", payload);
    return data;
  } catch (err) {
    return handleApiError(err, "Redeem failed.");
  }
};

// UPDATE INVESTOR
export const updateInvestor = async (formData: FormData): Promise<SignUpResponse> => {
  try {
    const { data } = await http.put<SignUpResponse>("Investor/update", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  } catch (err) {
    return handleApiError(err, "Failed to update investor.");
  }
};

// CHECK DUPLICATES BEFORE REGISTRATION
export const checkInvestorDuplicates = async (
  aadhaarNo: string,
  panNo: string,
  mobile: string,
  email: string
): Promise<CheckDuplicateResponse> => {
  try {
    const { data } = await http.post<CheckDuplicateResponse>("Investor/check-duplicates", {
      aadhaarNo,
      panNo,
      mobile,
      email,
    });
    return data;
  } catch (err) {
    return handleApiError(err, "Failed to check duplicates.");
  }
};

// GET ALL FUNDS
export const getAllFunds = async (): Promise<Fund[]> => {
  try {
    const { data } = await http.get<ApiResponse<Fund[]>>("fund/Funds/allFunds");
    return data.data;
  } catch (err) {
    return handleApiError(err, "Failed to fetch funds.");
  }
};

// Get funds invested by an investor
export const getAllFundsByInvestorId = async (publicInvestorId: string): Promise<FundOfInvestor[]> => {
  try {
    const { data } = await http.get<{ success: boolean; data: FundOfInvestor[] }>(
      `fund/Funds/investments/${publicInvestorId}`
    );
    return data.data; 
  } catch (err) {
    return handleApiError(err, "Failed to fetch mutual fund investments.");
  }
};

// GET COMPLETE PORTFOLIO (Stocks + Mutual Funds)
export const getCompletePortfolio = async (
  publicInvestorId: string
): Promise<{
  success: boolean;
  stockCount: number;
  mutualFundCount: number;
  data: {
    stocks: Portfolio[];
    mutualFunds: FundOfInvestor[];
  };
  message?: string;
}> => {
  try {
    const { data } = await http.get(
      `Stocks/investor/complete-portfolio/${publicInvestorId}`
    );
    return data;
  } catch (err) {
    return handleApiError(err, "Failed to fetch portfolio.");
  }
};

// funds purchase
export const purchaseFund = async (
  payload: FundTransactionRequest
): Promise<FundTransactionResponse> => {
  try {
    const { data } = await http.post<FundTransactionResponse>(
      "transaction/Transaction/fund/purchase",
      payload
    );
    return data;
  } catch (err) {
    return handleApiError(err, "Failed to complete fund purchase.");
  }
};

// GET ALL STOCKS
export const getAllStocks = async (): Promise<Stock[]> => {
  try {
    const { data } = await http.get<ApiResponse<Stock[]>>("Stocks/stock/allStocks");
    return data.data;
  } catch (err) {
    return handleApiError(err, "Failed to fetch stocks.");
  }
};

// GET PORTFOLIO (by Investor)
export const getInvestorPortfolio = async (publicInvestorId: string): Promise<Portfolio[]> => {
  try {
    const { data } = await http.get<ApiResponse<Portfolio[]>>(
      `Stocks/portfolio/investor/${publicInvestorId}`
    );
    return data.data;
  } catch (err) {
    return handleApiError(err, "Failed to fetch investor portfolio.");
  }
};

// Create Transaction (BUY / SELL)
export const performTransaction = async (payload: TransactionRequestDTO): Promise<void> => {
  try {
    const { data } = await http.post("transaction/Transaction/purchaseStock", payload);
    if (!data.success) {
      throw new Error(data.Exception || "Transaction failed.");
    } else {
      console.log(data.success);
    }
  } catch (err) {
    return handleApiError(err, "Failed to perform transaction.");
  }
}

// Get All portfolio byId
export const getAllPortfoliosById = async (publicInvestorId: string): Promise<Portfolio[]> => {
  try {
    const { data } = await http.get<ApiResponse<Portfolio[]>>(
      `Stocks/portfolio/investor/${publicInvestorId}`
    );
    return data.data;
  } catch (err) {
    return handleApiError(err, "Failed to fetch portfolios.");
  }
};

// Get all stock transactions by investor ID
export const getAllStockTransactionsById = async (publicInvestorId: string): Promise<StockTransaction[]> => {
  try {
    const { data } = await http.get<ApiResponse<StockTransaction[]>>(
      `transaction/Transaction/investor/${publicInvestorId}`
    );
    return data.data;
  } catch (err) {
    return handleApiError(err, "Failed to fetch stock transactions.");
  }
};

// Get all mutual fund transactions by investor ID
export const getAllFundTransactionsById = async (publicInvestorId: string): Promise<FundTransaction[]> => {
  try {
    const { data } = await http.get<ApiResponse<FundTransaction[]>>(
      `transaction/Transaction/fundTrans/ByInvestor/${publicInvestorId}`
    );
    return data.data;
  } catch (err) {
    return handleApiError(err, "Failed to fetch mutual fund transactions.");
  }
};

// get all notifications of a investor
export const getAllNotificationsByInvestorId = async (
  publicInvestorId: string
): Promise<AppNotification[]> => {
  try {
    const { data } = await http.get<ApiResponse<AppNotification[]>>(
      `notification/Notification/investor/${publicInvestorId}`
    );
    return data.data;
  } catch (err) {
    return handleApiError(err, "Failed to fetch notifications.");
  }
};

// get investor profile by ID
export const getInvestorProfileById = async (publicInvestorId: string): Promise<InvestorProfile> => {
  try {
    const { data } = await http.get<ApiResponse<InvestorProfile>>(`Investor/${publicInvestorId}`);
    return data.data;
  } catch (err) {
    return handleApiError(err, "Failed to fetch profile details.");
  }
};

// Update investor details
export const updateInvestorProfile = async (
  publicInvestorId: string,
  updatedFields: Record<string, unknown>
): Promise<string> => {
  try {
    const { data } = await http.put<ApiResponse<string>>(
      `Investor/update`,
      { publicInvestorId, ...updatedFields }
    );
    console.log(data);
    return "Profile updated successfully.";
  } catch (err) {
    return handleApiError(err, "Failed to update profile.");
  }
};