import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import "../../Styles/Dashboard.css";
import { useDispatch } from "react-redux";
import { logoutAndReset } from "../../slices/authSlice";
import { tokenstore } from "../../auth/tokenstore";
import { useEffect, useState } from "react";
import TopNotification from "../../utils/TopNotification";
import { useSelector } from "react-redux";
import {type RootState } from "../../store";
import { stopSignalRConnection } from "../../api/signalrService";
import type { AppDispatch } from "../../store";
import { markLiveEventHandled } from "../../slices/notificationSlice";
import Footer from '../ManagerComponents/Footer';

const DashboardLayout: React.FC = () => {
  const navigate = useNavigate();
 const [theme, setTheme] = useState<"light" | "dark">(tokenstore.getTheme());
 const [popup, setPopup] = useState<{ message: string; time: string } | null>(null);
const [hasNewNotification, setHasNewNotification] = useState(false);
const dispatch = useDispatch<AppDispatch>();

  const latestNotification = useSelector(
    (state: RootState) => state.notifications.list[0]
  );

useEffect(() => {
  if (!latestNotification) return;

  if (latestNotification.isLiveEvent) {
    console.log("Received a live notification");

    setPopup({
      message: latestNotification.message,
      time: latestNotification.createdAt,
    });

    setHasNewNotification(true);

    dispatch(markLiveEventHandled(latestNotification.notificationId));
  }
}, [latestNotification, dispatch]);
 
  const handleLogout = async () => {
      await stopSignalRConnection();
     dispatch(logoutAndReset());
     setHasNewNotification(false);
         setPopup(null);
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

      {popup && (
        <TopNotification
          message={popup.message}
          time={popup.time}
          onClose={() => setPopup(null)}
        />
      )}
      <nav className="navbar">
        <div className="navbar-left" onClick={() => navigate("/dashboard")}>
          <div className="logo">💹</div>
          <h1 className="brand">RenVest</h1>
        </div>

        <div className="navbar-right">
          <button onClick={() => navigate("/dashboard")}>Home</button>
            <button onClick={() => navigate("/dashboard/profile")}>👤 </button>
            <button onClick={toggleTheme} className="theme-toggle-btn">
              {theme === "light" ? "💙" : "🤍"}
            </button>
          <button onClick={handleLogout}>🚪 Logout</button>
        </div>
      </nav>

      {/* ===== SIDEBAR + MAIN ===== */}
      <div className="content-area">
        <aside className="sidebar">
          <ul>
  <li onClick={() => navigate("/dashboard/stocks")}>📈 Stocks</li>
<li onClick={() => navigate("/dashboard/mutualfunds")}>💰 Mutual Funds</li>
<li onClick={() => navigate("/dashboard/portfolio")}>📊 Portfolio</li>
<li onClick={() => navigate("/dashboard/stocktransactions")}>🧾 Stock Transactions</li>
<li onClick={() => navigate("/dashboard/fundtransactions")}>📜 Fund Transactions</li>
<li
  onClick={() => {
    navigate("/dashboard/notifications");
    setHasNewNotification(false); 
  }}
  className="notificationitem"
>
  🔔 Notifications
  {hasNewNotification && <span className="notificationdot"></span>}
</li>

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

export default DashboardLayout;
