import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Loader, Button } from "../components/ui";

function Dashboard() {
  const [counts, setCounts] = useState({ farmers: 0, crops: 0, weather: 0 });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("access_token");
        const headers = {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        };
        const [farmersRes, cropsRes, weatherRes] = await Promise.all([
          fetch("http://127.0.0.1:8000/api/farmers/", { headers }),
          fetch("http://127.0.0.1:8000/api/crops/", { headers }),
          fetch("http://127.0.0.1:8000/api/weather/", { headers }),
        ]);

        if (!farmersRes.ok || !cropsRes.ok || !weatherRes.ok) {
          throw new Error("Failed to fetch dashboard data from server");
        }

        const [farmersData, cropsData, weatherData] = await Promise.all([
          farmersRes.json(),
          cropsRes.json(),
          weatherRes.json(),
        ]);

        setCounts({
          farmers: farmersData.length,
          crops: cropsData.length,
          weather: weatherData.length,
        });

        // Construct dynamic recent activities
        const activities = [];
        
        // Sort items by ID descending to get the most recent
        const latestFarmers = [...farmersData].sort((a, b) => b.id - a.id).slice(0, 2);
        const latestCrops = [...cropsData].sort((a, b) => b.id - a.id).slice(0, 2);
        const latestWeather = [...weatherData].sort((a, b) => b.id - a.id).slice(0, 2);

        latestFarmers.forEach((f) => {
          activities.push({
            id: `farmer-${f.id}`,
            type: "farmer",
            icon: "👤",
            text: `Registered Farmer: ${f.name} (${f.location})`,
            detail: `Farm Size: ${f.farm_size_acres} Acres`,
            color: "border-green-500",
          });
        });

        latestCrops.forEach((c) => {
          activities.push({
            id: `crop-${c.id}`,
            type: "crop",
            icon: "🌱",
            text: `Planted Crop: ${c.crop_name} (${c.crop_type})`,
            detail: `Status: ${c.status} | Area: ${c.area_in_acres} Acres`,
            color: "border-emerald-500",
          });
        });

        latestWeather.forEach((w) => {
          activities.push({
            id: `weather-${w.id}`,
            type: "weather",
            icon: "☀️",
            text: `Weather Record: ${w.location} - ${w.weather_condition}`,
            detail: `Temp: ${w.temperature}°C | Humidity: ${w.humidity}%`,
            color: "border-blue-500",
          });
        });

        setRecentActivity(activities);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
      <Navbar />

      <main className="flex-grow max-w-6xl w-full mx-auto p-6 md:p-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-green-700 dark:text-green-500">
            AgriConnect AI Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
            Welcome back! Manage crop cultivation, monitor weather conditions, and review farmer directories from your central command panel.
          </p>
        </div>

        {/* Loader/Error Handling */}
        {loading && (
          <div className="my-16">
            <Loader />
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 p-4 rounded-xl text-red-700 dark:text-red-400 mb-8">
            <p className="font-semibold">Error loading dashboard metrics:</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Stats Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              {/* Farmers Summary */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                    Total Farmers
                  </span>
                  <span className="text-2xl">👤</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-gray-800 dark:text-gray-100">
                    {counts.farmers}
                  </span>
                  <span className="text-sm text-green-600 font-medium">Registered</span>
                </div>
              </div>

              {/* Crops Summary */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                    Crops Monitored
                  </span>
                  <span className="text-2xl">🌱</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-gray-800 dark:text-gray-100">
                    {counts.crops}
                  </span>
                  <span className="text-sm text-emerald-600 font-medium">Active Crops</span>
                </div>
              </div>

              {/* Weather Summary */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                    Weather Records
                  </span>
                  <span className="text-2xl">☀️</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-gray-800 dark:text-gray-100">
                    {counts.weather}
                  </span>
                  <span className="text-sm text-blue-600 font-medium">Locations</span>
                </div>
              </div>
            </div>

            {/* Quick Navigation & Recent Activities Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Quick Navigation Cards */}
              <div className="lg:col-span-2 space-y-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                  Quick Actions & Navigation
                </h2>
                
                <div className="grid sm:grid-cols-2 gap-6">
                  {/* Farmer Directory Link */}
                  <Link 
                    to="/farmers"
                    className="group relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-800 hover:border-green-500 dark:hover:border-green-600 rounded-xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="text-3xl mb-4 group-hover:scale-110 transition-transform origin-left">🧑‍🌾</div>
                      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2 group-hover:text-green-600 dark:group-hover:text-green-500 transition-colors">
                        Farmer Directory
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Manage platform farmers, regions, contacts, and active crop sizes.
                      </p>
                    </div>
                    <div className="mt-6 flex items-center text-sm font-semibold text-green-700 dark:text-green-500">
                      Go to Directory &rarr;
                    </div>
                  </Link>

                  {/* Crop Management Link */}
                  <Link 
                    to="/crops"
                    className="group relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-800 hover:border-emerald-500 dark:hover:border-emerald-600 rounded-xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="text-3xl mb-4 group-hover:scale-110 transition-transform origin-left">🌾</div>
                      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-500 transition-colors">
                        Crop Management
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Track active seeds, seasons, planting dates, and growth lifecycles.
                      </p>
                    </div>
                    <div className="mt-6 flex items-center text-sm font-semibold text-emerald-700 dark:text-emerald-500">
                      Manage Crops &rarr;
                    </div>
                  </Link>

                  {/* Weather Monitoring Link */}
                  <Link 
                    to="/weather"
                    className="group relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-600 rounded-xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="text-3xl mb-4 group-hover:scale-110 transition-transform origin-left">🌦️</div>
                      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-500 transition-colors">
                        Weather Monitoring
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Observe temperatures, humidity, wind patterns, and rainfall reports.
                      </p>
                    </div>
                    <div className="mt-6 flex items-center text-sm font-semibold text-blue-700 dark:text-blue-500">
                      View Weather &rarr;
                    </div>
                  </Link>

                  {/* AI Advisor */}
                  <Link 
                    to="/ai-advisor"
                    className="group relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-800 hover:border-purple-500 dark:hover:border-purple-600 rounded-xl p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="text-3xl mb-4 group-hover:scale-110 transition-transform origin-left">🤖</div>
                      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-500 transition-colors">
                        AI Farm Advisor
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Leverage Gemini AI model configurations for smart recommendation advice.
                      </p>
                    </div>
                    <div className="mt-6 flex items-center text-sm font-semibold text-purple-700 dark:text-purple-500">
                      Consult AI &rarr;
                    </div>
                  </Link>
                </div>
              </div>

              {/* Recent Activity Timeline */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
                  Recent Activity
                </h2>
                {recentActivity.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-sm">No activity recorded yet.</p>
                ) : (
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div
                        key={activity.id}
                        className={`flex gap-3 p-3 border-l-4 ${activity.color} bg-gray-50 dark:bg-gray-900/40 rounded-r-lg`}
                      >
                        <div className="text-xl shrink-0">{activity.icon}</div>
                        <div>
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                            {activity.text}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {activity.detail}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default Dashboard;