import React from "react";
import { useNavigate } from "react-router-dom";

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50 text-center">
      <h1 className="text-4xl font-bold text-red-600 mb-4">Unauthorized Access 🚫</h1>
      <p className="text-gray-700 mb-6">
        You don’t have permission to view this page.
      </p>
      <button
        onClick={() => navigate(-1)} 
        className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700"
      >
        Go Back
      </button>
    </div>
  );
};

export default Unauthorized;
