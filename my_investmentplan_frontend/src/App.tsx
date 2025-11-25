import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useDispatch,useSelector } from "react-redux";
import type { RootState, AppDispatch } from "./store"; 
import { startSignalRConnection } from "./api/signalrService";
import ManagerDashboard from './component/ManagerComponents/ManagerDashboard';
import { LoginForm } from "./component/LoginForm";
import Signup from "./component/SignUp";
import NotFound from "./component/NotFound";
import Dashboard from "./component/InvestorComponents/Dashboard";
import AdminDashboard from "./component/AdminComponents/AdminDashboard";
import ProtectedRoute from "./auth/ProtectedRoutes";
import Unauthorized from "./component/Unauthorized";
import MutualFunds from "./component/InvestorComponents/MutualFunds";
import Stocks from "./component/InvestorComponents/Stocks";
import FundTransactions from "./component/InvestorComponents/FundTransactions";
import StockTransactions from "./component/InvestorComponents/StockTransactions";
import Portfolio from "./component/InvestorComponents/PortFolio";
import Notifications from "./component/InvestorComponents/Notifications";
import MyProfile from "./component/InvestorComponents/MyProfile";
import UserRequest from "./component/AdminComponents/UserRequest";
import FundAnalysis from "./component/AdminComponents/FundAnalysis";
import FundRequest from "./component/AdminComponents/FundRequest";
import SettleFunds from "./component/ManagerComponents/SettleFunds";
import AllStocks from "./component/AdminComponents/AllStocks";
import Investors  from "./component/AdminComponents/Investors";
import FundInvestment from "./component/ManagerComponents/FundInvestment";
import AddStock from "./component/AdminComponents/AddStock";
import { fetchNotifications } from "./slices/notificationSlice";
import StocksHomePage from "./component/ManagerComponents/Home";
import Funds from "./component/AdminComponents/MutualFunds";
import "./App.css";

function App() {
  const user = useSelector((state: RootState) => state.auth.user);
 const dispatch = useDispatch<AppDispatch>(); 
  useEffect(() => {
    if (user) {
      console.log("🚀 SignalR connecting for:", user.investorName);
         startSignalRConnection();
          if (user.roleName === "Investor") {
        dispatch(fetchNotifications(user.publicInvestorId));
      }
    }    
  }, [user, dispatch]);



  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />

        <Route path="/login" element={<LoginForm />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Investor Routes */}
        <Route element={<ProtectedRoute allowedRoles={["Investor"]} />}>
          <Route path="/dashboard" element={<Dashboard />}>
          <Route index element={<StocksHomePage />} />
            <Route path="stocks" element={<Stocks />} />
            <Route path="mutualfunds" element={<MutualFunds />} />
            <Route path="fundtransactions" element={<FundTransactions />} />
            <Route path="stocktransactions" element={<StockTransactions />} />
            <Route path="portfolio" element={<Portfolio />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="profile" element={<MyProfile />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Route>

        {/* Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={["Admin"]} />}>
          <Route path="/admin-dashboard" element={<AdminDashboard />}>
            <Route index element={<StocksHomePage />} />
            <Route path="user-request" element={<UserRequest />} />
            <Route path="fund-request" element={<FundRequest />} />
            <Route path="all-stocks" element={<AllStocks />} />
            <Route path="mutualfunds" element={<Funds />} />
            <Route path="fundtransactions" element={<FundTransactions />} />
            <Route path="profile" element={<MyProfile />} />
            <Route path="addstock" element={<AddStock />} />
            <Route path="all-investors" element={<Investors />} />
            <Route path="fund-analysis" element={<FundAnalysis />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Route>


        {/* Manager Routes */}
       
        <Route element={<ProtectedRoute allowedRoles={["FundManager"]} />}>
          <Route path="/manager-dashboard" element={<ManagerDashboard />}>
            <Route index element={<StocksHomePage />} />
            <Route path="funds-inv" element={<FundInvestment />} />
            <Route path="stocks" element={<Stocks />} />
            <Route path="fund-analysis" element={<FundAnalysis />} />
            <Route path="settle-funds" element={<SettleFunds />} />
            <Route path="profile" element={<MyProfile />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
