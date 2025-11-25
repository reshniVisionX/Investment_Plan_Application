import React, { useState } from "react";
import { type SignUpRequest } from "../../Types/SignUpRequest";
import Toast, { type ToastType } from "../../utils/Toast";
import "../../Styles/SignUp/Review.css";

interface Props {
  form: SignUpRequest;
  setForm: React.Dispatch<React.SetStateAction<SignUpRequest>>;
  prevStep: () => void;
  nextStep: () => void;
}

const ReviewAndSubmitForm: React.FC<Props> = ({ form, setForm, prevStep, nextStep }) => {
  const [upiId, setUpiId] = useState("");
  const [upiPin, setUpiPin] = useState("");
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
 const MAX_AMOUNT = 10000000;

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type });
  };

  const validateInputs = () => {
    if (!form.incomeProof) {
      showToast("Please upload your income proof (PDF)!", "error");
      return false;
    }

    if (!form.bankName || !form.fund || !upiId || !upiPin) {
      showToast("Please fill all payment fields!", "error");
      return false;
    }

    if (form.fund < 1000) {
      showToast("Minimum fund must be ₹1000!", "error");
      return false;
    }

    const upiRegex = /^[a-z0-9]+@[a-z]+$/i;
    const pinRegex = /^\d{4,}$/;

    if (!upiRegex.test(upiId)) {
      showToast("Invalid UPI ID format! Example: resh123@axis", "error");
      return false;
    }

    if (!pinRegex.test(upiPin)) {
      showToast("UPI PIN must be numeric and at least 4 digits!", "error");
      return false;
    }
    // Nominee validation (optional but all-or-none)
    const hasAnyNomineeField =
      form.nomineeName || form.nomineeEmail || form.nomineeRelation;

    if (hasAnyNomineeField) {
      if (!form.nomineeName || !form.nomineeEmail || !form.nomineeRelation) {
        showToast("Please fill all nominee details if you want to add a nominee!", "error");
        return false;
      }
    }


    return true;
  };

  const handlePayment = () => {
    if (!validateInputs()) return;

    showToast("✅ Payment Successful! Proceeding to final verification.", "success");

    setTimeout(() => {
      nextStep();
    }, 10);
  };

  return (
    <div className="review-container">
      <h2 className="review-title">Step 3: Bank & Payment Details</h2>
      <p className="review-desc">
        Please provide your bank details, upload income proof, and add nominee information.
      </p>

      {/* --- Income Proof --- */}
      <div className="review-section">
        <label>
          Upload Income Proof (PDF) <span className="required">*</span>
        </label>

        <input
          type="file"
          accept="application/pdf"
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              incomeProof: e.target.files?.[0] ?? null,
            }))
          }
          className="review-upload"
        />
      </div>

      {/* --- Bank & Payment Info --- */}
      <div className="review-bank-grid">

        {/* Bank Name */}
        <div>
          <label>
            Bank Name <span className="required">*</span>
          </label>
          <input
            type="text"
            placeholder="Enter Bank Name"
            value={form.bankName || ""}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                bankName: e.target.value,
              }))
            }
            className="review-input"
          />
        </div>

        {/* Fund */}
        <div>
          <label>
            Initial Fund Amount (₹) <span className="required">*</span>
          </label>
         
          <input
            type="number"
            placeholder="Enter Fund Amount"
            value={form.fund || ""}
            onChange={(e) => {
              const value = Number(e.target.value);
              if (value > MAX_AMOUNT) return; 
              setForm((prev) => ({ ...prev, fund: value }));
            }}
            className="review-input"
          />

        </div>

 
        <div>
          <label>
            UPI ID <span className="required">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g., name@upi"
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            className="review-input"
          />
        </div>

 
        <div>
          <label>
            UPI PIN <span className="required">*</span>
          </label>
          <input
            type="password"
            placeholder="Enter UPI PIN"
            value={upiPin}
            onChange={(e) => setUpiPin(e.target.value)}
            className="review-input"
          />
        </div>
      </div>


      <div className="review-nominee-grid">

        <div>
          <label>Nominee Name</label>
          <input
            type="text"
            placeholder="Nominee Name"
            value={form.nomineeName || ""}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                nomineeName: e.target.value,
              }))
            }
            className="review-input"
          />
        </div>

        <div>
          <label>Nominee Email</label>
          <input
            type="email"
            placeholder="Nominee Email"
            value={form.nomineeEmail || ""}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                nomineeEmail: e.target.value,
              }))
            }
            className="review-input"
          />
        </div>

        <div>
          <label>Nominee Relation</label>
          <select
            value={form.nomineeRelation || ""}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                nomineeRelation: e.target.value,
              }))
            }
            className="review-select"
          >
            <option value="">Select Relation</option>
            <option value="Father">Father</option>
            <option value="Mother">Mother</option>
            <option value="Brother">Brother</option>
            <option value="Sister">Sister</option>
            <option value="Husband">Husband</option>
            <option value="Wife">Wife</option>
          </select>
        </div>
      </div>

     
      <div className="review-action">
        <button onClick={handlePayment} className="review-btn-pay">
          Pay & Proceed →
        </button>
        <button onClick={prevStep} className="review-btn-back">
          ← Back
        </button>
      </div>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
};

export default ReviewAndSubmitForm;
