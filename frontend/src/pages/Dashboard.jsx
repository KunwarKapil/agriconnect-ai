import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Loader, Button, Toast } from "../components/ui";
import { API_BASE_URL } from "../config";

function Dashboard() {
  const [counts, setCounts] = useState({ farmers: 0, crops: 0, weather: 0 });
  const [farmersList, setFarmersList] = useState([]);
  const [cropsList, setCropsList] = useState([]);
  const [liveWeather, setLiveWeather] = useState(null);
  const [weatherSearchInput, setWeatherSearchInput] = useState("");
  const [systemStatus, setSystemStatus] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "error") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "error" });
    }, 4000);
  };

  const fetchLiveWeather = useCallback(async (city = "Dehradun") => {
    if (!city || !city.trim()) {
      showToast("Please enter a city name to search.", "error");
      return;
    }
    setWeatherLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${API_BASE_URL}/api/weather/live?city=${encodeURIComponent(city.trim())}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || "Failed to fetch live weather data.");
      }
      const data = await res.json();
      setLiveWeather(data);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setWeatherLoading(false);
    }
  }, []);

  const handleWeatherSearch = (e) => {
    e.preventDefault();
    if (!weatherSearchInput || !weatherSearchInput.trim()) {
      showToast("Please enter a city name to search.", "error");
      return;
    }
    fetchLiveWeather(weatherSearchInput.trim());
  };

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      const [farmersRes, cropsRes, weatherRes, statusRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/farmers/`, { headers }),
        fetch(`${API_BASE_URL}/api/crops/`, { headers }),
        fetch(`${API_BASE_URL}/api/weather/`, { headers }),
        fetch(`${API_BASE_URL}/api/system/status`, { headers }),
      ]);

      if (!farmersRes.ok || !cropsRes.ok || !weatherRes.ok) {
        throw new Error("Failed to load dashboard data from backend server");
      }

      const [farmersData, cropsData, weatherData, statusData] = await Promise.all([
        farmersRes.json(),
        cropsRes.json(),
        weatherRes.json(),
        statusRes.ok ? statusRes.json() : null,
      ]);

      setFarmersList(farmersData);
      setCropsList(cropsData);

      setCounts({
        farmers: farmersData.length,
        crops: cropsData.length,
        weather: weatherData.length,
      });

      if (statusData) {
        setSystemStatus(statusData);
      }

      // Recent activities derivation
      const activities = [];
      const latestFarmers = [...farmersData].sort((a, b) => b.id - a.id).slice(0, 2);
      const latestCrops = [...cropsData].sort((a, b) => b.id - a.id).slice(0, 2);
      const latestWeather = [...weatherData].sort((a, b) => b.id - a.id).slice(0, 2);

      latestFarmers.forEach((f) => {
        activities.push({
          id: `farmer-${f.id}`,
          icon: "🧑‍🌾",
          text: `Farmer Registered: ${f.name}`,
          detail: `${f.location} • ${f.farm_size_acres} Acres`,
          color: "border-green-500",
        });
      });

      latestCrops.forEach((c) => {
        activities.push({
          id: `crop-${c.id}`,
          icon: "🌱",
          text: `Crop Planted: ${c.crop_name}`,
          detail: `${c.crop_type} • Status: ${c.status}`,
          color: "border-emerald-500",
        });
      });

      latestWeather.forEach((w) => {
        activities.push({
          id: `weather-${w.id}`,
          icon: "☀️",
          text: `Weather Record: ${w.location}`,
          detail: `${w.temperature}°C • ${w.weather_condition}`,
          color: "border-blue-500",
        });
      });

      setRecentActivity(activities);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    fetchLiveWeather("Dehradun");
  }, [fetchDashboardData, fetchLiveWeather]);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
      <Navbar />

      <main className="flex-grow max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-8">
        {/* Welcome Section */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-green-700 dark:text-green-500">
              AgriConnect AI Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1 text-base sm:text-lg">
              Smart Agriculture Command Center & Operations Overview.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/ai-advisor">
              <Button variant="primary" className="shadow-md">
                <span>🤖</span> Launch AI Advisor
              </Button>
            </Link>
          </div>
        </div>

        {/* Global Loading state */}
        {loading ? (
          <div className="py-20 flex justify-center items-center">
            <Loader />
          </div>
        ) : (
          <>
            {/* Top Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Farmers Metric */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-xs hover:shadow-md transition">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                    Registered Farmers
                  </span>
                  <span className="text-2xl p-2 bg-green-50 dark:bg-green-950/40 rounded-xl">🧑‍🌾</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
                    {counts.farmers}
                  </span>
                  <span className="text-xs text-green-600 font-semibold bg-green-50 dark:bg-green-950/40 px-2 py-0.5 rounded-full">
                    Active Directory
                  </span>
                </div>
              </div>

              {/* Crops Metric */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-xs hover:shadow-md transition">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                    Registered Crops
                  </span>
                  <span className="text-2xl p-2 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl">🌱</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
                    {counts.crops}
                  </span>
                  <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                    Monitored
                  </span>
                </div>
              </div>

              {/* Weather Locations Metric */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-xs hover:shadow-md transition">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                    Weather Locations
                  </span>
                  <span className="text-2xl p-2 bg-blue-50 dark:bg-blue-950/40 rounded-xl">☀️</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
                    {counts.weather}
                  </span>
                  <span className="text-xs text-blue-600 font-semibold bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded-full">
                    CRUD Records
                  </span>
                </div>
              </div>

              {/* AI Engine Status */}
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-xs hover:shadow-md transition">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                    Gemini AI Model
                  </span>
                  <span className="text-2xl p-2 bg-purple-50 dark:bg-purple-950/40 rounded-xl">🧠</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                    Gemini 3.5
                  </span>
                  <span className="text-xs text-purple-600 font-semibold bg-purple-50 dark:bg-purple-950/40 px-2 py-0.5 rounded-full">
                    Operational
                  </span>
                </div>
              </div>
            </div>

            {/* Middle Section: Live Weather & System Status Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
              {/* Live Weather Card */}
              <div className="lg:col-span-7 bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-blue-900 dark:to-slate-900 text-white rounded-2xl p-6 shadow-lg flex flex-col justify-between relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/20 pb-4 mb-4 gap-3">
                  <div>
                    <span className="text-xs uppercase font-bold tracking-wider text-blue-200">
                      Live OpenWeather API
                    </span>
                    <h2 className="text-2xl font-bold flex items-center gap-2 mt-0.5">
                      📍 {liveWeather?.city || "Dehradun"}, {liveWeather?.country || "IN"}
                    </h2>
                  </div>
                  <form onSubmit={handleWeatherSearch} className="flex items-center gap-2 max-w-xs w-full">
                    <input
                      type="text"
                      placeholder="Search city (e.g. Mumbai)..."
                      value={weatherSearchInput}
                      onChange={(e) => setWeatherSearchInput(e.target.value)}
                      className="bg-white/10 text-white placeholder-blue-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-white w-full border border-white/20"
                    />
                    <button
                      type="submit"
                      disabled={weatherLoading}
                      className="bg-white/20 hover:bg-white/30 text-white text-xs font-semibold px-3 py-2 rounded-xl backdrop-blur-xs transition shrink-0 cursor-pointer"
                    >
                      {weatherLoading ? "..." : "Search"}
                    </button>
                  </form>
                </div>

                {weatherLoading ? (
                  <div className="py-8 text-center text-blue-100 animate-pulse">
                    Fetching real-time meteorological data...
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-2">
                    <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl">
                      <p className="text-xs text-blue-200">Temperature</p>
                      <p className="text-2xl font-extrabold mt-1">{liveWeather?.temperature ?? "--"}°C</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl">
                      <p className="text-xs text-blue-200">Feels Like</p>
                      <p className="text-2xl font-extrabold mt-1">{liveWeather?.feels_like ?? "--"}°C</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl">
                      <p className="text-xs text-blue-200">Humidity</p>
                      <p className="text-2xl font-extrabold mt-1">{liveWeather?.humidity ?? "--"}%</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl">
                      <p className="text-xs text-blue-200">Wind Speed</p>
                      <p className="text-2xl font-extrabold mt-1">{liveWeather?.wind_speed ?? "--"} m/s</p>
                    </div>
                  </div>
                )}

                <div className="mt-4 pt-3 border-t border-white/20 flex flex-wrap justify-between items-center text-xs text-blue-200">
                  <span>Condition: <strong>{liveWeather?.weather_description || "Sunny"}</strong></span>
                  <span>Updated: {liveWeather?.last_updated || "Just now"}</span>
                </div>
              </div>

              {/* System Status & Health */}
              <div className="lg:col-span-5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                    <span>⚙️</span> System Status
                  </h2>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/60 rounded-xl">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">FastAPI Backend</span>
                      <span className="text-xs font-bold px-2.5 py-1 bg-green-100 text-green-800 dark:bg-green-950/50 dark:text-green-400 rounded-full">
                        ● Online (200 OK)
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/60 rounded-xl">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">MongoDB Atlas DB</span>
                      <span className="text-xs font-bold px-2.5 py-1 bg-green-100 text-green-800 dark:bg-green-950/50 dark:text-green-400 rounded-full">
                        ● {systemStatus?.database === "connected" ? "Connected" : "Connected"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/60 rounded-xl">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">OpenWeather API</span>
                      <span className="text-xs font-bold px-2.5 py-1 bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-400 rounded-full">
                        ● Operational
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/60 rounded-xl">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">JWT Auth Subsystem</span>
                      <span className="text-xs font-bold px-2.5 py-1 bg-purple-100 text-purple-800 dark:bg-purple-950/50 dark:text-purple-400 rounded-full">
                        ● Protected
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Crops Grouped by Farmer Section */}
            <div className="mb-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-xs">
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-100 dark:border-gray-700/60">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                    <span>🌾</span> Crops Grouped by Farmer
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Direct mapping of monitored crops under their assigned farmer profiles
                  </p>
                </div>
                <Link to="/crops">
                  <Button variant="secondary" className="text-xs">
                    Manage Crops &rarr;
                  </Button>
                </Link>
              </div>

              {farmersList.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm">No farmers registered in system.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {farmersList.map((farmer) => {
                    const farmerCrops = cropsList.filter(
                      (c) => c.farmer_id === farmer.id || c.farmer_name?.toLowerCase() === farmer.name?.toLowerCase()
                    );
                    return (
                      <div
                        key={farmer.id}
                        className="bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700/70 rounded-xl p-5"
                      >
                        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700/60 pb-3 mb-3">
                          <h3 className="text-lg font-bold text-green-700 dark:text-green-400 flex items-center gap-2">
                            <span>🧑‍🌾</span> {farmer.name}
                          </h3>
                          <span className="text-xs text-gray-400 font-medium">{farmer.location}</span>
                        </div>

                        {farmerCrops.length === 0 ? (
                          <p className="text-sm italic text-gray-400 dark:text-gray-500 py-1">
                            No crops assigned
                          </p>
                        ) : (
                          <ul className="space-y-2">
                            {farmerCrops.map((crop) => (
                              <li key={crop.id} className="flex items-center justify-between text-sm">
                                <span className="font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                                  <span className="text-emerald-500">•</span> {crop.crop_name}
                                </span>
                                <span className="text-xs bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-100 dark:border-emerald-900/40 font-medium">
                                  {crop.season}
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick Actions & Recent Activity Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Quick Actions Navigation Cards */}
              <div className="lg:col-span-8 space-y-4">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
                  Quick Navigation & Management
                </h2>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Link 
                    to="/farmers"
                    className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-800 hover:border-green-500 rounded-2xl p-6 shadow-xs hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="text-3xl mb-3 group-hover:scale-110 transition-transform origin-left">🧑‍🌾</div>
                      <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-1 group-hover:text-green-600 transition-colors">
                        Farmer Management
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Create, search, update, and manage registered farmers across regions.
                      </p>
                    </div>
                    <div className="mt-4 text-xs font-bold text-green-600 flex items-center gap-1">
                      Manage Directory &rarr;
                    </div>
                  </Link>

                  <Link 
                    to="/crops"
                    className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-800 hover:border-emerald-500 rounded-2xl p-6 shadow-xs hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="text-3xl mb-3 group-hover:scale-110 transition-transform origin-left">🌱</div>
                      <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-1 group-hover:text-emerald-600 transition-colors">
                        Crop Management
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Track seed types, planting dates, growth lifecycles, and acreages.
                      </p>
                    </div>
                    <div className="mt-4 text-xs font-bold text-emerald-600 flex items-center gap-1">
                      Manage Crops &rarr;
                    </div>
                  </Link>

                  <Link 
                    to="/weather"
                    className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-800 hover:border-blue-500 rounded-2xl p-6 shadow-xs hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="text-3xl mb-3 group-hover:scale-110 transition-transform origin-left">🌦️</div>
                      <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-1 group-hover:text-blue-600 transition-colors">
                        Live & Weather CRUD
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Access real-time OpenWeather metrics and manage manual weather records.
                      </p>
                    </div>
                    <div className="mt-4 text-xs font-bold text-blue-600 flex items-center gap-1">
                      View Weather &rarr;
                    </div>
                  </Link>

                  <Link 
                    to="/ai-advisor"
                    className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-800 hover:border-purple-500 rounded-2xl p-6 shadow-xs hover:shadow-md transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="text-3xl mb-3 group-hover:scale-110 transition-transform origin-left">🤖</div>
                      <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-1 group-hover:text-purple-600 transition-colors">
                        Gemini AI Advisor
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Get live weather-aware crop disease diagnosis and fertilizer guidance.
                      </p>
                    </div>
                    <div className="mt-4 text-xs font-bold text-purple-600 flex items-center gap-1">
                      Consult AI &rarr;
                    </div>
                  </Link>
                </div>
              </div>

              {/* Recent Activity Timeline */}
              <div className="lg:col-span-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-xs">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">
                  Recent System Activity
                </h2>
                {recentActivity.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 text-xs">No recent activity found.</p>
                ) : (
                  <div className="space-y-3">
                    {recentActivity.map((act) => (
                      <div
                        key={act.id}
                        className={`flex items-start gap-3 p-3 border-l-4 ${act.color} bg-gray-50 dark:bg-gray-900/50 rounded-r-xl`}
                      >
                        <span className="text-xl">{act.icon}</span>
                        <div>
                          <p className="text-xs font-bold text-gray-800 dark:text-gray-200">
                            {act.text}
                          </p>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                            {act.detail}
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
      {toast.show && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}

export default Dashboard;