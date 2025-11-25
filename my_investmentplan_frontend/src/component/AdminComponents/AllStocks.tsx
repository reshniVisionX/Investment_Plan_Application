import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../../store";
import { fetchAllStocks } from "../../slices/stockSlice";
import Toast, { type ToastType } from "../../utils/Toast";
import { StockSectorTypeMap } from "../../Types/Stock";
import "../../Styles/Admin/Stock.css";
import { useNavigate } from "react-router-dom";
import type { Stock } from "../../Types/Stock";

const AllStocks: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
 const user = useSelector((state: RootState) => state.auth.user);
 
  const { updates: stocks, loading } = useSelector(
    (state: RootState) => state.stocks
  );

  const [displayStocks, setDisplayStocks] = useState<Stock[]>([]);

  const [filters, setFilters] = useState({
    sort: "none",
    status: "all",
  });

  const [toast, setToast] = useState<{
    message: string;
    type: ToastType | null;
  }>({
    message: "",
    type: null,
  });

  useEffect(() => {
    if (!stocks || stocks.length === 0) {
       const shouldSubscribe = user?.roleName === "Investor";
      dispatch(fetchAllStocks({shouldSubscribe}));
    }
  }, [dispatch, stocks, user]);

  useEffect(() => {
    let filtered = [...stocks];
    if (filters.status !== "all") {
      const isActive = filters.status === "active";
      filtered = filtered.filter((s) => s.status === isActive);
    }

    if (filters.sort === "market-high") {
      filtered.sort((a, b) => b.currentMarketPrice - a.currentMarketPrice);
    } else if (filters.sort === "market-low") {
      filtered.sort((a, b) => a.currentMarketPrice - b.currentMarketPrice);
    } else if (filters.sort === "volume") {
      filtered.sort((a, b) => b.volumeTraded - a.volumeTraded);
    }

    setDisplayStocks(filtered);
  }, [stocks, filters]);

  const handleChange = (key: keyof typeof filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="stockview-container">
      <button
        type="button"
        className="addStock"
        onClick={() => navigate("/admin-dashboard/addstock")}
      >
        +
      </button>

      <h1 className="stockview-title">📊 Stock Data</h1>

      <div className="stockview-controls">
        <div className="stockview-filter">
          <label>Status:</label>
          <select
            value={filters.status}
            onChange={(e) => handleChange("status", e.target.value)}
            className="stockview-select"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="stockview-filter">
          <label>Sort by:</label>
          <select
            value={filters.sort}
            onChange={(e) => handleChange("sort", e.target.value)}
            className="stockview-select"
          >
            <option value="none">None</option>
            <option value="market-high">Market Price (High → Low)</option>
            <option value="market-low">Market Price (Low → High)</option>
            <option value="volume">Volume Traded</option>
          </select>
        </div>
      </div>

      {loading ? (
        <p className="stockview-loading">Loading stocks...</p>
      ) : displayStocks.length === 0 ? (
        <p className="stockview-loading">No stocks found.</p>
      ) : (
        <div className="stockview-grid">
          {displayStocks.map((stock) => {
            const totalPrice =
              stock.currentMarketPrice * stock.totalShares;
            const statusClass = stock.status
              ? "stockview-status-active"
              : "stockview-status-inactive";

            return (
              <div key={stock.stockId} className="stockview-card">
                <div className="stockview-header">
                  <h2>{stock.companyName}</h2>
                  <span className="stockview-symbol">{stock.stockSymbol}</span>
                </div>

                <div className="stockview-details">
                  <p>
                    <strong>Sector:</strong>{" "}
                    {StockSectorTypeMap[stock.sector]}
                  </p>
                  <p>
                    <strong>Base Price:</strong> ₹
                    {stock.basePrice.toFixed(2)}
                  </p>
                  <p>
                    <strong>Market Price:</strong> ₹
                    {stock.currentMarketPrice.toFixed(2)}
                  </p>
                  <p>
                    <strong>Volume Traded:</strong>{" "}
                    {stock.volumeTraded.toLocaleString()}
                  </p>
                  <p>
                    <strong>Total Shares:</strong>{" "}
                    {stock.totalShares.toLocaleString()}
                  </p>
                  <p>
                    <strong>Total Price:</strong> ₹
                    {totalPrice.toLocaleString()}
                  </p>

                  <p>
                    <strong>Status:</strong>{" "}
                    <span className={statusClass}>
                      {stock.status ? "Active" : "Inactive"}
                    </span>
                  </p>
                </div>
              </div>
            );
          })}
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

export default AllStocks;
