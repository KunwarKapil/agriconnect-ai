import { useEffect, useState, useCallback } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Loader, Toast, Button, Input, Modal, ConfirmDialog, EmptyState } from "../components/ui";
import { API_BASE_URL } from "../config";

function Weather() {
  const [weatherRecords, setWeatherRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  // Live Weather state
  const [liveCity, setLiveCity] = useState("Dehradun");
  const [liveCityInput, setLiveCityInput] = useState("Dehradun");
  const [liveWeather, setLiveWeather] = useState(null);
  const [liveLoading, setLiveLoading] = useState(false);

  // Toast state
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  // Search query state for CRUD records
  const [searchQuery, setSearchQuery] = useState("");

  // Modal & form submit states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newWeather, setNewWeather] = useState({
    location: "",
    temperature: "",
    humidity: "",
    rainfall: "",
    wind_speed: "",
    weather_condition: "Sunny",
    forecast_date: "",
  });
  const [formErrors, setFormErrors] = useState({});

  // Edit modal & form states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingWeather, setEditingWeather] = useState({
    id: "",
    location: "",
    temperature: "",
    humidity: "",
    rainfall: "",
    wind_speed: "",
    weather_condition: "",
    forecast_date: "",
  });
  const [editFormErrors, setEditFormErrors] = useState({});

  // Confirm Delete Dialog state
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, recordId: null, loading: false });

  // Helper to show auto-hiding toast messages
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3500);
  };

  // Fetch Live Weather from OpenWeather API via FastAPI backend
  const fetchLiveWeather = useCallback(async (city = "Dehradun") => {
    if (!city || !city.trim()) {
      showToast("Please enter a city name to search.", "error");
      return;
    }
    setLiveLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${API_BASE_URL}/api/weather/live?city=${encodeURIComponent(city.trim())}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to fetch live weather data.");
      }
      const data = await res.json();
      setLiveWeather(data);
      setLiveCity(data.city);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLiveLoading(false);
    }
  }, []);

  // Fetch weather CRUD records
  const fetchWeather = useCallback(async (query = "") => {
    setLoading(true);
    try {
      const url = query.trim()
        ? `${API_BASE_URL}/api/weather/search?location=${encodeURIComponent(query)}`
        : `${API_BASE_URL}/api/weather/`;

      const token = localStorage.getItem("access_token");
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch weather data from server");
      }
      const data = await response.json();
      setWeatherRecords(data);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch initial data
  useEffect(() => {
    fetchLiveWeather("Dehradun");
  }, [fetchLiveWeather]);

  // Debounced search for CRUD records
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchWeather(searchQuery);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, fetchWeather]);

  const handleLiveCitySubmit = (e) => {
    e.preventDefault();
    if (!liveCityInput || !liveCityInput.trim()) {
      showToast("Please enter a city name to search.", "error");
      return;
    }
    fetchLiveWeather(liveCityInput.trim());
  };

  const handleInputChange = (field, value) => {
    setNewWeather((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = (weatherData, setErrors) => {
    const errors = {};
    if (!weatherData.location.trim()) errors.location = "Location is required.";
    else if (weatherData.location.trim().length < 2) errors.location = "Location must be at least 2 characters.";

    const temp = parseFloat(weatherData.temperature);
    if (weatherData.temperature === "") errors.temperature = "Temperature is required.";
    else if (isNaN(temp)) errors.temperature = "Temperature must be a valid number.";

    const hum = parseFloat(weatherData.humidity);
    if (weatherData.humidity === "") errors.humidity = "Humidity is required.";
    else if (isNaN(hum) || hum < 0 || hum > 100) errors.humidity = "Humidity must be between 0 and 100.";

    const rain = parseFloat(weatherData.rainfall);
    if (weatherData.rainfall === "") errors.rainfall = "Rainfall is required.";
    else if (isNaN(rain) || rain < 0) errors.rainfall = "Rainfall must be >= 0.";

    const wind = parseFloat(weatherData.wind_speed);
    if (weatherData.wind_speed === "") errors.wind_speed = "Wind speed is required.";
    else if (isNaN(wind) || wind < 0) errors.wind_speed = "Wind speed must be >= 0.";

    if (!weatherData.weather_condition.trim()) errors.weather_condition = "Weather condition is required.";

    if (!weatherData.forecast_date) errors.forecast_date = "Forecast date is required.";

    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Create Weather Record (POST)
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm(newWeather, setFormErrors)) return;

    setSubmitting(true);
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_BASE_URL}/api/weather/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          location: newWeather.location,
          temperature: parseFloat(newWeather.temperature),
          humidity: parseFloat(newWeather.humidity),
          rainfall: parseFloat(newWeather.rainfall),
          wind_speed: parseFloat(newWeather.wind_speed),
          weather_condition: newWeather.weather_condition,
          forecast_date: newWeather.forecast_date,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to add weather record");
      }

      showToast("Weather record created successfully!", "success");
      setIsModalOpen(false);
      setNewWeather({
        location: "",
        temperature: "",
        humidity: "",
        rainfall: "",
        wind_speed: "",
        weather_condition: "Sunny",
        forecast_date: "",
      });
      setFormErrors({});
      fetchWeather(searchQuery);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (record) => {
    setEditingWeather({
      id: record.id,
      location: record.location,
      temperature: record.temperature.toString(),
      humidity: record.humidity.toString(),
      rainfall: record.rainfall.toString(),
      wind_speed: record.wind_speed.toString(),
      weather_condition: record.weather_condition,
      forecast_date: record.forecast_date,
    });
    setEditFormErrors({});
    setIsEditModalOpen(true);
  };

  const handleEditInputChange = (field, value) => {
    setEditingWeather((prev) => ({ ...prev, [field]: value }));
    if (editFormErrors[field]) {
      setEditFormErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Edit Weather Record (PUT)
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm(editingWeather, setEditFormErrors)) return;

    setSubmitting(true);
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_BASE_URL}/api/weather/${editingWeather.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          location: editingWeather.location,
          temperature: parseFloat(editingWeather.temperature),
          humidity: parseFloat(editingWeather.humidity),
          rainfall: parseFloat(editingWeather.rainfall),
          wind_speed: parseFloat(editingWeather.wind_speed),
          weather_condition: editingWeather.weather_condition,
          forecast_date: editingWeather.forecast_date,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to update weather record");
      }

      showToast("Weather record updated successfully!", "success");
      setIsEditModalOpen(false);
      fetchWeather(searchQuery);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Open confirm delete dialog
  const promptDeleteWeather = (id) => {
    setDeleteDialog({ isOpen: true, recordId: id, loading: false });
  };

  // Confirm delete handler (DELETE)
  const handleConfirmDelete = async () => {
    if (!deleteDialog.recordId) return;

    setDeleteDialog((prev) => ({ ...prev, loading: true }));
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_BASE_URL}/api/weather/${deleteDialog.recordId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete weather record");
      }

      showToast("Weather record deleted successfully!", "success");
      setDeleteDialog({ isOpen: false, recordId: null, loading: false });
      fetchWeather(searchQuery);
    } catch (err) {
      showToast(err.message, "error");
      setDeleteDialog((prev) => ({ ...prev, loading: false }));
    }
  };

  const getWeatherIcon = (condition) => {
    const icons = {
      Sunny: "☀️",
      Rainy: "🌧️",
      Cloudy: "☁️",
      Windy: "💨",
      Stormy: "⛈️",
    };
    return icons[condition] || "🌡️";
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
      <Navbar />

      <main className="flex-grow max-w-6xl w-full mx-auto p-4 sm:p-6 md:p-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-green-700 dark:text-green-500">
              Weather Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm sm:text-base">
              Real-time OpenWeather insights & manual meteorological CRUD records.
            </p>
          </div>
          <div>
            <Button variant="primary" onClick={() => setIsModalOpen(true)}>
              + Add Weather Record
            </Button>
          </div>
        </div>

        {/* SECTION 1: LIVE WEATHER (OpenWeather API Integration) */}
        <section className="mb-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-700/60 pb-5 mb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-900/40">
                🌐 Live OpenWeather Service
              </span>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-2">
                Real-Time Weather Metrics
              </h2>
            </div>

            {/* City search form for Live Weather */}
            <form onSubmit={handleLiveCitySubmit} className="flex items-center gap-2 max-w-xs w-full">
              <Input
                placeholder="Enter city name..."
                value={liveCityInput}
                onChange={(e) => setLiveCityInput(e.target.value)}
                className="text-sm py-1.5"
              />
              <Button variant="primary" type="submit" loading={liveLoading} className="shrink-0 text-sm py-2">
                Get Weather
              </Button>
            </form>
          </div>

          {liveLoading ? (
            <div className="py-12">
              <Loader />
            </div>
          ) : liveWeather ? (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-blue-950/30 p-5 rounded-xl border border-blue-100 dark:border-blue-900/30">
                <div className="flex items-center gap-4">
                  <div className="text-5xl shrink-0 p-2 bg-white dark:bg-gray-800 rounded-2xl shadow-xs">
                    {liveWeather.weather_icon ? (
                      <img
                        src={`https://openweathermap.org/img/wn/${liveWeather.weather_icon}@2x.png`}
                        alt={liveWeather.weather_description}
                        className="w-12 h-12"
                      />
                    ) : (
                      "☀️"
                    )}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {liveWeather.city}, {liveWeather.country}
                    </h3>
                    <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 capitalize">
                      {liveWeather.weather_description} ({liveWeather.weather_main})
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-4xl font-extrabold text-gray-900 dark:text-white">
                    {liveWeather.temperature}°C
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Feels like {liveWeather.feels_like}°C
                  </p>
                </div>
              </div>

              {/* Grid of 8 Live Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800">
                  <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Humidity</p>
                  <p className="text-xl font-bold text-gray-800 dark:text-gray-200 mt-1">{liveWeather.humidity}%</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800">
                  <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Pressure</p>
                  <p className="text-xl font-bold text-gray-800 dark:text-gray-200 mt-1">{liveWeather.pressure} hPa</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800">
                  <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Wind Speed</p>
                  <p className="text-xl font-bold text-gray-800 dark:text-gray-200 mt-1">{liveWeather.wind_speed} m/s</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800">
                  <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Visibility</p>
                  <p className="text-xl font-bold text-gray-800 dark:text-gray-200 mt-1">{liveWeather.visibility} km</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800">
                  <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Cloud Cover</p>
                  <p className="text-xl font-bold text-gray-800 dark:text-gray-200 mt-1">{liveWeather.cloud_pct}%</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800">
                  <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Weather Condition</p>
                  <p className="text-xl font-bold text-gray-800 dark:text-gray-200 mt-1">{liveWeather.weather_main}</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800">
                  <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">City</p>
                  <p className="text-xl font-bold text-gray-800 dark:text-gray-200 mt-1">{liveWeather.city}</p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800">
                  <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Last Updated</p>
                  <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mt-2">{liveWeather.last_updated}</p>
                </div>
              </div>
            </div>
          ) : null}
        </section>

        {/* SECTION 2: MANUAL WEATHER RECORDS (CRUD) */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              Regional Weather Records (CRUD)
            </h2>
            <div className="w-full sm:w-72">
              <Input
                placeholder="Search records by location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="my-12">
              <Loader />
            </div>
          ) : weatherRecords.length === 0 ? (
            <EmptyState
              icon="☀️"
              title="No Weather Records"
              description={
                searchQuery
                  ? `No manual weather records match "${searchQuery}".`
                  : "No weather records logged in system database yet."
              }
              actionText="+ Add Weather Record"
              onAction={() => setIsModalOpen(true)}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {weatherRecords.map((record) => (
                <div
                  key={record.id}
                  className="border border-gray-200 dark:border-gray-800 rounded-2xl p-6 bg-white dark:bg-gray-800 shadow-xs hover:shadow-md transition relative group"
                >
                  <div className="flex justify-between items-start">
                    <div className="w-full">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-3xl shrink-0" role="img" aria-label="weather icon">
                          {getWeatherIcon(record.weather_condition)}
                        </span>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                            {record.location}
                          </h3>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                            Forecast Date: {record.forecast_date}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 border-t border-gray-100 dark:border-gray-700/50 pt-4">
                        <div>
                          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase">Temp</p>
                          <p className="text-base font-bold text-gray-800 dark:text-gray-200">{record.temperature}°C</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase">Humidity</p>
                          <p className="text-base font-bold text-gray-800 dark:text-gray-200">{record.humidity}%</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase">Rainfall</p>
                          <p className="text-base font-bold text-gray-800 dark:text-gray-200">{record.rainfall} mm</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase">Wind</p>
                          <p className="text-base font-bold text-gray-800 dark:text-gray-200">{record.wind_speed} km/h</p>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700/50 flex justify-between items-center text-xs">
                        <span className="text-gray-500 dark:text-gray-400">
                          Condition: <strong className="text-green-600 dark:text-green-400">{record.weather_condition}</strong>
                        </span>
                        <span className="text-gray-400 font-mono">ID: #{record.id}</span>
                      </div>
                    </div>

                    <div className="flex gap-1 absolute top-4 right-4 bg-white/90 dark:bg-gray-800/90 rounded-lg p-1 border border-gray-100 dark:border-gray-700">
                      <button
                        onClick={() => handleEditClick(record)}
                        className="text-blue-500 hover:text-blue-700 p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/30 transition cursor-pointer"
                        title="Edit Record"
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => promptDeleteWeather(record.id)}
                        className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition cursor-pointer"
                        title="Delete Record"
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />

      {/* Registration Modal Form */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Weather Record">
        <form onSubmit={handleRegisterSubmit} className="space-y-4 mt-2">
          <Input
            label="Location *"
            placeholder="e.g. Dehradun"
            value={newWeather.location}
            onChange={(e) => handleInputChange("location", e.target.value)}
            error={formErrors.location}
          />
          <Input
            label="Temperature (°C) *"
            type="number"
            placeholder="e.g. 28.5"
            value={newWeather.temperature}
            onChange={(e) => handleInputChange("temperature", e.target.value)}
            error={formErrors.temperature}
          />
          <Input
            label="Humidity (%) *"
            type="number"
            placeholder="e.g. 80"
            value={newWeather.humidity}
            onChange={(e) => handleInputChange("humidity", e.target.value)}
            error={formErrors.humidity}
          />
          <Input
            label="Rainfall (mm) *"
            type="number"
            placeholder="e.g. 12"
            value={newWeather.rainfall}
            onChange={(e) => handleInputChange("rainfall", e.target.value)}
            error={formErrors.rainfall}
          />
          <Input
            label="Wind Speed (km/h) *"
            type="number"
            placeholder="e.g. 15"
            value={newWeather.wind_speed}
            onChange={(e) => handleInputChange("wind_speed", e.target.value)}
            error={formErrors.wind_speed}
          />
          
          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium text-inherit">Weather Condition *</label>
            <select
              value={newWeather.weather_condition}
              onChange={(e) => handleInputChange("weather_condition", e.target.value)}
              className="border p-2 rounded bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-600"
            >
              <option value="Sunny">Sunny</option>
              <option value="Rainy">Rainy</option>
              <option value="Cloudy">Cloudy</option>
              <option value="Windy">Windy</option>
              <option value="Stormy">Stormy</option>
            </select>
            {formErrors.weather_condition && <p className="text-red-500 text-xs">{formErrors.weather_condition}</p>}
          </div>

          <Input
            label="Forecast Date *"
            type="date"
            value={newWeather.forecast_date}
            onChange={(e) => handleInputChange("forecast_date", e.target.value)}
            error={formErrors.forecast_date}
          />
          
          <div className="pt-2">
            <Button variant="primary" type="submit" loading={submitting} className="w-full justify-center">
              Add Weather Record
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal Form */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Weather Record">
        <form onSubmit={handleEditSubmit} className="space-y-4 mt-2">
          <Input
            label="Location *"
            placeholder="e.g. Dehradun"
            value={editingWeather.location}
            onChange={(e) => handleEditInputChange("location", e.target.value)}
            error={editFormErrors.location}
          />
          <Input
            label="Temperature (°C) *"
            type="number"
            placeholder="e.g. 28.5"
            value={editingWeather.temperature}
            onChange={(e) => handleEditInputChange("temperature", e.target.value)}
            error={editFormErrors.temperature}
          />
          <Input
            label="Humidity (%) *"
            type="number"
            placeholder="e.g. 80"
            value={editingWeather.humidity}
            onChange={(e) => handleEditInputChange("humidity", e.target.value)}
            error={editFormErrors.humidity}
          />
          <Input
            label="Rainfall (mm) *"
            type="number"
            placeholder="e.g. 12"
            value={editingWeather.rainfall}
            onChange={(e) => handleEditInputChange("rainfall", e.target.value)}
            error={editFormErrors.rainfall}
          />
          <Input
            label="Wind Speed (km/h) *"
            type="number"
            placeholder="e.g. 15"
            value={editingWeather.wind_speed}
            onChange={(e) => handleEditInputChange("wind_speed", e.target.value)}
            error={editFormErrors.wind_speed}
          />
          
          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium text-inherit">Weather Condition *</label>
            <select
              value={editingWeather.weather_condition}
              onChange={(e) => handleEditInputChange("weather_condition", e.target.value)}
              className="border p-2 rounded bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-600"
            >
              <option value="Sunny">Sunny</option>
              <option value="Rainy">Rainy</option>
              <option value="Cloudy">Cloudy</option>
              <option value="Windy">Windy</option>
              <option value="Stormy">Stormy</option>
            </select>
            {editFormErrors.weather_condition && <p className="text-red-500 text-xs">{editFormErrors.weather_condition}</p>}
          </div>

          <Input
            label="Forecast Date *"
            type="date"
            value={editingWeather.forecast_date}
            onChange={(e) => handleEditInputChange("forecast_date", e.target.value)}
            error={editFormErrors.forecast_date}
          />
          
          <div className="pt-2">
            <Button variant="primary" type="submit" loading={submitting} className="w-full justify-center">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, recordId: null, loading: false })}
        onConfirm={handleConfirmDelete}
        title="Delete Weather Record?"
        message="Are you sure you want to permanently remove this weather record? This action cannot be undone."
        loading={deleteDialog.loading}
      />

      {/* Notification Toast */}
      {toast.show && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}

export default Weather;
