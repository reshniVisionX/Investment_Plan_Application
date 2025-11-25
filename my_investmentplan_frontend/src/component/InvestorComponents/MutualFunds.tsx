import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../../store";
import { fetchAllFunds } from "../../slices/fundSlice";
import Toast, { type ToastType } from "../../utils/Toast";
import { purchaseFund } from "../../api/Service/investor.api";
import "../../Styles/MutualFunds.css";
import { type Fund } from "../../Types/Fund";

const MutualFunds: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);

  const { updates: funds, loading } = useSelector(
    (state: RootState) => state.funds
  );
  const verifiedFunds = funds.filter(f => f.status === 2);
  const [selectedFund, setSelectedFund] = useState<Fund | null>(null);
  const [investmentAmount, setInvestmentAmount] = useState<number>(0);
  const [toast, setToast] = useState<{ message: string; type: ToastType | null }>({
    message: "",
    type: null,
  });

  useEffect(() => {
    if (!funds || funds.length === 0) {
      const shouldSubscribe = user?.roleName === "Investor";
      dispatch(fetchAllFunds({ shouldSubscribe }));
    }
  }, [dispatch, funds, user]);

  const handleProceed = async () => {
    if (!selectedFund) return;

    if (!user) {
      setToast({ message: "Investor not found.", type: "error" });
      return;
    }
    if (!user.publicInvestorId) {
      setToast({ message: "Investor ID not found.", type: "error" });
      return;
    }
    if (investmentAmount <= 0) {
      setToast({ message: "Enter a valid amount.", type: "error" });
      return;
    }

    try {
      await purchaseFund({
        publicInvestorId: user.publicInvestorId,
        fundId: selectedFund.fundId,
        transactionAmount: investmentAmount,
        fundTransactionType: 1,
      });

      setToast({
        message: `Successfully purchased ${selectedFund.fundName} for ₹${investmentAmount}.`,
        type: "success",
      });

      setSelectedFund(null);
      setInvestmentAmount(0);
    } catch (error) {
      setToast({ message: (error as Error).message, type: "error" });
    }
  };

  return (
    <div className="mf-dashboard-container-new">
      <h1 className="mf-dashboard-title-new">💰 Available Mutual Funds</h1>

      {loading ? (
        <p className="mf-loading-text-new">Loading funds...</p>
      ) : funds.length > 0 ? (
        <div className="mf-fund-grid-new">
          {verifiedFunds.map((fund) => (
            <div key={fund.fundId} className="mf-fund-card-new">
              <div className="mf-fund-data-new">
                <h2 className="mf-fund-name-new">{fund.fundName}</h2>

                <p className="mf-fund-detail-new">{fund.description}</p>

                <p className="mf-fund-detail-new">
                  <strong>Minimum Investment:</strong> ₹{fund.minInvestmentAmount}
                </p>

                <p className="mf-fund-detail-new">
                  <strong>NAV:</strong>{" "}
                  <span
                    className={
                      fund.isUp === true
                        ? "mf-nav-up-new"
                        : fund.isUp === false
                          ? "mf-nav-down-new"
                          : "mf-nav-neutral-new"
                    }
                  >
                    ₹{fund.nav.toFixed(2)}
                  </span>
                </p>

                <p className="mf-fund-detail-new">
                  <strong>Annual Return:</strong> {fund.annualReturnRate}%
                </p>

                <button
                  type="button"
                  className="mf-btn-buy-new"
                  onClick={() => setSelectedFund(fund)}
                >
                  BUY
                </button>
                
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="mf-no-funds-new">No verified funds available.</p>
      )}

      {/* Modal */}
      {selectedFund && (
        <div className="mf-modal-overlay-new" onClick={() => setSelectedFund(null)}>
          <div className="mf-modal-box-new" onClick={(e) => e.stopPropagation()}>
            <h2 className="mf-modal-title-new">{selectedFund.fundName}</h2>

            <p className="mf-modal-detail-new">
              <strong>NAV:</strong> ₹{selectedFund.nav.toFixed(2)}
            </p>
            <p className="mf-modal-detail-new">
              <strong>AUM:</strong> ₹{selectedFund.aum.toLocaleString()}
            </p>
            <p className="mf-modal-detail-new">
              <strong>Expense Ratio:</strong> {selectedFund.expenseRatio}%
            </p>
            <p className="mf-modal-detail-new">
              <strong>Total Units:</strong> {selectedFund.totalUnits.toLocaleString()}
            </p>
            <p className="mf-modal-detail-new">
               <strong>Minimum Investment:</strong> ₹{selectedFund.minInvestmentAmount}
</p>

            <div className="mf-modal-actions-new">
              <input
                type={investmentAmount ? "number" : "text"}
                className="mf-input-box-new"
                placeholder="Enter investment amount"
                value={investmentAmount || ""}
                onChange={(e) => {
                  const value = e.target.value;

                  if (value === "") {
                    setInvestmentAmount(0);
                    return;
                  }

                  const numericValue = Number(value);
                  if (!isNaN(numericValue)) {
                    setInvestmentAmount(numericValue);
                  }
                }}
              />

              <button className="mf-btn-proceed-new" onClick={handleProceed}>
                PAY
              </button>
              <button className="mf-btn-close-new" onClick={() => setSelectedFund(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

     
      {toast.message && (
        <Toast
          message={toast.message}
          type={toast.type!}
          onClose={() => setToast({ message: "", type: null })}
        />
      )}
    </div>
  );
};

export default MutualFunds;
