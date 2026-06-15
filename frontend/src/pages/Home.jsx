import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Card from "../components/Card";
import Footer from "../components/Footer";

function Home() {
  return (
    <>
      <Navbar />

      <Hero />

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 p-8">
        <Card
          title="Farmer Management"
          description="Manage farmer profiles and records."
        />

        <Card
          title="Crop Planning"
          description="Plan sowing and harvesting activities."
        />

        <Card
          title="Weather Monitoring"
          description="Track weather forecasts and conditions."
        />

        <Card
          title="AI Farm Advisor"
          description="Get AI-powered farming recommendations."
        />
      </div>

      <Footer />
    </>
  );
}

export default Home;