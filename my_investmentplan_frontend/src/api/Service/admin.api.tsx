import { http } from "../http"; 
import type { FundReport } from "../../Types/ManagerDTO/FundReport";
import type { GetAllFundsResponse } from "../../Types/AdminDTO/GetAllFundResponse";
import type { UpdateStatusResponse } from "../../Types/AdminDTO/UpdateStatusResponse";
import type { UnverifiedInvestor } from "../../Types/AdminDTO/UnverifiedInvestor";
import type { FundResponse } from "../../Types/AdminDTO/FundResponse";
import type { CreateStockRequest } from "../../Types/AdminDTO/CreateStockRequest";
import type { AxiosErrorResponse } from "../../Types/AxiosErrorResponse";
import { handleApiError } from "../../utils/HandleApiError";

// Post Stock
export const createStock = async (
  stock: CreateStockRequest
): Promise<AxiosErrorResponse> => {
  try {
    const { data } = await http.post<AxiosErrorResponse>(
      "Stocks/stock/create-stock",
      stock
    );
    return data;
  } catch (err) {
    return handleApiError(err, "Failed to create stock.");
  }
};


// Send Message to Investor
export const sendInvestorMessage = async (
  publicInvestorId: string,
  message: string
): Promise<AxiosErrorResponse> => {
  try {
    const { data } = await http.post<AxiosErrorResponse>(
      "notification/Notification/postNotify",
      { publicInvestorId, message }
    );
    return data;
  } catch (err) {
    return handleApiError(err, "Failed to send message.");
  }
};

// 🟢 GET ALL FUND REPORTS
export const getAllFundReports = async (): Promise<FundReport[]> => {
  try {
    const { data } = await http.get<FundReport[]>(
      "manager/Manager/fund-reports"
    );
    return data;
  } catch (err) {
    return handleApiError(err, "Failed to fetch fund reports.");
  }
};

// 🟢 GET ALL FUNDS
export const getAllFunds = async (): Promise<GetAllFundsResponse> => {
  try {
    const { data } = await http.get<GetAllFundsResponse>(
      "fund/Funds/all"
    );
    return data;
  } catch (err) {
    return handleApiError(err, "Failed to fetch all funds.");
  }
};

// 🟢 GET ALL UNVERIFIED INVESTORS
export const getAllUnverifiedInvestors = async (): Promise<UnverifiedInvestor[]> => {
  try {
    const { data } = await http.get<
      UnverifiedInvestor[] | { success: boolean; message: string }
    >("admin/Admin/investors/unverified");

    if (!Array.isArray(data)) {
      console.warn("⚠️ No unverified investors found:", data);
      return [];
    }

    return data;
  } catch (err) {
    console.error("❌ Error fetching unverified investors:", err);
    return handleApiError(err, "Failed to fetch unverified investors.");
  }
};

// 🟢 GET ALL UNVERIFIED FUNDS
export const getAllUnverifiedFunds = async (): Promise<FundResponse[]> => {
  try {
    const { data } = await http.get<
      FundResponse[] | { success: boolean; message: string }
    >("admin/Admin/funds/unverified");

    if (!Array.isArray(data)) {
      console.warn("⚠️ No unverified funds found:", data);
      return [];
    }

    return data;
  } catch (err) {
    console.error("❌ Error fetching unverified funds:", err);
    return handleApiError(err, "Failed to fetch unverified funds.");
  }
};

// 🟢 UPDATE INVESTOR STATUS
export const updateInvestorStatus = async (
  guid: string,
  status: number
): Promise<UpdateStatusResponse> => {
  try {
    const { data } = await http.put<UpdateStatusResponse>(
      `admin/Admin/investor/status?guid=${guid}&status=${status}`
    );
    return data;
  } catch (err) {
    return handleApiError(err, "Failed to update investor status.");
  }
};

// 🟢 UPDATE FUND STATUS
export const updateFundStatus = async (
  fundId: number,
  status: number
): Promise<UpdateStatusResponse> => {
  try {
    const { data } = await http.put<UpdateStatusResponse>(
      `admin/Admin/fund/status?fundId=${fundId}&status=${status}`
    );
    return data;
  } catch (err) {
    return handleApiError(err, "Failed to update fund verification status.");
  }
};

// 🟢 GET ALL INVESTORS
export const getAllInvestors = async (): Promise<UnverifiedInvestor[]> => {
  try {
    const { data } = await http.get<UnverifiedInvestor[]>(
      "Investor/GetAllInvestor"
    );
    return data;
  } catch (err) {
    console.error("❌ Error fetching all investors:", err);
    return handleApiError(err, "Failed to fetch all investors.");
  }
};