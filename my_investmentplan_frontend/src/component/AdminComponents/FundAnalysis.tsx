import React, { useEffect, useState } from "react";
import { getAllFundReports } from "../../api/Service/admin.api";
import type { FundReport, StockAllocations } from "../../Types/ManagerDTO/FundReport";
import { StockSectorTypeMap } from "../../Types/Stock";
import "../../Styles/Admin/FundAnalysis.css";

const FundAnalysis: React.FC = () => {
  const [funds, setFunds] = useState<FundReport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedFund, setSelectedFund] = useState<FundReport | null>(null);

  useEffect(() => {
    const fetchFunds = async () => {
      try {
        const data: FundReport[] = await getAllFundReports();
        setFunds(data);
      } catch (err) {
        console.error("Failed to fetch fund reports:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFunds();
  }, []);

  const handleOpenModal = (fund: FundReport) => setSelectedFund(fund);
  const handleCloseModal = () => setSelectedFund(null);

  if (loading) {
    return <div className="fund-loader">Loading fund reports...</div>;
  }

  return (
    <div className="fund-analysis-container">
      <h2 className="fund-analysis-title">📊 Fund Analysis</h2>
      <p className="fund-analysis-subtitle">
        Review performance metrics and analyze portfolio holdings.
      </p>

      <div className="fund-card-grid">
        {funds.map((fund, index) => (
          <div
            key={index}
            className="fund-card-analysis"
            onClick={() => handleOpenModal(fund)}
          >
            <h3 className="fund-name-analysis">{fund.fundName}</h3>

            <div className="fund-stats-analysis">
              <div className="fund-stat-analysis">
                <span className="stat-label">NAV</span>
                <span className="stat-value">₹{fund.nav.toFixed(2)}</span>
              </div>

              <div className="fund-stat-analysis">
                <span className="stat-label">AUM</span>
                <span className="stat-value">
                  ₹{fund.aum.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="fund-stat-analysis">
                <span className="stat-label">Total Invested</span>
                <span className="stat-value">
                  ₹{fund.totalInvested.toFixed(2)}
                </span>
              </div>

              <div className="fund-stat-analysis">
                <span className="stat-label">Current Value</span>
                <span className="stat-value">
                  ₹{fund.currentValue.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="fund-stat-analysis">
                <span className="stat-label">Investors</span>
                <span className="stat-value">{fund.noOfInvestors}</span>
              </div>

              <div className="fund-stat-analysis">
                <span className="stat-label">Profit/Loss</span>
                <span
                  className={`stat-value ${
                    fund.profitLoss >= 0 ? "profit" : "loss"
                  }`}
                >
                  ₹{fund.profitLoss.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedFund && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div
            className="modal-box"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="modal-title">
              🏦 {selectedFund.fundName} — Stock Allocations
            </h3>

            {selectedFund.stocks && selectedFund.stocks.length > 0 ? (
              <div className="stock-list">
                {selectedFund.stocks.map((stock: StockAllocations, idx) => (
                  <div key={idx} className="stock-card">
                    <div className="stock-header">
                      <strong>{stock.stockName}</strong>
                    </div>

                    <div className="stock-details">
                      <p>
                        <b>Exchange:</b>{" "}
                        {StockSectorTypeMap[stock.sector] || "Unknown"}
                      </p>

                      <p>
                        <b>Market Price:</b> ₹{stock.marketPrice.toFixed(2)}
                      </p>

                      <p>
                        <b>Allocation %:</b> {stock.allocationPercentage}%
                      </p>

                      <p>
                        <b>Total Amount Invested:</b>{" "}
                        ₹{stock.totalAmountInvested.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-stocks">No stock allocation data available.</p>
            )}

            <button className="close-btn" onClick={handleCloseModal}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FundAnalysis;
