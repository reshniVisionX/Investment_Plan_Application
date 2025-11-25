import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../../store";
import { fetchAllStocks } from "../../slices/stockSlice";
import type { Stock } from "../../Types/Stock";
import { TransactionType } from "../../Types/Transaction";
import Toast, { type ToastType } from "../../utils/Toast";
import "../../Styles/Stocks.css";
import { StockSectorTypeMap } from "../../Types/Stock";
import { performTransaction } from "../../api/Service/investor.api";
import { formatDateTime } from "../../utils/FormatDate";

const Stocks: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { updates: stocks, loading } = useSelector((state: RootState) => state.stocks);
 const user = useSelector((state: RootState) => state.auth.user);

  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [tradeType, setTradeType] = useState<TransactionType | null>(null);
  const [quantity, setQuantity] = useState<number>(0);
  const [toast, setToast] = useState<{ message: string; type: ToastType | null }>({
    message: "",
    type: null,
  });


  useEffect(() => {
    if (!stocks || stocks.length === 0) {
    const shouldSubscribe = user?.roleName === "Investor";
      dispatch(fetchAllStocks({shouldSubscribe}));

    }
  }, [dispatch, stocks, user]);


  const handleProceed = async () => {
    if (!selectedStock || !tradeType) return;
    if (quantity <= 0) {
      setToast({ message: "Please enter a valid quantity.", type: "error" });
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
        transactionType: tradeType,
        quantity,
      });

      setToast({
        message:
          tradeType === TransactionType.BUY
            ? "Stock purchase successful!"
            : "Stock sold successfully!",
        type: "success",
      });

      setSelectedStock(null);
      setTradeType(null);
      setQuantity(0);
    } catch (error) {
      setToast({ message: (error as Error).message, type: "error" });
    }
  };

  const totalPrice =
    selectedStock && quantity > 0
      ? (selectedStock.currentMarketPrice * quantity).toFixed(2)
      : "0.00";

  return (
    <div className="stockscontainer">
      <h1 className="stockstitle">📈 All Stocks</h1>

      {loading ? (
        <p className="loading-text">Loading stocks...</p>
      ) : (
        <div className="stocksgrid">
          {stocks.map((stock) => {

            return (
              <div
                key={stock.stockId}
                className={`stockcard `}
                onClick={() => setSelectedStock(stock)}
              >
                <div className="stock-header">
                  <h2>{stock.companyName}</h2>
                  <span className="stock-symbol">{stock.stockSymbol}</span>
                </div>
                <div className="stock-details">
                  <p>
                    <strong>Sector:</strong> {StockSectorTypeMap[stock.sector]}
                  </p>
                  <p className={stock.isUp ? "price-up" : stock.isUp === false ? "price-down" : ""}>
                    <strong>Market Price:</strong> ₹{stock.currentMarketPrice}
                  </p>


                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedStock && !tradeType && (
        <div className="modal-overlay" onClick={() => setSelectedStock(null)}>
          <div className="stock-modal-box" onClick={(e) => e.stopPropagation()}>
            <h2 className="model-stock-title">{selectedStock.stockSymbol}</h2>

            <p>
              <strong>Sector:</strong> {StockSectorTypeMap[selectedStock.sector]}
            </p>
            <p>
              <strong>Base Price:</strong> ₹{selectedStock.basePrice.toFixed(2)}
            </p>
            <p>
              <strong>Market Price:</strong> ₹{selectedStock.currentMarketPrice}
            </p>
            <p>
              <strong>Available Shares:</strong>{" "}
              {(selectedStock.totalShares-selectedStock.volumeTraded).toLocaleString()}
            </p>
            
            <p>
              <strong>Listed Date:</strong>{" "}
              {formatDateTime(selectedStock.listedDate)}
            </p>
            <div className="modal-actions">
              <button className="btnbuy" onClick={() => setTradeType(TransactionType.BUY)}>
                BUY
              </button>
              <button className="btnsell" onClick={() => setTradeType(TransactionType.SELL)}>
                SELL
              </button>
              <button className="btnclose" onClick={() => setSelectedStock(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedStock && tradeType && (
        <div className="modal-overlay" onClick={() => setTradeType(null)}>
          <div className="stock-modal-box" onClick={(e) => e.stopPropagation()}>
            <h2 className="model-stock-title">
              {tradeType === TransactionType.BUY ? "Buy" : "Sell"}{" "}
              {selectedStock.companyName}
            </h2>
            <p>
              <strong>Current Price:</strong> ₹{selectedStock.currentMarketPrice}
            </p>

            <div className="form-group">

              <input
                type={quantity ? "number" : "text"}
                className="input-box"
                placeholder="Enter quantity"
                value={quantity || ""}
                onChange={(e) => {
                  const value = e.target.value;

                  if (value === "") {
                    setQuantity(0);
                    return;
                  }
                  const numericValue = Number(value);
                  if (!isNaN(numericValue)) {
                    setQuantity(numericValue);
                  }
                }}
              />

            </div>

            <p className="total-price">
              <strong>Total:</strong> ₹{totalPrice}
            </p>

            <div className="modal-actions">
              <button className="btn-proceed" onClick={handleProceed}>
                Proceed
              </button>
              <button className="btnclose" onClick={() => setTradeType(null)}>
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

export default Stocks;
