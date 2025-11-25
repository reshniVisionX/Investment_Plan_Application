import React, { useEffect, useState } from "react";
import Toast, { type ToastType } from "../../utils/Toast";
import { getAllFunds } from "../../api/Service/investor.api";
import { settleFund } from "../../api/Service/manager.api";
import { type Fund } from "../../Types/Fund";

import "../../Styles/Manager/SettleFunds.css";

const SettleFunds: React.FC = () => {
  const [funds, setFunds] = useState<Fund[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFund, setSelectedFund] = useState<Fund | null>(null);
 
  const [toast, setToast] = useState<{ message: string; type: ToastType | null }>({
    message: "",
    type: null,
  });

  const fetchFunds = async () => {
    setLoading(true);
    try {
      const result = await getAllFunds();
      const verifiedFunds = result.filter((f) => f.status === 2);
      setFunds(verifiedFunds);
    } catch (error) {
      setToast({ message: (error as Error).message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {

    fetchFunds();
  }, []);

  const handleSettle = async () => {
    if (!selectedFund) return;
    try {
      const res = await settleFund(selectedFund.fundId);
      setToast({
        message: res.message || "Fund settled successfully!",
        type: res.Success ? "success" : "error",
      });
      fetchFunds();
      setSelectedFund(null);
    } catch (error) {
      setToast({ message: (error as Error).message, type: "error" });
    }
  };

 

  return (
    <div className="settlefunds-container">
      <header className="settlefunds-header">
        <h1 className="settlefunds-title">💰 Mutual Fund Management</h1>
        <p className="settlefunds-subtitle">View, Settle, or Redeem verified funds.</p>
      </header>

      {loading ? (
        <p className="settlefunds-loading">Loading funds...</p>
      ) : funds.length > 0 ? (
        <div className="settlefunds-grid">
          {funds.map((fund) => (
            <div
              key={fund.fundId}
              className="settlefunds-card"
              onClick={() => setSelectedFund(fund)}
            >
              <h2 className="settlefunds-name">{fund.fundName}</h2>
              <p><strong>Expense Ratio:</strong> {fund.expenseRatio}%</p>
              <p><strong>NAV:</strong> ₹{fund.nav.toFixed(2)}</p>
             
              <p><strong>Min Investment:</strong> ₹{fund.minInvestmentAmount}</p>
              <p><strong>Annual Return:</strong> {fund.annualReturnRate}%</p>
            </div>
          ))}
        </div>

      ) : (
        <p className="settlefunds-empty">No verified funds available.</p>
      )}

     
      {selectedFund && (
        <div className="settlefunds-modal-overlay" onClick={() => setSelectedFund(null)}>
          <div className="settlefunds-modal" onClick={(e) => e.stopPropagation()}>
            <h2>{selectedFund.fundName}</h2>
            <p><strong>Description:</strong> {selectedFund.description}</p>
            <p><strong>NAV:</strong> ₹{selectedFund.nav.toFixed(2)}</p>
            <p><strong>AUM:</strong> ₹{selectedFund.aum.toLocaleString()}</p>
            <p><strong>Total Units:</strong> {selectedFund.totalUnits.toLocaleString()}</p>
            <p><strong>Amount Received:</strong> ₹{selectedFund.amountReceived?.toLocaleString() || 0}</p>
            <p><strong>Amount Pending:</strong> ₹{selectedFund.amountPending?.toLocaleString() || 0}</p>

            

            <div className="settlefunds-actions">
              <button className="btn-settle" onClick={handleSettle}>🟢 Settle</button>
              
              <button className="btn-close" onClick={() => setSelectedFund(null)}>❌ Close</button>
            </div>
          </div>
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

export default SettleFunds;
