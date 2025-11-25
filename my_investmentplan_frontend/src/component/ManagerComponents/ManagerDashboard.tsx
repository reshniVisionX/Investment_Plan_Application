import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux"
import { logout } from "../../slices/authSlice";
import { tokenstore } from "../../auth/tokenstore";
import { useEffect, useState } from "react";
import { stopSignalRConnection } from "../../api/signalrService";
import Footer from "./Footer";  

const ManagerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [theme, setTheme] = useState<"light" | "dark">(tokenstore.getTheme());


  const handleLogout = async () => {
    await stopSignalRConnection();
    dispatch(logout());
    navigate("/login", { replace: true });
  };
  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
    tokenstore.setTheme(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <div className="layout-container">

      <nav className="navbar">
        <div className="navbar-left" onClick={() => navigate("/manager-dashboard")}>
          <div className="logo">💹</div>
          <h1 className="brand">RenVest</h1>
        </div>

        <div className="navbar-right">
          <button onClick={() => navigate("/manager-dashboard")}>Home</button>
          <button onClick={() => navigate("/manager-dashboard/profile")}>👤 Profile</button>
          <button onClick={toggleTheme} className="theme-toggle-btn">
            {theme === "light" ? "💙" : "🤍"}
          </button>
          <button onClick={handleLogout}>🚪 Logout</button>
        </div>
      </nav>

      <div className="content-area">
        <aside className="sidebar">
          <ul>
            <li onClick={() => navigate("/manager-dashboard/funds-inv")}>💸 Fund Investments</li>
            
            <li onClick={() => navigate("/manager-dashboard/settle-funds")}>💰 Manage Funds</li>
            <li onClick={() => navigate("/manager-dashboard/fund-analysis")}>📊 Fund Analysis</li>
            <li onClick={() => navigate("/manager-dashboard/stocks")}>📈 Stocks</li>

          </ul>
        </aside>

        <main className="main-content">

          <Outlet />
          <Footer />
        </main>
      </div>
    </div>
  );
};

export default ManagerDashboard;
