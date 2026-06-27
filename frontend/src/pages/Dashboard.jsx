import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Loader, Toast, Button, Input, Modal } from "../components/ui";

function Dashboard() {
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Toast state
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  
  // Search query state
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modal & form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newFarmer, setNewFarmer] = useState({
    name: "",
    location: "",
    contact: "",
    farm_size_acres: "",
  });
  const [formErrors, setFormErrors] = useState({});

  // Helper to show auto-hiding toast messages
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3000);
  };

  // Fetch farmers (handles search if query is present)
  const fetchFarmers = async (query = "") => {
    setLoading(true);
    setError("");
    try {
      const url = query.trim()
        ? `http://127.0.0.1:8000/api/farmers/search?name=${encodeURIComponent(query)}`
        : `http://127.0.0.1:8000/api/farmers/`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch farmers data from server");
      }
      const data = await response.json();
      setFarmers(data);
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
      fetchFarmers(searchQuery);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Handle Input Changes in Registration Form
  const handleInputChange = (field, value) => {
    setNewFarmer((prev) => ({ ...prev, [field]: value }));
    // Clear validation error if any when user types
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Form Validation
  const validateForm = () => {
    const errors = {};
    if (!newFarmer.name.trim()) errors.name = "Name is required.";
    else if (newFarmer.name.trim().length < 2) errors.name = "Name must be at least 2 characters.";

    if (!newFarmer.location.trim()) errors.location = "Location is required.";

    if (!newFarmer.contact.trim()) errors.contact = "Contact number is required.";
    else if (newFarmer.contact.trim().length < 10) errors.contact = "Contact must be at least 10 digits.";

    const size = parseFloat(newFarmer.farm_size_acres);
    if (!newFarmer.farm_size_acres) errors.farm_size_acres = "Farm size is required.";
    else if (isNaN(size) || size <= 0) errors.farm_size_acres = "Farm size must be greater than 0.";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle Registration Submit (POST)
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const response = await fetch("http://127.0.0.1:8000/api/farmers/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newFarmer.name,
          location: newFarmer.location,
          contact: newFarmer.contact,
          farm_size_acres: parseFloat(newFarmer.farm_size_acres),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to register farmer");
      }

      showToast("Farmer registered successfully!", "success");
      setIsModalOpen(false);
      // Reset form
      setNewFarmer({ name: "", location: "", contact: "", farm_size_acres: "" });
      setFormErrors({});
      // Refresh list
      fetchFarmers(searchQuery);
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  // Handle Delete (DELETE)
  const handleDeleteFarmer = async (id) => {
    if (!window.confirm("Are you sure you want to delete this farmer?")) return;

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/farmers/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete farmer record");
      }

      showToast("Farmer deleted successfully!", "success");
      // Refresh list
      fetchFarmers(searchQuery);
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
      <Navbar />

      <main className="flex-grow max-w-5xl w-full mx-auto p-6 md:p-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-green-700 dark:text-green-500">
              Farmer Directory
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage platform farmers and agricultural regions.
            </p>
          </div>
          <div>
            <Button variant="primary" onClick={() => setIsModalOpen(true)}>
              Register Farmer
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <Input
            placeholder="Search farmers by name..."
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

        {/* Farmer Grid */}
        {!loading && (
          <>
            {farmers.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                <p className="text-lg text-gray-500 dark:text-gray-400">
                  {searchQuery ? "No farmers match your search." : "No registered farmers found."}
                </p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {farmers.map((farmer) => (
                  <div
                    key={farmer.id}
                    className="border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm p-6 bg-white dark:bg-gray-800 hover:shadow-md transition-shadow relative group"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-2">
                          {farmer.name}
                        </h2>
                        <div className="space-y-1.5 text-sm text-gray-600 dark:text-gray-300">
                          <p>
                            <span className="font-medium text-gray-400">ID:</span> #{farmer.id}
                          </p>
                          <p>
                            <span className="font-medium text-gray-400">Location:</span> {farmer.location}
                          </p>
                          <p>
                            <span className="font-medium text-gray-400">Contact:</span> {farmer.contact}
                          </p>
                          <p>
                            <span className="font-medium text-gray-400">Farm Size:</span> {farmer.farm_size_acres} Acres
                          </p>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleDeleteFarmer(farmer.id)}
                        className="text-red-500 hover:text-red-700 dark:hover:text-red-400 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors self-start"
                        title="Delete Farmer"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
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
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register New Farmer">
        <form onSubmit={handleRegisterSubmit} className="space-y-4 mt-2">
          <Input
            label="Name"
            placeholder="e.g. Rajesh Kumar"
            value={newFarmer.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            error={formErrors.name}
          />
          <Input
            label="Location"
            placeholder="e.g. Dehradun"
            value={newFarmer.location}
            onChange={(e) => handleInputChange("location", e.target.value)}
            error={formErrors.location}
          />
          <Input
            label="Contact Number"
            placeholder="e.g. 9876543210"
            value={newFarmer.contact}
            onChange={(e) => handleInputChange("contact", e.target.value)}
            error={formErrors.contact}
          />
          <Input
            label="Farm Size (Acres)"
            type="number"
            placeholder="e.g. 4.5"
            value={newFarmer.farm_size_acres}
            onChange={(e) => handleInputChange("farm_size_acres", e.target.value)}
            error={formErrors.farm_size_acres}
          />
          
          <div className="pt-2">
            <Button variant="primary" type="submit">
              Register
            </Button>
          </div>
        </form>
      </Modal>

      {/* Notification Toast */}
      {toast.show && <Toast message={toast.message} />}
    </div>
  );
}

export default Dashboard;