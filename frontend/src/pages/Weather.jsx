import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Loader, Toast, Button, Input, Modal } from "../components/ui";

function Weather() {
  const [weatherRecords, setWeatherRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Toast state
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  
  // Search query state
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modal & form states
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  // Helper to show auto-hiding toast messages
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3000);
  };

  // Fetch weather records (handles search if query is present)
  const fetchWeather = async (query = "") => {
    setLoading(true);
    setError("");
    try {
      const url = query.trim()
        ? `http://127.0.0.1:8000/api/weather/search?location=${encodeURIComponent(query)}`
        : `http://127.0.0.1:8000/api/weather/`;

      const token = localStorage.getItem("access_token");
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error("Failed to fetch weather data from server");
      }
      const data = await response.json();
      setWeatherRecords(data);
    } catch (err) {
      setError(err.message);
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // Debounced/realtime search effect
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchWeather(searchQuery);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Handle Input Changes in Registration Form
  const handleInputChange = (field, value) => {
    setNewWeather((prev) => ({ ...prev, [field]: value }));
    // Clear validation error if any when user types
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Form Validation
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
    else if (isNaN(rain) || rain < 0) errors.rainfall = "Rainfall must be greater than or equal to 0.";

    const wind = parseFloat(weatherData.wind_speed);
    if (weatherData.wind_speed === "") errors.wind_speed = "Wind speed is required.";
    else if (isNaN(wind) || wind < 0) errors.wind_speed = "Wind speed must be greater than or equal to 0.";

    if (!weatherData.weather_condition.trim()) errors.weather_condition = "Weather condition is required.";

    if (!weatherData.forecast_date) errors.forecast_date = "Forecast date is required.";

    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Registration Submit (POST)
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm(newWeather, setFormErrors)) return;

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch("http://127.0.0.1:8000/api/weather/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
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

      showToast("Weather record added successfully!", "success");
      setIsModalOpen(false);
      // Reset form
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
      // Refresh list
      fetchWeather(searchQuery);
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  // Handle Edit Click
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

  // Handle Edit Input Changes
  const handleEditInputChange = (field, value) => {
    setEditingWeather((prev) => ({ ...prev, [field]: value }));
    if (editFormErrors[field]) {
      setEditFormErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Handle Edit Submit (PUT)
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm(editingWeather, setEditFormErrors)) return;

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`http://127.0.0.1:8000/api/weather/${editingWeather.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
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
      // Refresh list
      fetchWeather(searchQuery);
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  // Handle Delete (DELETE)
  const handleDeleteWeather = async (id) => {
    if (!window.confirm("Are you sure you want to delete this weather record?")) return;

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`http://127.0.0.1:8000/api/weather/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error("Failed to delete weather record");
      }

      showToast("Weather record deleted successfully!", "success");
      // Refresh list
      fetchWeather(searchQuery);
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  // Helper to get weather condition icons
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

      <main className="flex-grow max-w-5xl w-full mx-auto p-6 md:p-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-green-700 dark:text-green-500">
              Weather Monitoring
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Track regional meteorological conditions, wind speed, rainfall, and humidity.
            </p>
          </div>
          <div>
            <Button variant="primary" onClick={() => setIsModalOpen(true)}>
              Add Record
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <Input
            placeholder="Search weather records by location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Dynamic Loading indicator */}
        {loading && (
          <div className="my-12">
            <Loader />
          </div>
        )}

        {/* Weather Records Grid */}
        {!loading && (
          <>
            {weatherRecords.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                <p className="text-lg text-gray-500 dark:text-gray-400">
                  {searchQuery ? "No weather records match your search." : "No weather records found."}
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {weatherRecords.map((record) => (
                  <div
                    key={record.id}
                    className="border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm p-6 bg-white dark:bg-gray-800 hover:shadow-md transition-shadow relative group"
                  >
                    <div className="flex justify-between items-start">
                      <div className="w-full">
                        <div className="flex items-center gap-3 mb-4">
                          <span className="text-3xl shrink-0" role="img" aria-label="weather status">
                            {getWeatherIcon(record.weather_condition)}
                          </span>
                          <div>
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 leading-tight">
                              {record.location}
                            </h2>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                              Forecast Date: {record.forecast_date}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-y-3 gap-x-4 border-t border-gray-100 dark:border-gray-700/50 pt-4">
                          <div>
                            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                              Temperature
                            </p>
                            <p className="text-lg font-bold text-gray-800 dark:text-gray-200 mt-0.5">
                              {record.temperature}°C
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                              Humidity
                            </p>
                            <p className="text-lg font-bold text-gray-800 dark:text-gray-200 mt-0.5">
                              {record.humidity}%
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                              Rainfall
                            </p>
                            <p className="text-lg font-bold text-gray-800 dark:text-gray-200 mt-0.5">
                              {record.rainfall} mm
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                              Wind Speed
                            </p>
                            <p className="text-lg font-bold text-gray-800 dark:text-gray-200 mt-0.5">
                              {record.wind_speed} km/h
                            </p>
                          </div>
                        </div>
                        
                        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700/50 flex justify-between items-center text-sm">
                          <span className="text-gray-500 dark:text-gray-400 font-medium">
                            Condition: <span className="text-green-600 dark:text-green-400 font-semibold">{record.weather_condition}</span>
                          </span>
                          <span className="text-gray-400 dark:text-gray-600">ID: #{record.id}</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-1 absolute top-4 right-4 bg-white/80 dark:bg-gray-800/80 rounded-lg p-0.5 shadow-sm border border-gray-100 dark:border-gray-700/50">
                        <button
                          onClick={() => handleEditClick(record)}
                          className="text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
                          title="Edit Record"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        
                        <button
                          onClick={() => handleDeleteWeather(record.id)}
                          className="text-red-500 hover:text-red-700 dark:hover:text-red-400 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                          title="Delete Record"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <Footer />

      {/* Registration Modal Form */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Weather Record">
        <form onSubmit={handleRegisterSubmit} className="space-y-4 mt-2">
          <Input
            label="Location"
            placeholder="e.g. Dehradun"
            value={newWeather.location}
            onChange={(e) => handleInputChange("location", e.target.value)}
            error={formErrors.location}
          />
          <Input
            label="Temperature (°C)"
            type="number"
            placeholder="e.g. 28.5"
            value={newWeather.temperature}
            onChange={(e) => handleInputChange("temperature", e.target.value)}
            error={formErrors.temperature}
          />
          <Input
            label="Humidity (%)"
            type="number"
            placeholder="e.g. 80"
            value={newWeather.humidity}
            onChange={(e) => handleInputChange("humidity", e.target.value)}
            error={formErrors.humidity}
          />
          <Input
            label="Rainfall (mm)"
            type="number"
            placeholder="e.g. 12"
            value={newWeather.rainfall}
            onChange={(e) => handleInputChange("rainfall", e.target.value)}
            error={formErrors.rainfall}
          />
          <Input
            label="Wind Speed (km/h)"
            type="number"
            placeholder="e.g. 15"
            value={newWeather.wind_speed}
            onChange={(e) => handleInputChange("wind_speed", e.target.value)}
            error={formErrors.wind_speed}
          />
          
          <div className="flex flex-col gap-2">
            <label className="block text-inherit">Weather Condition</label>
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
            {formErrors.weather_condition && <p className="text-red-500 text-sm">{formErrors.weather_condition}</p>}
          </div>

          <Input
            label="Forecast Date"
            type="date"
            value={newWeather.forecast_date}
            onChange={(e) => handleInputChange("forecast_date", e.target.value)}
            error={formErrors.forecast_date}
          />
          
          <div className="pt-2">
            <Button variant="primary" type="submit">
              Add Record
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal Form */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Weather Record">
        <form onSubmit={handleEditSubmit} className="space-y-4 mt-2">
          <Input
            label="Location"
            placeholder="e.g. Dehradun"
            value={editingWeather.location}
            onChange={(e) => handleEditInputChange("location", e.target.value)}
            error={editFormErrors.location}
          />
          <Input
            label="Temperature (°C)"
            type="number"
            placeholder="e.g. 28.5"
            value={editingWeather.temperature}
            onChange={(e) => handleEditInputChange("temperature", e.target.value)}
            error={editFormErrors.temperature}
          />
          <Input
            label="Humidity (%)"
            type="number"
            placeholder="e.g. 80"
            value={editingWeather.humidity}
            onChange={(e) => handleEditInputChange("humidity", e.target.value)}
            error={editFormErrors.humidity}
          />
          <Input
            label="Rainfall (mm)"
            type="number"
            placeholder="e.g. 12"
            value={editingWeather.rainfall}
            onChange={(e) => handleEditInputChange("rainfall", e.target.value)}
            error={editFormErrors.rainfall}
          />
          <Input
            label="Wind Speed (km/h)"
            type="number"
            placeholder="e.g. 15"
            value={editingWeather.wind_speed}
            onChange={(e) => handleEditInputChange("wind_speed", e.target.value)}
            error={editFormErrors.wind_speed}
          />
          
          <div className="flex flex-col gap-2">
            <label className="block text-inherit">Weather Condition</label>
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
            {editFormErrors.weather_condition && <p className="text-red-500 text-sm">{editFormErrors.weather_condition}</p>}
          </div>

          <Input
            label="Forecast Date"
            type="date"
            value={editingWeather.forecast_date}
            onChange={(e) => handleEditInputChange("forecast_date", e.target.value)}
            error={editFormErrors.forecast_date}
          />
          
          <div className="pt-2">
            <Button variant="primary" type="submit">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Notification Toast */}
      {toast.show && <Toast message={toast.message} />}
    </div>
  );
}

export default Weather;
