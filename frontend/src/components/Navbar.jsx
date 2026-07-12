import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="bg-green-700 text-white p-4 shadow-md">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
        <Link to="/" className="text-xl font-bold tracking-wider hover:opacity-90 transition-opacity">
          AgriConnect AI
        </Link>

        <div className="flex flex-wrap items-center gap-4 text-sm md:text-base">
          <Link to="/" className="hover:text-green-200 transition-colors">Home</Link>
          <Link to="/about" className="hover:text-green-200 transition-colors">About</Link>
          
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="hover:text-green-200 transition-colors">Dashboard</Link>
              <div className="flex items-center gap-3 pl-2 border-l border-green-600">
                <span className="text-xs bg-green-800 text-green-100 px-2.5 py-1 rounded-full font-semibold max-w-[150px] truncate">
                  🧑‍🌾 {user?.full_name}
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded text-xs font-semibold transition"
                >
                  Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-green-200 transition-colors">Login</Link>
              <Link 
                to="/register" 
                className="bg-green-800 hover:bg-green-900 text-white px-3.5 py-1.5 rounded text-sm font-semibold transition"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;