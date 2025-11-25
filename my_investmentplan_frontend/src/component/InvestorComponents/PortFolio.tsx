import React, { useCallback, useEffect, useState } from "react";
import { getCompletePortfolio, redeemFund } from "../../api/Service/investor.api";
import { useSelector} from "react-redux";
import type { RootState } from "../../store";
import Toast, { type ToastType } from "../../utils/Toast";
import "../../Styles/Portfolio.css";
import { formatDateTime } from "../../utils/FormatDate";
import type { Portfolio } from "../../Types/Portfolio";
import type { FundOfInvestor } from "../../Types/FundOfInvestor";
import { StockSectorTypeMap } from "../../Types/Stock";
import { performTransaction } from "../../api/Service/investor.api";
import { TransactionType } from "../../Types/Transaction";

const PortfolioPage: React.FC = () => {
  const [stockPortfolio, setStockPortfolio] = useState<Portfolio[]>([]);
  const [mutualFunds, setMutualFunds] = useState<FundOfInvestor[]>([]);
  const [loading, setLoading] = useState(false);
 const user = useSelector((state: RootState) => state.auth.user);

  const [toast, setToast] = useState<{ message: string; type: ToastType | null }>({
    message: "",
    type: null,
  });

  const [selectedStock, setSelectedStock] = useState<Portfolio | null>(null);
  const [sellQty, setSellQty] = useState<number>(0);

  const [selectedFund, setSelectedFund] = useState<FundOfInvestor | null>(null);
  const [redeemAmount, setRedeemAmount] = useState<number>(0);

 
  const stockSummary = (() => {
    const totalInvested = stockPortfolio.reduce(
      (sum, p) => sum + p.avgBuyPrice * p.quantity,
      0
    );
    const totalCurrentValue = stockPortfolio.reduce(
      (sum, p) => sum + p.currentValue,
      0
    );
    const totalProfit = stockPortfolio.reduce((sum, p) => sum + p.profitLoss, 0);

    return { totalInvested, totalCurrentValue, totalProfit };
  })();

  const fundSummary = (() => {
    const totalInvested = mutualFunds.reduce((sum, f) => sum + f.totalInvested, 0);
    const totalCurrentValue = mutualFunds.reduce((sum, f) => sum + f.currentValue, 0);
    const totalProfit = mutualFunds.reduce((sum, f) => sum + f.profitLoss, 0);

    return { totalInvested, totalCurrentValue, totalProfit };
  })();

 
const fetchPortfolio = useCallback(async () => {
  if (!user?.publicInvestorId) return;

  setLoading(true);
  try {
    const res = await getCompletePortfolio(user.publicInvestorId);
    if (!res.success) {
      setToast({ message: res.message ?? "No portfolio records found.", type: "error" });
      return;
    }
    setStockPortfolio(res.data.stocks || []);
    setMutualFunds(res.data.mutualFunds || []);
  } finally {
    setLoading(false);
  }
}, [user]);

useEffect(() => {
  fetchPortfolio();
}, [fetchPortfolio]);


  const handleStockSell = async () => {
    if (!selectedStock) return;

    if (sellQty <= 0 || sellQty > selectedStock.quantity) {
      setToast({ message: "Invalid quantity.", type: "error" });
      return;
    }

    const investor = user?.publicInvestorId;
        if (!investor) {
          setToast({ message: "Investor not found in session.", type: "error" });
          return;
        }
    
        try {
    
          await performTransaction({
            publicInvestorId: investor,
            stockId: selectedStock.stockId,
            transactionType: TransactionType.SELL,
            quantity : sellQty,
          });
    
          setToast({
            message: "Stock sold successfully!",
            type: "success",
          });
    fetchPortfolio();
          setSelectedStock(null);
         
        } catch (error) {
          setToast({ message: (error as Error).message, type: "error" });
        }
    setToast({
      message: "Stock sold successfully!",
      type: "success",
    });

    setSelectedStock(null);
    setSellQty(0);
  };


  const handleFundRedeem = async () => {
    if (!selectedFund) return;

    if (redeemAmount <= 0 || redeemAmount > selectedFund.currentValue) {
      setToast({ message: "Invalid redeem amount.", type: "error" });
      return;
    }

    const investor = user?.publicInvestorId;
    if (!investor) {
      setToast({ message: "Investor not authenticated.", type: "error" });
      return;
    }

    const payload = {
      investorId: user.publicInvestorId,
      fundId: selectedFund.fundId,
      redeemAmount: redeemAmount,
    };

    const res = await redeemFund(payload);

 if (!res.success) {
  setToast({ message: res.message ?? "Error in redeem.", type: "error" });
  return;
}


    setToast({ message: "Redeem successful!", type: "success" });
   fetchPortfolio();
    setSelectedFund(null);
    setRedeemAmount(0);
  };

  return (
    <div className="portfolio-wrapper">

    
      <div className="portfolio-summary-section">
        <h3 className="portfolio-summary-heading">📈My Stocks</h3>

        <div className="portfolio-summary-card">
          <div className="portfolio-summary-item">
            <span>Total Invested : </span>
            <strong>₹{stockSummary.totalInvested.toFixed(2)}</strong>
          </div>
          <div className="portfolio-summary-item">
            <span>Current Value : </span>
            <strong>₹{stockSummary.totalCurrentValue.toFixed(2)}</strong>
          </div>
          <div className="portfolio-summary-item">
            <span>P/L : </span>
            <strong
              className={
                stockSummary.totalProfit >= 0
                  ? "summary-profit-positive"
                  : "summary-profit-negative"
              }
            >
              ₹{stockSummary.totalProfit.toFixed(2)}
            </strong>
          </div>
        </div>
      </div>

      <div className="portfolio-stock-section">

        {loading ? (
          <p className="portfolio-loading">Loading...</p>
        ) : stockPortfolio.length === 0 ? (
          <p className="portfolio-empty">No stocks found.</p>
        ) : (
          <div className="portfolio-stock-grid">
            {stockPortfolio.map((p) => {
              const isProfitable = p.currentValue >= (p.avgBuyPrice * p.quantity);
              const isNSE = p.sector === 1; 
              const isBSE = p.sector === 2; 
              
              return (
                <div 
                  className={`portfolio-stock-card ${isNSE ? 'nse-stock' : ''} ${isBSE ? 'bse-stock' : ''}`} 
                  key={p.portfolioId}
                >

                  <div className="portfolio-stock-header">
                    <span className="portfolio-stock-symbol">{p.stockSymbol}</span>
                    <span className="portfolio-stock-sector">{StockSectorTypeMap[p.sector]}</span>
                  </div>

                  <div className="portfolio-stock-body">
                    <div className="portfolio-stock-left">
                      <div className="portfolio-label">Qty: <strong className="stock-value">{p.quantity}</strong></div>
                      <div className="portfolio-label">Avg Buy: <strong className="stock-value">₹{p.avgBuyPrice.toFixed(2)}</strong></div>
                      <div className="portfolio-label">Invested: <strong className="stock-value">₹{(p.avgBuyPrice * p.quantity).toFixed(2)}</strong></div>
                    </div>

                    <div className="portfolio-stock-right">
                      <div>
                        <strong
                          className={isProfitable ? "stock-value-positive" : "stock-value-negative"}
                        >
                          Change: {(
                            (p.profitLoss / (p.avgBuyPrice * p.quantity)) * 100
                          ).toFixed(2)}
                          %
                        </strong>
                      </div>

                      <div>
                        <strong className={isProfitable ? "stock-value-positive" : "stock-value-negative"}>
                          LTP: ₹{p.currentMarketPrice.toFixed(2)}
                        </strong>
                      </div>

                      <div>
                        <strong className={isProfitable ? "stock-value-positive" : "stock-value-negative"}>
                          Current: ₹{p.currentValue.toFixed(2)}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div className="portfolio-date-btn">
                    <div className="portfolio-stock-date">bought at: {formatDateTime(p.boughtAt)}</div>
                    <button 
                      type="button" 
                      className="stock-sell-btn"
                      onClick={() => setSelectedStock(p)}
                    >
                      SELL
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="portfolio-summary-section">
        <h3 className="portfolio-summary-heading">🏦My Mutual Funds</h3>

        <div className="portfolio-summary-card">
          <div className="portfolio-summary-item">
            <span>Total Invested : </span>
            <strong className="stock-value">₹{fundSummary.totalInvested.toFixed(2)}</strong>
          </div>
          <div className="portfolio-summary-item">
            <span>Current Value : </span>
            <strong className="stock-value">₹{fundSummary.totalCurrentValue.toFixed(2)}</strong>
          </div>
          <div className="portfolio-summary-item">
            <span>P/L : </span>
            <strong
              className={
                fundSummary.totalProfit >= 0
                  ? "summary-profit-positive"
                  : "summary-profit-negative"
              }
            >
              ₹{fundSummary.totalProfit.toFixed(2)}
            </strong>
          </div>
        </div>
      </div>

      <div className="portfolio-fund-section">
        {mutualFunds.length === 0 ? (
          <p className="portfolio-empty">No mutual funds found.</p>
        ) : (
          <div className="portfolio-fund-grid">
            {mutualFunds.map((f) => {
              const isFundProfitable = f.currentValue >= f.totalInvested;
              
              return (
                <div className="portfolio-fund-card" key={f.investId}>

                  <div className="portfolio-fund-header">
                    <div className="portfolio-fund-name">{f.fundName}</div>
                  </div>

                  <div className="portfolio-fund-row">

                    <div className="portfolio-fund-left">
                      <div className="portfolio-label">
                        NAV: <span className="portfolio-fund-value"><strong className="stock-value">₹{f.nav.toFixed(2)}</strong></span>
                      </div>

                      <div className="portfolio-label">
                        Invested: <span className="portfolio-fund-value"><strong className="stock-value">₹{f.totalInvested.toFixed(2)}</strong></span>
                      </div>
                    </div>

                    <div className="portfolio-fund-right">
                      <div className={isFundProfitable ? "fund-value-positive" : "fund-value-negative"}>
                        P/L: <strong>₹{f.profitLoss.toFixed(2)}</strong>
                      </div>
                      <div className={isFundProfitable ? "fund-value-positive" : "fund-value-negative"}>
                        Current: <span className="portfolio-fund-value">₹{f.currentValue.toFixed(2)}</span>
                      </div>
                    </div>

                  </div>

                  <div className="portfolio-date-btn">
                    <div className="portfolio-fund-dates">
                      <div className="portfolio-stock-date">Started: {formatDateTime(f.startDate)}</div>
                      <div className="portfolio-stock-date">Updated: {formatDateTime(f.updatedAt)}</div>
                    </div>

                    <div className="portfolio-fund-btns">
                      <button 
                        type="button" 
                        className="funbtn"
                        onClick={() => setSelectedFund(f)}
                      >
                        REDEEM
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedStock && (
        <div className="sell-modal-overlay" onClick={() => setSelectedStock(null)}>
          <div className="sell-modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>Sell {selectedStock.stockSymbol}</h3>

            <p><strong>Quantity You Hold:</strong> {selectedStock.quantity}</p>

            <input
              type="number"
              placeholder="Enter qty to sell"
              className="sell-input"
              value={sellQty || ""}
              onChange={(e) => setSellQty(Number(e.target.value))}
            />

            <div className="sell-modal-actions">
              <button className="sell-submit-btn" onClick={handleStockSell}>
                Confirm Sell
              </button>
              <button className="sell-cancel-btn" onClick={() => setSelectedStock(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedFund && (
        <div className="redeem-modal-overlay" onClick={() => setSelectedFund(null)}>
          <div className="redeem-modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>Redeem {selectedFund.fundName}</h3>

            <p><strong>Current Value:</strong> ₹{selectedFund.currentValue.toFixed(2)}</p>
            <p><strong>Invested Amount:</strong> ₹{selectedFund.totalInvested.toFixed(2)}</p>

            <input
              type="number"
              placeholder="Enter amount to redeem"
              className="redeem-input"
              value={redeemAmount || ""}
              onChange={(e) => setRedeemAmount(Number(e.target.value))}
            />

            <div className="redeem-modal-actions">
              <button className="redeem-submit-btn" onClick={handleFundRedeem}>
                Confirm Redeem
              </button>
              <button className="redeem-cancel-btn" onClick={() => setSelectedFund(null)}>
                Cancel
              </button>
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

export default PortfolioPage;
