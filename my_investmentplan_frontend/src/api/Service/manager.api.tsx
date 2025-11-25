import { http } from "../http";
import type { AxiosErrorResponse } from "../../Types/AxiosErrorResponse";
import type { CreateFundResponse } from "../../Types/ManagerDTO/CreateFundResponse";
import { handleApiError } from "../../utils/HandleApiError";

// 🟢 CREATE FUND
export const createFund = async (
  formData: FormData
): Promise<CreateFundResponse> => {
  try {
    const { data } = await http.post<CreateFundResponse>(
      "fund/Funds/create",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data", 
        },
      }
    );
    return data;
  } catch (err) {
    return handleApiError(err, "Failed to create mutual fund.");
  }
};

// 🟢 SETTLE FUND
export const settleFund = async (fundId: number): Promise<AxiosErrorResponse> => {
  try {
    const { data } = await http.post<AxiosErrorResponse>(
      `manager/Manager/settle-fund/${fundId}`
    );
    if (typeof data === "string") {
      return { Success: true, message: data };
    }
    return data;
  } catch (err) {
    return handleApiError(err, "Failed to settle fund.");
  }
};

// 🟢 REDEEM FUND
export const redeemFund = async (
  fundId: number,
  percent: number
): Promise<AxiosErrorResponse> => {
  try {
    const { data } = await http.post<AxiosErrorResponse>(
      `manager/Manager/redeem-fund/${fundId}?percent=${percent}`
    );
    if (typeof data === "string") {
      return { Success: true, message: data };
    }
    return data;
  } catch (err) {
    return handleApiError(err, "Failed to redeem fund.");
  }
};