import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Card from "../components/Card";
import Footer from "../components/Footer";

function Home() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleCardClick = (path) => {
    if (isAuthenticated) {
      navigate(path);
    } else {
      navigate("/login");
    }
  };

  return (
    <>
      <Navbar />

      <Hero />

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 p-8">
        <Card
          title="Farmer Management"
          description="Manage farmer profiles and records."
          accent="green"
          onClick={() => handleCardClick("/farmers")}
        />

        <Card
          title="Crop Planning"
          description="Plan sowing and harvesting activities."
          accent="orange"
          onClick={() => handleCardClick("/crops")}
        />

        <Card
          title="Weather Monitoring"
          description="Track weather forecasts and conditions."
          accent="blue"
          onClick={() => handleCardClick("/weather")}
        />

        <Card
          title="AI Farm Advisor"
          description="Get AI-powered farming recommendations."
          accent="purple"
          onClick={() => handleCardClick("/ai-advisor")}
        />
      </div>

      <Footer />
    </>
  );
}

export default Home;