import React, { useEffect, useState } from "react";
import { getAllFundTransactionsById } from "../../api/Service/investor.api";
import type { FundTransaction } from "../../Types/FundTransaction";
import { tokenstore } from "../../auth/tokenstore";
import Toast, { type ToastType } from "../../utils/Toast";
import "../../Styles/Transactions.css";
import { formatDateTime } from "../../utils/FormatDate";

const FundTransactions: React.FC = () => {
  const [transactions, setTransactions] = useState<FundTransaction[]>([]);
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
        const result = await getAllFundTransactionsById(investor.publicInvestorId);
        setTransactions(result);
      } catch (error) {
        setToast({ message: (error as Error).message, type: "error" });
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, []);

  return (
    <div className="transactions-container">
      <h2>📜 Fund Transactions</h2>
      {loading ? (
        <p>Loading fund transactions...</p>
      ) : transactions.length > 0 ? (
        <table className="transactions-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Amount</th>
              <th>NAV</th>
              <th>Units</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t) => (
              <tr key={t.transactionId}>
                <td>{t.fundName}</td>
                <td>{t.fundTransactionType === 1 ? "BUY" : "SELL"}</td>
                <td>₹{t.transactionAmount.toFixed(2)}</td>
                <td>{t.navAtTransaction}</td>
                <td>{t.unitsTransacted.toFixed(4)}</td>
                <td>{formatDateTime(t.transactionDate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No fund transactions found.</p>
      )}

      {toast.message && toast.type && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: null })} />
      )}
    </div>
  );
};

export default FundTransactions;
