import React, { useState } from "react";
import Toast, { type ToastType } from "../../utils/Toast";
import { createStock } from "../../api/Service/admin.api";
import "../../Styles/Admin/AddStock.css";

const AddStock: React.FC = () => {
  const [formData, setFormData] = useState({
    stockSymbol: "",
    companyName: "",
    sector: 1,
    basePrice: "",
    currentMarketPrice: "",
    totalShares: "",
    volumeTraded: "",
    listedDate: "",
  });

  const [errors, setErrors] = useState<{ basePrice?: string; currentMarketPrice?: string }>({});

  const [toast, setToast] = useState<{ message: string; type: ToastType | null }>({
    message: "",
    type: null,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };


  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "basePrice") {
      if (!value) setErrors((p) => ({ ...p, basePrice: "Base price is required" }));
      else if (Number(value) <= 0)
        setErrors((p) => ({ ...p, basePrice: "Base price must be > 0" }));
      else setErrors((p) => ({ ...p, basePrice: "" }));
    }

    if (name === "currentMarketPrice") {
      if (!value)
        setErrors((p) => ({ ...p, currentMarketPrice: "Current price is required" }));
      else if (Number(value) <= 0)
        setErrors((p) => ({ ...p, currentMarketPrice: "Market price must be > 0" }));
      else setErrors((p) => ({ ...p, currentMarketPrice: "" }));
    }
  };

  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();


    if (errors.basePrice || errors.currentMarketPrice) {
      setToast({
        message: "Please fix validation errors!",
        type: "error",
      });
      return;
    }

    try {
      const payload = {
        stockSymbol: formData.stockSymbol,
        companyName: formData.companyName,
        sector: Number(formData.sector),
        basePrice: Number(formData.basePrice),
        currentMarketPrice: Number(formData.currentMarketPrice),
        totalShares: Number(formData.totalShares),
        volumeTraded: formData.volumeTraded ? Number(formData.volumeTraded) : undefined,
        listedDate: formData.listedDate,
      };

      const res = await createStock(payload);

      setToast({
        message: res.message || "Stock created successfully!",
        type: res.success ? "success" : "error",
      });

      if (res.success) {
        setFormData({
          stockSymbol: "",
          companyName: "",
          sector: 1,
          basePrice: "",
          currentMarketPrice: "",
          totalShares: "",
          volumeTraded: "",
          listedDate: "",
        });
        setErrors({});
      }
    } catch (error) {
      setToast({ message: (error as Error).message, type: "error" });
    }
  };

  return (
    <div className="createstock-container">
      <h1 className="createstock-title">📈 Create New Stock</h1>

      <form className="createstock-form" onSubmit={handleSubmit}>
      
      
        <div className="createstock-field">
          <label>
            Stock Symbol <span className="required">*</span>
          </label>
          <input
            type="text"
            name="stockSymbol"
            value={formData.stockSymbol}
            onChange={handleChange}
            placeholder="Enter stock symbol (e.g., INFY)"
            required
          />
        </div>

        
        <div className="createstock-field">
          <label>
            Company Name <span className="required">*</span>
          </label>
          <input
            type="text"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            placeholder="Enter company name"
            required
          />
        </div>

      
        <div className="createstock-field">
          <label>
            Sector <span className="required">*</span>
          </label>
          <select name="sector" value={formData.sector} onChange={handleChange}>
            <option value={1}>NSE</option>
            <option value={2}>BSE</option>
          </select>
        </div>
  <div className="createstock-field">
          <label>
            Base Price <span className="required">*</span>
          </label>
          <input
            type="number"
            name="basePrice"
            value={formData.basePrice}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Enter base price"
            required
          />
          <div className="error-box">{errors.basePrice}</div>
        </div>

        
        <div className="createstock-field">
          <label>
            Current Market Price <span className="required">*</span>
          </label>
          <input
            type="number"
            name="currentMarketPrice"
            value={formData.currentMarketPrice}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Enter current price"
            required
          />
          <div className="error-box">{errors.currentMarketPrice}</div>
        </div>
      
        <div className="createstock-field">
          <label>
            Total Shares <span className="required">*</span>
          </label>
          <input
            type="number"
            name="totalShares"
            value={formData.totalShares}
            onChange={handleChange}
            placeholder="Enter total shares"
            required
          />
        </div>

        
        <div className="createstock-field">
          <label>Volume Traded</label>
          <input
            type="number"
            name="volumeTraded"
            value={formData.volumeTraded}
            onChange={handleChange}
            placeholder="Enter volume traded (optional)"
          />
        </div>

       
        <div className="createstock-field">
          <label>
            Listed Date <span className="required">*</span>
          </label>
          <input
            type="date"
            name="listedDate"
            value={formData.listedDate}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" className="createstock-btn">
          🚀 Create Stock
        </button>
      </form>

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

export default AddStock;
