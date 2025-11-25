import React, { useEffect, useState } from "react";
import "../../Styles/Admin/AdminVerification.css";
import {
  getAllUnverifiedFunds,
  updateFundStatus,
} from "../../api/Service/admin.api";
import type { FundResponse } from "../../Types/AdminDTO/FundResponse";
import Toast, { type ToastType } from "../../utils/Toast";
import {formatDateTime} from "../../utils/FormatDate";

const FundRequest: React.FC = () => {
  const [funds, setFunds] = useState<FundResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType | null }>({
    message: "",
    type: null,
  });

  useEffect(() => {
    const fetchFunds = async () => {
      setLoading(true);
      try {
        const data = await getAllUnverifiedFunds();
        setFunds(data);
      } catch (error) {
        setToast({ message: (error as Error).message, type: "error" });
      } finally {
        setLoading(false);
      }
    };
    fetchFunds();
  }, []);

  const handleFundStatus = async (fundId: number, status: number) => {
    try {
      const res = await updateFundStatus(fundId, status);
      setToast({ message: res.message, type: res.success ? "success" : "error" });

      setFunds((prev) => prev.filter((f) => f.fundId !== fundId));
    } catch (err) {
      setToast({ message: (err as Error).message, type: "error" });
    }
  };

  return (
    <div className="admin-request-container">
      <h2>💰 Fund Requests</h2>
      <p>List of funds pending verification.</p>

      {loading ? (
        <p>Loading fund requests...</p>
      ) : funds.length === 0 ? (
        <p>No unverified funds available.</p>
      ) : (
        <div className="card-grid">
          {funds.map((fund) => (
            <div key={fund.fundId} className="card">
              <h3 className="fundTitle">{fund.fundName}</h3>
              <p><strong>Description:</strong> {fund.description}</p>
              <p><strong>AUM:</strong> ₹{fund.aum.toFixed(2)}</p>
              <p><strong>NAV:</strong> ₹{fund.nav.toFixed(2)}</p>
              <p><strong>Expense Ratio:</strong> {fund.expenseRatio}%</p>
              <p><strong>Annual Return:</strong> {fund.annualReturnRate}%</p>
              <p><strong>Created At:</strong> {formatDateTime(fund.createdAt)}</p>
              {fund.mutualFundStocks && fund.mutualFundStocks.length > 0 && (
                <div className="stock-list">
                  <strong>Stocks in Fund:</strong>
                  {fund.mutualFundStocks.map((s) => (
                    <div key={s.fStockId} className="stock-item">
                      {s.stock.companyName} — {s.allocationPercentage}%
                    </div>
                  ))}
                </div>
              )}

              <div className="action-buttons">
                <button
                  className="approve-btn"
                  onClick={() => handleFundStatus(fund.fundId, 2)}
                >
                  ✅ Approve
                </button>
                <button
                  className="reject-btn"
                  onClick={() => handleFundStatus(fund.fundId, 3)}
                >
                  ❌ Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {toast.message && toast.type && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: "", type: null })}
        />
      )}
    </div>
  );
};

export default FundRequest;
