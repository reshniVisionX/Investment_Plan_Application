import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../../store";
import { fetchAllFunds } from "../../slices/fundSlice";
import { updateFundStatus } from "../../api/Service/admin.api";
import Toast, { type ToastType } from "../../utils/Toast";
import "../../Styles/Admin/Funds.css";
import { type Fund } from "../../Types/Fund";

const Funds: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);

  const { updates: funds, loading } = useSelector(
    (state: RootState) => state.funds
  );

  const [filter, setFilter] = useState<"all" | "1" | "2" | "3">("all");

  const [selectedStatus, setSelectedStatus] = useState<{ [id: number]: number }>(
    {}
  );

  const [toast, setToast] = useState<{
    message: string;
    type: ToastType | null;
  }>({
    message: "",
    type: null,
  });

  useEffect(() => {
    if (!funds || funds.length === 0) {
      const shouldSubscribe = user?.roleName === "Investor";
      dispatch(fetchAllFunds({ shouldSubscribe }));
    }
  }, [dispatch, funds, user]);

  const filteredFunds =
    filter === "all"
      ? funds
      : funds.filter((f) => f.status.toString() === filter);

  const submitStatusUpdate = async (fundId: number) => {
    const status = selectedStatus[fundId];
    if (!status) return;

    const res = await updateFundStatus(fundId, status);
    const shouldSubscribe = user?.roleName === "Investor";
    if (res.success) {
      setToast({ message: res.message, type: "success" });
      dispatch(fetchAllFunds({ shouldSubscribe }));
    } else {
      setToast({ message: res.message, type: "error" });
    }
  };

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 1:
        return <span className="status-badge pending">Pending</span>;
      case 2:
        return <span className="status-badge approved">Approved</span>;
      case 3:
        return <span className="status-badge rejected">Rejected</span>;
      default:
        return <span className="status-badge pending">Unknown</span>;
    }
  };

  return (
    <div className="admin-fund-page">
      <h1 className="admin-fund-title">📊 Mutual Funds</h1>

      <div className="admin-filter-box">
        <label className="admin-filter-label">Filter:</label>
        <select
          className="admin-filter-select"
          value={filter}
          onChange={(e) => setFilter(e.target.value as "all" | "1" | "2" | "3")}
        >
          <option value="all">All</option>
          <option value="1">Pending</option>
          <option value="2">Approved</option>
          <option value="3">Rejected</option>
        </select>
      </div>

      {loading ? (
        <p className="admin-fund-loading">Loading funds...</p>
      ) : filteredFunds.length > 0 ? (
        <div className="admin-fund-grid">
          {filteredFunds.map((fund: Fund) => (
            <div key={fund.fundId} className="admin-fund-card">


              <div className="admin-fund-header">
                <h2 className="admin-fund-name">{fund.fundName}</h2>
                <p className="admin-fund-desc">{fund.description}</p>
              </div>


              <div className="admin-fund-info">
                <p><strong>Nav:</strong> ₹ {fund.nav.toFixed(2)}</p>
                <p><strong>AUM:</strong> ₹ {fund.aum.toFixed(2)}</p>
                <p><strong>Total Units:</strong> {fund.totalUnits.toFixed(2)}</p>
                <p><strong>Status:</strong> {getStatusBadge(fund.status)}</p>
              </div>


              <div className="admin-status-container">
                <select
                  className="admin-status-select"
                  value={selectedStatus[fund.fundId] ?? ""}
                  onChange={(e) =>
                    setSelectedStatus((prev) => ({
                      ...prev,
                      [fund.fundId]: Number(e.target.value),
                    }))
                  }
                >
                  <option value="">Select Action</option>
                  <option value="2">Approve</option>
                  <option value="3">Reject</option>
                  <option value="1">Pending</option>
                </select>

                <button
                  className="admin-status-btn"
                  onClick={() => submitStatusUpdate(fund.fundId)}
                >
                  Submit
                </button>
              </div>

              <div className="admin-stock-allocation-box">
                <h3 className="admin-stock-allocation-title">Stock Allocation</h3>

                {fund.mutualFundStocks.length > 0 ? (
                  <ul className="admin-stock-list">
                    {fund.mutualFundStocks.map((fs) => (
                      <li key={fs.fStockId} className="admin-stock-item">
                        <span>
                          {fs.stock.companyName} ({fs.stock.stockSymbol})
                        </span>
                        <span>{fs.allocationPercentage}%</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="admin-no-stock">No Stocks Assigned</p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="admin-no-funds">No funds available.</p>
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

export default Funds;
