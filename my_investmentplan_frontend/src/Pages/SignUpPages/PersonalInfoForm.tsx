import React, { useState } from "react";
import { type SignUpRequest } from "../../Types/SignUpRequest";
import Toast, { type ToastType } from "../../utils/Toast";
import { sendOtp, verifyOtp } from "../../api/Service/auth";
import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import "../../Styles/SignUp/PersonalInfo.css";
import { checkInvestorDuplicates } from "../../api/Service/investor.api";
import { type CheckDuplicateResponse } from "../../Types/CheckDuplicateResponse";

interface Props {
  form: SignUpRequest;
  setForm: React.Dispatch<React.SetStateAction<SignUpRequest>>;
  nextStep: () => void;
}

const PersonalInfoForm: React.FC<Props> = ({ form, setForm, nextStep }) => {
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [verified, setVerified] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  // ----------------- VALIDATION RULES -----------------
  const validators: Record<string, (value: string) => string> = {
    investorName: (v) => (!v ? "Name is required" : ""),
    email: (v) =>
      !v
        ? "Email is required"
        : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
        ? ""
        : "Invalid email format",
    mobile: (v) =>
      !v
        ? "Mobile number is required"
        : /^[6-9]\d{9}$/.test(v)
        ? ""
        : "Invalid mobile number",
    password: (v) => (!v ? "Password is required" : ""),
    aadhaarNo: (v) =>
      !v
        ? "Aadhaar number is required"
        : /^\d{12}$/.test(v)
        ? ""
        : "Aadhaar must be 12 digits",
    panNo: (v) =>
      !v
        ? "PAN number is required"
        : /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(v)
        ? ""
        : "Invalid PAN format",
    age: (v) =>
      !v
        ? "Age is required"
        : Number(v) < 18
        ? "You must be at least 18 years old"
        : "",
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let filteredValue = value;


    if (name === "mobile") {
      filteredValue = value.replace(/\D/g, "").slice(0, 10);
    }

    if (name === "aadhaarNo") {
      filteredValue = value.replace(/\D/g, "").slice(0, 12);
    }

    if (name === "panNo") {
      filteredValue = value
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, "")
        .slice(0, 10);
    }

    if (name === "investorName") {
      filteredValue = value.replace(/[^a-zA-Z\s]/g, "");
    }

    if (name === "age") {
      filteredValue = value.replace(/\D/g, "").slice(0, 3);
    }

    setForm((prev) => ({ ...prev, [name]: filteredValue }));

    const errorMsg = validators[name]?.(filteredValue) || "";
    setErrors((prev) => ({ ...prev, [name]: errorMsg }));
  };


  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type });
  };

  
  const handleSendOtp = async () => {
    if (errors.email || errors.mobile || !form.email || !form.mobile) {
      showToast("Please fix validation errors before sending OTP!", "error");
      return;
    }

    try {
      const res = await sendOtp(form.email, form.mobile);
      if (res.success) {
        setOtpSent(true);
        showToast("OTP sent successfully!", "success");
      } else {
        showToast("Failed to send OTP.", "error");
      }
    } catch {
      showToast("Server error while sending OTP.", "error");
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      showToast("Enter a valid 6-digit OTP!", "error");
      return;
    }

    try {
      const res = await verifyOtp(form.email, form.mobile, otp);
      if (res.success) {
        setVerified(true);
        showToast("OTP verified successfully!", "success");
      } else {
        showToast("Invalid OTP!", "error");
      }
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      const msg = err.response?.data?.message || "Error verifying OTP.";
      showToast(msg, "error");
    }
  };

 
  const handleNext = async () => {
    const newErrors: Record<string, string> = {};

    Object.keys(validators).forEach((field) => {
      const value = form[field as keyof SignUpRequest] as string;
      const errorMsg = validators[field](value);
      if (errorMsg) newErrors[field] = errorMsg;
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      showToast("Please correct the errors before proceeding!", "error");
      return;
    }

    if (!verified) {
      showToast("Please verify your OTP before proceeding!", "error");
      return;
    }

    try {
      const res = await checkInvestorDuplicates(
        form.aadhaarNo,
        form.panNo,
        form.mobile,
        form.email
      );

      if (!res.success) {
        showToast(res.message || "Duplicate record found!", "error");
        return;
      }

      showToast("All details verified!", "success");
      setTimeout(() => nextStep(), 800);
    } catch (error) {
      const err = error as AxiosError<CheckDuplicateResponse>;
      const msg = err.response?.data?.message || "Error verifying uniqueness.";
      showToast(msg, "error");
    }
  };

  const handleLogin = () => navigate("/login");

  return (
    <div className="personal-info-container">
      <h2 className="personal-info-title">Step 1: Personal Information</h2>

      <div className="personal-info-flex">

       
        <div className="personal-column">

          <label>Full Name <span className="required">*</span></label>
          <input
            name="investorName"
            placeholder="Full Name"
            value={form.investorName}
            onChange={handleChange}
            className="personal-input"
          />
          <div className="error-box">{errors.investorName}</div>

          <label>Mobile Number<span className="required">*</span></label>
          <input
            name="mobile"
            placeholder="Mobile Number"
            value={form.mobile}
            onChange={handleChange}
            className="personal-input"
          />
          <div className="error-box">{errors.mobile}</div>

          <label>Email Address<span className="required">*</span></label>
          <input
            name="email"
            placeholder="Email Address"
            value={form.email}
            onChange={handleChange}
            className="personal-input"
          />
          <div className="error-box">{errors.email}</div>

      
          {form.email && !verified && (
            <div className="otp-section">
              {!otpSent ? (
                <button onClick={handleSendOtp} className="otp-btn">
                  Send OTP
                </button>
              ) : (
                <>
                  <label>Enter OTP</label>
                  <input
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="personal-input"
                    maxLength={6}
                  />
                  <button onClick={handleVerifyOtp} className="validate-btn">
                    Validate OTP
                  </button>
                  <button onClick={handleSendOtp} className="resend-btn">
                    Resend OTP
                  </button>
                </>
              )}
            </div>
          )}
        </div>

    
        <div className="personal-column">

          <label>Password<span className="required">*</span></label>
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="personal-input"
          />
          <div className="error-box">{errors.password}</div>

          <label>Aadhaar Number<span className="required">*</span></label>
          <input
            name="aadhaarNo"
            placeholder="Aadhaar Number"
            value={form.aadhaarNo}
            onChange={handleChange}
            className="personal-input"
          />
          <div className="error-box">{errors.aadhaarNo}</div>

          <label>PAN Number<span className="required">*</span></label>
          <input
            name="panNo"
            placeholder="PAN Number"
            value={form.panNo}
            onChange={handleChange}
            className="personal-input"
          />
          <div className="error-box">{errors.panNo}</div>

          <label>Age<span className="required">*</span></label>
          <input
            name="age"
            type="text"
            placeholder="Age"
            value={form.age}
            onChange={handleChange}
            className="personal-input"
          />
          <div className="error-box">{errors.age}</div>
        </div>
      </div>

      <div className="proceed-container">
        <button onClick={handleNext} className="proceed-btn" disabled={!verified}>
          Proceed to KYC Capture →
        </button>
      </div>

      <div className="login-section">
        <p>
          Already have an account?{" "}
          <span onClick={handleLogin} className="login-link">
            Login here
          </span>
        </p>
      </div>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
};

export default PersonalInfoForm;
