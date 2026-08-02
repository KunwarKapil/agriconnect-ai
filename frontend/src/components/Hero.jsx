import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Hero() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  };

  return (
    <section className="bg-green-100 py-20 text-center">
      <h1 className="text-5xl font-bold text-green-800 mb-4">
        Smart Agriculture Powered by AI
      </h1>

      <p className="text-lg text-gray-700 mb-6">
        Manage crops, monitor weather, detect diseases,
        and get AI-powered farming recommendations.
      </p>

      <button
        onClick={handleGetStarted}
        className="bg-green-700 text-white px-6 py-3 rounded-lg hover:bg-green-800 transition cursor-pointer"
      >
        Get Started
      </button>
    </section>
  );
}

export default Hero;