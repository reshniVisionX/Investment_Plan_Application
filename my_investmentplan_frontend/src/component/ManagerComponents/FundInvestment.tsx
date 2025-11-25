import React, { useEffect, useState } from "react";
import "../../Styles/Manager/FundInvestments.css";
import Toast, { type ToastType } from "../../utils/Toast";
import { createFund } from "../../api/Service/manager.api";
import { getAllStocks } from "../../api/Service/investor.api";
import type { FundFormData } from "../../Types/ManagerDTO/FundFormData";
import type { Stock } from "../../Types/Stock";
import MutualFunds from "../InvestorComponents/MutualFunds";

const FundInvestment: React.FC = () => {
  const [fundData, setFundData] = useState<FundFormData>({
    fundName: "",
    description: "",
    expenseRatio: "1",
    aum: "1000000",
    nav: "10",
    totalUnits: "100000",
    minInvestmentAmount: "1000",
    annualReturnRate: "10",
    logo: "",
    stocks: [{ stockId: "", allocationPercentage: "" }],
  });

  const [availableStocks, setAvailableStocks] = useState<Stock[]>([]);
  const [toast, setToast] = useState<{ message: string; type: ToastType | null }>({
    message: "",
    type: null,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const data = await getAllStocks();
        setAvailableStocks(data);
      } catch (err) {
        setToast({ message: (err as Error).message, type: "error" });
      }
    };
    fetchStocks();
  }, []);

  const handleAddStock = () => {
    setFundData((prev) => ({
      ...prev,
      stocks: [...prev.stocks, { stockId: "", allocationPercentage: "" }],
    }));
  };

  const handleRemoveStock = (index: number) => {
    setFundData((prev) => ({
      ...prev,
      stocks: prev.stocks.filter((_, i) => i !== index),
    }));
  };

  const handleStockChange = (index: number, key: string, value: string) => {
    const updated = [...fundData.stocks];
    updated[index] = { ...updated[index], [key]: value };
    setFundData((prev) => ({ ...prev, stocks: updated }));
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name === "logo" && e.target instanceof HTMLInputElement && e.target.files) {
      const file = e.target.files[0];
      setFundData((prev) => ({ ...prev, logo: file }));
      return;
    }
    setFundData((prev) => ({ ...prev, [name]: value }));
  }

  const handleCreateFund = async () => {
    const {
      fundName,
      description,
      expenseRatio,
      aum,
      nav,
      totalUnits,
      minInvestmentAmount,
      annualReturnRate,
      stocks,
    } = fundData;


    if (
      !fundName ||
      !description ||
      !expenseRatio ||
      !aum ||
      !nav ||
      !totalUnits ||
      !minInvestmentAmount ||
      !annualReturnRate
    ) {
      setToast({ message: "Please fill all required fields.", type: "error" });
      return;
    }

    const numericFields = [
      { label: "Expense Ratio", value: expenseRatio },
      { label: "AUM", value: aum },
      { label: "NAV", value: nav },
      { label: "Total Units", value: totalUnits },
      { label: "Annual Return Rate", value: annualReturnRate },
    ];

    for (const field of numericFields) {
      if (Number(field.value) < 0) {
        setToast({ message: `${field.label} cannot be negative`, type: "error" });
        return;
      }
    }

    if (Number(minInvestmentAmount) < 1000) {
      setToast({
        message: "Minimum Investment Amount must be greater than ₹1000",
        type: "error",
      });
      return;
    }

    if (stocks.length === 0) {
      setToast({ message: "At least one stock must be added", type: "error" });
      return;
    }

    for (let i = 0; i < stocks.length; i++) {
      const s = stocks[i];

      if (!s.stockId) {
        setToast({ message: `Select a stock for row ${i + 1}`, type: "error" });
        return;
      }

      if (!s.allocationPercentage) {
        setToast({ message: `Enter allocation % for row ${i + 1}`, type: "error" });
        return;
      }

      if (Number(s.allocationPercentage) < 10) {
        setToast({
          message: `Allocation % for row ${i + 1} must be greater than 10`,
          type: "error",
        });
        return;
      }
    }
    const totalAllocation = stocks.reduce(
      (sum, s) => sum + Number(s.allocationPercentage),
      0
    );

    if (totalAllocation !== 100) {
      setToast({
        message: `Total Allocation must be exactly 100%. Currently: ${totalAllocation}%`,
        type: "error",
      });
      return;
    }

    const stockIds = stocks.map((s) => s.stockId);
    if (new Set(stockIds).size !== stockIds.length) {
      setToast({ message: "Stock names must be unique", type: "error" });
      return;
    }

    setLoading(true);

    try {
      const fd = new FormData();
      fd.append("FundName", fundName);
      fd.append("Description", description);
      fd.append("ExpenseRatio", expenseRatio);
      fd.append("AUM", aum);
      fd.append("NAV", nav);
      fd.append("TotalUnits", totalUnits);
      fd.append("MinInvestmentAmount", minInvestmentAmount);
      fd.append("AnnualReturnRate", annualReturnRate);

      if (fundData.logo instanceof File) {
        fd.append("Logo", fundData.logo);
      }

      fd.append(
        "Stocks",
        JSON.stringify(
          stocks.map((s) => ({
            StockId: Number(s.stockId),
            AllocationPercentage: Number(s.allocationPercentage),
          }))
        )
      );

      const res = await createFund(fd);

      setToast({
        message: res.message || "Fund created successfully!",
        type: res.success ? "success" : "error",
      });

      if (res.success) {
        setFundData({
          fundName: "",
          description: "",
          expenseRatio: "1",
          aum: "1000000",
          nav: "10",
          totalUnits: "100000",
          minInvestmentAmount: "1000",
          annualReturnRate: "10",
          logo: "",
          stocks: [{ stockId: "", allocationPercentage: "" }],
        });
      }
    } catch (error) {
      setToast({ message: (error as Error).message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-fund-container">
      <h2 className="create-fund-title">💰 Create New Mutual Fund</h2>
      <p className="create-fund-subtitle">
        Fill out the details below to create a new mutual fund.
      </p>

      <div className="create-fund-form">
        <label>Fund Name <span className="required">*</span></label>
        <input name="fundName" value={fundData.fundName} onChange={handleInputChange} placeholder="Enter fund name" />

        <label>Description <span className="required">*</span></label>
        <textarea name="description" value={fundData.description} onChange={handleInputChange} placeholder="Enter description" />

        <label>Logo (Optional)</label>
        <input type="file" name="logo" onChange={handleInputChange} />

        <label>Expense Ratio (%) <span className="required">*</span></label>
        <input name="expenseRatio" value={fundData.expenseRatio} onChange={handleInputChange} placeholder="Enter expense ratio" />

        <label>AUM <span className="required">*</span></label>
        <input name="aum" value={fundData.aum} onChange={handleInputChange} placeholder="Enter AUM" />

        <label>NAV <span className="required">*</span></label>
        <input name="nav" value={fundData.nav} onChange={handleInputChange} placeholder="Enter NAV" />

        <label>Total Units <span className="required">*</span></label>
        <input name="totalUnits" value={fundData.totalUnits} onChange={handleInputChange} placeholder="Enter total units" />

        <label>Minimum Investment Amount(greater than 1000) <span className="required">*</span></label>
        <input name="minInvestmentAmount" value={fundData.minInvestmentAmount} onChange={handleInputChange} placeholder="₹ Min investment" />

        <label>Annual Return Rate (%) <span className="required">*</span></label>
        <input name="annualReturnRate" value={fundData.annualReturnRate} onChange={handleInputChange} placeholder="Enter annual return rate" />

        <h3 className="stock-section-title">📈 Stocks in this Fund</h3>

        {fundData.stocks.map((stock, index) => (
          <div key={index} className="stock-field">
            <div className="stock-input-group">
              <select value={stock.stockId} onChange={(e) => handleStockChange(index, "stockId", e.target.value)}>
                <option value="">Select Stock</option>
                {availableStocks.map((stk) => (
                  <option key={stk.stockId} value={stk.stockId}>{stk.companyName}</option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Allocation %"
                value={stock.allocationPercentage}
                onChange={(e) => handleStockChange(index, "allocationPercentage", e.target.value)}
              />

              {fundData.stocks.length > 1 && (
                <button type="button" onClick={() => handleRemoveStock(index)} className="btn-remove-stock">
                  ❌
                </button>
              )}
            </div>
          </div>
        ))}

        <button className="btn-add-stock" type="button" onClick={handleAddStock}>
          ➕ Add Another Stock
        </button>

        <button className="btn-create-fund" onClick={handleCreateFund} disabled={loading}>
          {loading ? "Creating..." : "✅ Create Fund"}
        </button>
      </div>

      {toast.message && toast.type && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: null })} />
      )}

      <MutualFunds />
    </div>
  );
};

export default FundInvestment;
