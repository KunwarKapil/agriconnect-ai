import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Loader, Toast, Button, Input, EmptyState } from "../components/ui";

function AIAdvisor() {
  const [formData, setFormData] = useState({
    crop: "",
    problem: "",
    soil: "",
    temperature: "",
    humidity: "",
    weather_condition: "",
    notes: "",
  });

  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetchingWeather, setFetchingWeather] = useState(false);
  const [advice, setAdvice] = useState("");
  const [parsedSections, setParsedSections] = useState(null);
  const [aiError, setAiError] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 4000);
  };

  // Auto-fill Live Weather metrics from OpenWeather backend API
  const handleAutoFillWeather = async () => {
    setFetchingWeather(true);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch("http://127.0.0.1:8000/api/weather/live?city=Dehradun", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        throw new Error("Failed to fetch live weather data.");
      }
      const data = await res.json();
      setFormData((prev) => ({
        ...prev,
        temperature: data.temperature?.toString() || "",
        humidity: data.humidity?.toString() || "",
        weather_condition: data.weather_main || data.weather_description || "Sunny",
      }));
      showToast("Live weather metrics auto-filled from OpenWeather!", "info");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setFetchingWeather(false);
    }
  };

  // Fetch live weather once on load to populate defaults if empty
  useEffect(() => {
    handleAutoFillWeather();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.crop.trim()) {
      errors.crop = "Crop name is required.";
    }
    if (!formData.problem.trim()) {
      errors.problem = "Problem observed is required.";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Parse Markdown sections into distinct UI cards
  const parseMarkdownToSections = (markdownText) => {
    if (!markdownText) return null;

    const sectionTitles = [
      { key: "analysis", title: "Problem Analysis", icon: "🔍" },
      { key: "causes", title: "Possible Causes", icon: "⚠️" },
      { key: "treatment", title: "Treatment", icon: "🩹" },
      { key: "fertilizer", title: "Fertilizer Suggestion", icon: "🧪" },
      { key: "prevention", title: "Prevention", icon: "🛡️" },
      { key: "disclaimer", title: "Disclaimer", icon: "ℹ️" },
    ];

    const result = {};
    sectionTitles.forEach((sec) => {
      result[sec.key] = "";
    });

    const lines = markdownText.split("\n");
    let currentKey = null;

    lines.forEach((line) => {
      const lower = line.toLowerCase();
      if (lower.includes("problem analysis")) currentKey = "analysis";
      else if (lower.includes("possible causes") || lower.includes("cause")) currentKey = "causes";
      else if (lower.includes("treatment") || lower.includes("recommended actions")) currentKey = "treatment";
      else if (lower.includes("fertilizer")) currentKey = "fertilizer";
      else if (lower.includes("prevention")) currentKey = "prevention";
      else if (lower.includes("disclaimer")) currentKey = "disclaimer";
      else if (currentKey) {
        result[currentKey] += line + "\n";
      }
    });

    return result;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setAdvice("");
    setParsedSections(null);
    setAiError("");

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch("http://127.0.0.1:8000/api/ai/advisor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          crop: formData.crop,
          problem: formData.problem,
          soil: formData.soil || null,
          temperature: formData.temperature || null,
          humidity: formData.humidity || null,
          weather_condition: formData.weather_condition || null,
          notes: formData.notes || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.detail || "Failed to retrieve advice from Gemini.");
      }

      if (data.success) {
        setAdvice(data.response);
        setParsedSections(parseMarkdownToSections(data.response));
        showToast("Gemini advisory generated successfully!", "success");
      } else {
        throw new Error(data.message || "An error occurred generating response.");
      }
    } catch (err) {
      setAiError(err.message);
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const formatTextSnippet = (str) => {
    if (!str) return null;
    return str.split("\n").map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) return null;
      const parts = trimmed.replace(/^[#*-\d.\s]+/, "").split(/\*\*(.*?)\*\*/g);
      return (
        <p key={idx} className="my-1 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
          {parts.map((p, i) =>
            i % 2 === 1 ? (
              <strong key={i} className="font-bold text-green-700 dark:text-green-400">
                {p}
              </strong>
            ) : (
              p
            )
          )}
        </p>
      );
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
      <Navbar />

      <main className="flex-grow max-w-6xl w-full mx-auto p-4 sm:p-6 md:p-8">
        {/* Header Section */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-green-700 dark:text-green-500">
              AI Farm Advisor
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm sm:text-base">
              Real-time crop diagnostic & cultivation advice powered by Google Gemini AI & Live Weather.
            </p>
          </div>
          <button
            onClick={handleAutoFillWeather}
            disabled={fetchingWeather}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-xl text-sm font-semibold border border-blue-200 dark:border-blue-900/50 transition cursor-pointer"
          >
            <span>☁️</span> {fetchingWeather ? "Syncing..." : "Auto-Fill Live Weather"}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Input Form Column */}
          <div className="lg:col-span-5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2 border-b border-gray-100 dark:border-gray-700/50 pb-3">
              <span>🌾</span> Crop & Environment Details
            </h2>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <Input
                label="Crop Name *"
                placeholder="e.g. Wheat"
                value={formData.crop}
                onChange={(e) => handleInputChange("crop", e.target.value)}
                error={formErrors.crop}
              />

              <Input
                label="Problem Observed *"
                placeholder="e.g. Leaves turning yellow with brown spots"
                value={formData.problem}
                onChange={(e) => handleInputChange("problem", e.target.value)}
                error={formErrors.problem}
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Temperature (°C)"
                  type="number"
                  placeholder="Auto-filled"
                  value={formData.temperature}
                  onChange={(e) => handleInputChange("temperature", e.target.value)}
                />

                <Input
                  label="Humidity (%)"
                  type="number"
                  placeholder="Auto-filled"
                  value={formData.humidity}
                  onChange={(e) => handleInputChange("humidity", e.target.value)}
                />
              </div>

              <Input
                label="Weather Condition"
                placeholder="e.g. Sunny / Rainy / Cloudy"
                value={formData.weather_condition}
                onChange={(e) => handleInputChange("weather_condition", e.target.value)}
              />

              <Input
                label="Soil Type (Optional)"
                placeholder="e.g. Sandy clay loam"
                value={formData.soil}
                onChange={(e) => handleInputChange("soil", e.target.value)}
              />

              <div className="flex flex-col gap-2">
                <label className="block text-sm font-medium text-inherit">
                  Additional Notes (Optional)
                </label>
                <textarea
                  rows="3"
                  placeholder="e.g. Symptoms worsened after heavy rainfall."
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  className="border p-2.5 rounded-xl bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600 text-sm"
                />
              </div>

              <div className="pt-3">
                <Button
                  variant="primary"
                  type="submit"
                  loading={loading}
                  className="w-full justify-center py-3 text-base shadow-md"
                >
                  Analyze with AI
                </Button>
              </div>
            </form>
          </div>

          {/* AI Response Column */}
          <div className="lg:col-span-7 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm min-h-[540px] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700/50 pb-4 mb-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                  <span>🤖</span> Gemini AI Diagnostic Report
                </h2>
                <span className="text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-2.5 py-1 rounded-full border border-purple-200 dark:border-purple-900/40">
                  Gemini 3.5 Flash
                </span>
              </div>

              {loading && (
                <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
                  <Loader />
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 animate-pulse">
                    Analyzing crop parameters and live weather factors...
                  </p>
                </div>
              )}

              {!loading && aiError && (
                <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 p-6 rounded-2xl text-center space-y-3">
                  <div className="text-4xl text-red-500">⚠️</div>
                  <h3 className="text-lg font-bold text-red-800 dark:text-red-300">
                    AI Advisor Communication Error
                  </h3>
                  <p className="text-sm text-red-700 dark:text-red-400 max-w-md mx-auto">
                    {aiError}
                  </p>
                  <Button variant="primary" onClick={handleFormSubmit} className="mt-2 bg-red-600 hover:bg-red-700">
                    Retry Analysis
                  </Button>
                </div>
              )}

              {!loading && !advice && !aiError && (
                <EmptyState
                  icon="🧠"
                  title="No AI Analysis Performed"
                  description="Fill in your crop name, problem observed, and live environmental parameters on the left, then click 'Analyze with AI'."
                />
              )}

              {!loading && advice && (
                <div className="space-y-4">
                  {/* Section 1: Problem Analysis */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700/60">
                    <h3 className="text-base font-bold text-green-700 dark:text-green-400 mb-1 flex items-center gap-2">
                      <span>🔍</span> 1. Problem Analysis
                    </h3>
                    {formatTextSnippet(parsedSections?.analysis || advice.substring(0, 200))}
                  </div>

                  {/* Section 2: Possible Causes */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700/60">
                    <h3 className="text-base font-bold text-amber-700 dark:text-amber-400 mb-1 flex items-center gap-2">
                      <span>⚠️</span> 2. Possible Causes
                    </h3>
                    {formatTextSnippet(parsedSections?.causes || advice)}
                  </div>

                  {/* Section 3: Treatment */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700/60">
                    <h3 className="text-base font-bold text-blue-700 dark:text-blue-400 mb-1 flex items-center gap-2">
                      <span>🩹</span> 3. Treatment & Immediate Actions
                    </h3>
                    {formatTextSnippet(parsedSections?.treatment || advice)}
                  </div>

                  {/* Section 4: Fertilizer Suggestion */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700/60">
                    <h3 className="text-base font-bold text-purple-700 dark:text-purple-400 mb-1 flex items-center gap-2">
                      <span>🧪</span> 4. Fertilizer & Nutrient Suggestions
                    </h3>
                    {formatTextSnippet(parsedSections?.fertilizer || advice)}
                  </div>

                  {/* Section 5: Prevention */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-700/60">
                    <h3 className="text-base font-bold text-emerald-700 dark:text-emerald-400 mb-1 flex items-center gap-2">
                      <span>🛡️</span> 5. Prevention Tips & Care
                    </h3>
                    {formatTextSnippet(parsedSections?.prevention || advice)}
                  </div>

                  {/* Section 6: Disclaimer */}
                  <div className="p-3 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl border border-amber-200/50 dark:border-amber-900/30 text-xs text-amber-800 dark:text-amber-300">
                    <strong className="font-bold">ℹ️ Disclaimer: </strong>
                    {parsedSections?.disclaimer
                      ? parsedSections.disclaimer
                      : "This AI agricultural analysis is for informational purposes only. Consult local agricultural extension officers before applying heavy chemical treatments."}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
      {toast.show && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}

export default AIAdvisor;
