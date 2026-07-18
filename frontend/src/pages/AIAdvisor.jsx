import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Loader, Toast, Button, Input } from "../components/ui";

function AIAdvisor() {
  const [formData, setFormData] = useState({
    crop: "",
    problem: "",
    soil: "",
    temperature: "",
    humidity: "",
    notes: "",
  });

  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 4000);
  };

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

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setAdvice("");
    
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch("http://127.0.0.1:8000/api/ai/advisor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          crop: formData.crop,
          problem: formData.problem,
          soil: formData.soil || null,
          temperature: formData.temperature || null,
          humidity: formData.humidity || null,
          notes: formData.notes || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.detail || "Failed to retrieve advice from Gemini.");
      }

      if (data.success) {
        setAdvice(data.response);
      } else {
        throw new Error(data.message || "An error occurred generating response.");
      }
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // Helper to render basic Markdown features (headings, bold text, bullets)
  const renderResponseMarkdown = (text) => {
    if (!text) return null;
    return text.split("\n").map((line, index) => {
      const trimmed = line.trim();
      
      const formatBold = (str) => {
        const parts = str.split(/\*\*(.*?)\*\*/g);
        return parts.map((part, i) => i % 2 === 1 ? <strong key={i} className="font-bold text-green-700 dark:text-green-400">{part}</strong> : part);
      };

      if (trimmed.startsWith("### ")) {
        return <h4 key={index} className="text-md font-bold text-gray-800 dark:text-gray-200 mt-4 mb-1.5">{formatBold(trimmed.substring(4))}</h4>;
      }
      if (trimmed.startsWith("## ")) {
        return <h3 key={index} className="text-lg font-bold text-green-700 dark:text-green-500 mt-5 mb-2 border-b pb-0.5 border-gray-200 dark:border-gray-700">{formatBold(trimmed.substring(3))}</h3>;
      }
      if (trimmed.startsWith("# ")) {
        return <h2 key={index} className="text-xl font-bold text-green-700 dark:text-green-500 mt-6 mb-2.5 border-b pb-1 border-gray-200 dark:border-gray-700">{formatBold(trimmed.substring(2))}</h2>;
      }
      if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        return (
          <li key={index} className="ml-5 list-disc text-gray-700 dark:text-gray-300 my-1">
            {formatBold(trimmed.substring(2))}
          </li>
        );
      }
      if (trimmed === "") {
        return <div key={index} className="h-2"></div>;
      }
      return <p key={index} className="text-gray-700 dark:text-gray-300 leading-relaxed my-1 text-sm">{formatBold(line)}</p>;
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
      <Navbar />

      <main className="flex-grow max-w-6xl w-full mx-auto p-6 md:p-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-green-700 dark:text-green-500">
            AI Farm Advisor
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Get personalized, real-time diagnostic and cultivation advice powered by Google Gemini AI.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Input Form Column */}
          <div className="lg:col-span-5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
              <span>🌾</span> Form Details
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
                placeholder="e.g. Leaves turning yellow"
                value={formData.problem}
                onChange={(e) => handleInputChange("problem", e.target.value)}
                error={formErrors.problem}
              />
              <Input
                label="Soil Type (Optional)"
                placeholder="e.g. Sandy clay loam"
                value={formData.soil}
                onChange={(e) => handleInputChange("soil", e.target.value)}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Temp (°C) (Optional)"
                  type="number"
                  placeholder="e.g. 34"
                  value={formData.temperature}
                  onChange={(e) => handleInputChange("temperature", e.target.value)}
                />
                <Input
                  label="Humidity (%) (Optional)"
                  type="number"
                  placeholder="e.g. 58"
                  value={formData.humidity}
                  onChange={(e) => handleInputChange("humidity", e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="block text-inherit font-medium">
                  Additional Notes (Optional)
                </label>
                <textarea
                  rows="3"
                  placeholder="e.g. Started after heavy rainfall."
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  className="border p-2 rounded bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600 text-sm"
                />
              </div>

              <div className="pt-2">
                <Button variant="primary" type="submit" className="w-full justify-center">
                  Analyze with AI
                </Button>
              </div>
            </form>
          </div>

          {/* AI Response Column */}
          <div className="lg:col-span-7 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm min-h-[480px] flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2 border-b border-gray-100 dark:border-gray-700/50 pb-4">
                <span>🤖</span> AI Advisory Report
              </h2>

              {loading && (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <Loader />
                  <p className="text-sm text-gray-500 dark:text-gray-400 animate-pulse">
                    Consulting Gemini AI Advisor... Please wait
                  </p>
                </div>
              )}

              {!loading && !advice && (
                <div className="flex flex-col items-center justify-center py-20 text-center text-gray-400 dark:text-gray-500">
                  <span className="text-5xl mb-4">🧠</span>
                  <h3 className="text-lg font-bold mb-1">No Analysis Done</h3>
                  <p className="text-sm max-w-sm">
                    Enter the crop name, current issue observed, and secondary details on the left, then click "Analyze with AI".
                  </p>
                </div>
              )}

              {!loading && advice && (
                <div className="prose dark:prose-invert max-w-none text-gray-800 dark:text-gray-200">
                  {renderResponseMarkdown(advice)}
                </div>
              )}
            </div>

            {advice && !loading && (
              <div className="mt-8 pt-4 border-t border-gray-100 dark:border-gray-700/50 flex justify-end">
                <span className="text-xs text-purple-600 dark:text-purple-400 font-semibold px-2.5 py-1 bg-purple-50 dark:bg-purple-950/30 rounded-full border border-purple-200 dark:border-purple-800/30">
                  Powered by Gemini 1.5 Flash
                </span>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />

      {/* Notification Toast */}
      {toast.show && <Toast message={toast.message} />}
    </div>
  );
}

export default AIAdvisor;
