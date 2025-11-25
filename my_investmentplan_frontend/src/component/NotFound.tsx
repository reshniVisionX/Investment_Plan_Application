
import { Link } from "react-router-dom";

const NotFound= () => {
  return (
    <div className="text-center p-10">
      <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="text-gray-600 mb-4">The page you’re looking for doesn’t exist.</p>
      <Link to="/login" className="text-blue-600 underline">Go back to Login</Link>
    </div>
  );
};

export default NotFound;
