import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { tokenstore } from "../auth/tokenstore";

interface ProtectedRouteProps {
  allowedRoles: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {

  const user = tokenstore.getInvestor();
  const userRole = user?.roleName;


  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
