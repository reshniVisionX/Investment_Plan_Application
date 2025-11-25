import React, { useEffect, useState } from "react";
import { getAllStockTransactionsById } from "../../api/Service/investor.api";
import type { StockTransaction } from "../../Types/StockTransaction";
import { tokenstore } from "../../auth/tokenstore";
import Toast, { type ToastType } from "../../utils/Toast";
import "../../Styles/Transactions.css";
import { formatDateTime } from "../../utils/FormatDate";

const StockTransactions: React.FC = () => {
  const [transactions, setTransactions] = useState<StockTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType | null }>({
    message: "",
    type: null,
  });

  useEffect(() => {
    const fetchTransactions = async () => {
      const investor = tokenstore.getInvestor();
      if (!investor) {
        setToast({ message: "Investor not found in session.", type: "error" });
        return;
      }
      setLoading(true);
      try {
        const result = await getAllStockTransactionsById(investor.publicInvestorId);
        setTransactions(result);
      } catch (error) {
        console.log("Stock transaction ",error);
        setToast({ message: (error as Error).message, type: "error" });
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  return (
    <div className="transactions-container">
      <h2>🧾 Stock Transactions</h2>
      {loading ? (
        <p>Loading transactions...</p>
      ) : transactions.length > 0 ? (
        <table className="transactions-table">
          <thead>
            <tr>
              <th>Stock ID</th>
              <th>Type</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Total Value</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t.transactionId}>
                <td>{t.stockSymbol}</td>
                <td>{t.transactionType === 1 ? "BUY" : "SELL"}</td>
                <td>{t.quantity}</td>
                <td>₹{t.price.toFixed(2)}</td>
                <td>₹{t.totalValue.toFixed(2)}</td>
                <td>{formatDateTime(t.transactionDate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No stock transactions found.</p>
      )}

      {toast.message && toast.type && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: null })} />
      )}
    </div>
  );
};

export default StockTransactions;
