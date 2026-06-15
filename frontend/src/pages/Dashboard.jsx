import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function Dashboard() {
  return (
    <>
      <Navbar />

      <div className="max-w-4xl mx-auto p-8 min-h-screen">
        <h1 className="text-4xl font-bold mb-4">
          Dashboard
        </h1>

        <p className="text-lg text-gray-700">
          Analytics, farmer statistics, crop reports,
          and weather insights will be displayed here.
        </p>
      </div>

      <Footer />
    </>
  );
}

export default Dashboard;