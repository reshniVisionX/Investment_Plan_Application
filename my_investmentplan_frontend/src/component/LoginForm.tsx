import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../slices/authSlice";
import type { AppDispatch, RootState } from "../store";
import Toast, { type ToastType } from "../utils/Toast";
import "../Styles/Login.css";

export const LoginForm = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const { user, loading, error } = useSelector((state: RootState) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [toast, setToast] = useState<{ message: string; type: ToastType | null }>({
    message: "",
    type: null,
  });

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address.";
    }
    return "";
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setEmailError(validateEmail(value));
  };

  useEffect(() => {
    console.log("Login user ", user);
    if (user) {
      const role = user.roleName?.toLowerCase();
      if (role === "admin") navigate("/admin-dashboard");
      else if (role === "fundmanager") navigate("/manager-dashboard");
      else navigate("/dashboard");
    }
  }, [user, navigate]);

  useEffect(() => {
    if (error) {
      setToast({ message: error, type: "error" });
    }
  }, [error]);

  const handleLogin = () => {
    if (!email.trim() || !password.trim()) {
      setToast({ message: "Email and Password are required.", type: "error" });
      return;
    }

    if (emailError) {
      setToast({ message: emailError, type: "error" });
      return;
    }

    dispatch(loginUser({ email, password }));
  };

  const handleSignup = () => navigate("/signup");

  return (
    <div className="page-wrapper">
      <div className="login-container">
        <div className="login-image">
          <img className="loginImg" src="https://wallpapercave.com/wp/wp13492660.png" alt="login-img"></img>
        </div>

        <div className="login-box">
          <h2 className="login-title">🔐 Login</h2>
          
          <div className="form-group">
            <input
              type="email"
              placeholder="Enter Email"
              value={email}
              onChange={handleEmailChange}
              className={`input-field ${emailError ? 'input-error' : ''}`}
              required
            />
            {emailError && <div className="error-message">{emailError}</div>}
          </div>

          <div className="form-group password-group">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              required
            />

            <span
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "🙈" : "👁️"}
            </span>
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="btn-login"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="signup-text">
            Don't have an account?{" "}
            <span onClick={handleSignup} className="signup-link">
              Sign up
            </span>
          </p>
        </div>

       
        {toast.message && toast.type && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast({ message: "", type: null })}
          />
        )}
      </div>
    </div>
  );
};