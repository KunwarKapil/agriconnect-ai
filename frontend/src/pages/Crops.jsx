import { useEffect, useState, useCallback } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Loader, Toast, Button, Input, Modal, ConfirmDialog, EmptyState } from "../components/ui";
import { API_BASE_URL } from "../config";

function Crops() {
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Toast state
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  
  // Search query state
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modal & form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newCrop, setNewCrop] = useState({
    crop_name: "",
    crop_type: "",
    season: "Rabi",
    planting_date: "",
    expected_harvest_date: "",
    area_in_acres: "",
    status: "Planted",
  });
  const [formErrors, setFormErrors] = useState({});

  // Edit modal & form states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCrop, setEditingCrop] = useState({
    id: "",
    crop_name: "",
    crop_type: "",
    season: "",
    planting_date: "",
    expected_harvest_date: "",
    area_in_acres: "",
    status: "",
  });
  const [editFormErrors, setEditFormErrors] = useState({});

  // Delete Confirm Dialog state
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, cropId: null, loading: false });

  // Helper to show auto-hiding toast messages
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3500);
  };

  // Fetch crops with useCallback
  const fetchCrops = useCallback(async (query = "") => {
    setLoading(true);
    try {
      const url = query.trim()
        ? `${API_BASE_URL}/api/crops/search?name=${encodeURIComponent(query)}`
        : `${API_BASE_URL}/api/crops/`;

      const token = localStorage.getItem("access_token");
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch crops data from server");
      }
      const data = await response.json();
      setCrops(data);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search effect
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchCrops(searchQuery);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, fetchCrops]);

  const handleInputChange = (field, value) => {
    setNewCrop((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = (cropData, setErrors) => {
    const errors = {};
    if (!cropData.crop_name.trim()) errors.crop_name = "Crop name is required.";
    else if (cropData.crop_name.trim().length < 2) errors.crop_name = "Crop name must be at least 2 characters.";

    if (!cropData.crop_type.trim()) errors.crop_type = "Crop type is required.";

    if (!cropData.season.trim()) errors.season = "Season is required.";

    if (!cropData.planting_date) errors.planting_date = "Planting date is required.";

    if (!cropData.expected_harvest_date) errors.expected_harvest_date = "Expected harvest date is required.";

    const area = parseFloat(cropData.area_in_acres);
    if (!cropData.area_in_acres) errors.area_in_acres = "Area is required.";
    else if (isNaN(area) || area <= 0) errors.area_in_acres = "Area must be > 0.";

    if (!cropData.status) errors.status = "Status is required.";

    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Register Crop (POST)
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm(newCrop, setFormErrors)) return;

    setSubmitting(true);
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_BASE_URL}/api/crops/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...newCrop,
          area_in_acres: parseFloat(newCrop.area_in_acres),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to register crop");
      }

      showToast("Crop registered successfully!", "success");
      setIsModalOpen(false);
      setNewCrop({
        crop_name: "",
        crop_type: "",
        season: "Rabi",
        planting_date: "",
        expected_harvest_date: "",
        area_in_acres: "",
        status: "Planted",
      });
      setFormErrors({});
      fetchCrops(searchQuery);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (crop) => {
    setEditingCrop({
      id: crop.id,
      crop_name: crop.crop_name,
      crop_type: crop.crop_type,
      season: crop.season,
      planting_date: crop.planting_date,
      expected_harvest_date: crop.expected_harvest_date,
      area_in_acres: crop.area_in_acres.toString(),
      status: crop.status,
    });
    setEditFormErrors({});
    setIsEditModalOpen(true);
  };

  const handleEditInputChange = (field, value) => {
    setEditingCrop((prev) => ({ ...prev, [field]: value }));
    if (editFormErrors[field]) {
      setEditFormErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Edit Crop (PUT)
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm(editingCrop, setEditFormErrors)) return;

    setSubmitting(true);
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_BASE_URL}/api/crops/${editingCrop.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          crop_name: editingCrop.crop_name,
          crop_type: editingCrop.crop_type,
          season: editingCrop.season,
          planting_date: editingCrop.planting_date,
          expected_harvest_date: editingCrop.expected_harvest_date,
          area_in_acres: parseFloat(editingCrop.area_in_acres),
          status: editingCrop.status,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to update crop");
      }

      showToast("Crop details updated successfully!", "success");
      setIsEditModalOpen(false);
      fetchCrops(searchQuery);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const promptDeleteCrop = (id) => {
    setDeleteDialog({ isOpen: true, cropId: id, loading: false });
  };

  // Confirm Delete Crop (DELETE)
  const handleConfirmDelete = async () => {
    if (!deleteDialog.cropId) return;

    setDeleteDialog((prev) => ({ ...prev, loading: true }));
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_BASE_URL}/api/crops/${deleteDialog.cropId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete crop record");
      }

      showToast("Crop record deleted successfully!", "success");
      setDeleteDialog({ isOpen: false, cropId: null, loading: false });
      fetchCrops(searchQuery);
    } catch (err) {
      showToast(err.message, "error");
      setDeleteDialog((prev) => ({ ...prev, loading: false }));
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      Planted: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800/30",
      Growing: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800/30",
      "Ready for Harvest": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800/30",
      Harvested: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800/30",
    };
    return styles[status] || "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
      <Navbar />

      <main className="flex-grow max-w-6xl w-full mx-auto p-4 sm:p-6 md:p-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-green-700 dark:text-green-500">
              Crop Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm sm:text-base">
              Track planting schedules, variety classifications, and cultivation lifecycles.
            </p>
          </div>
          <div>
            <Button variant="primary" onClick={() => setIsModalOpen(true)}>
              + Register Crop
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <Input
            placeholder="Search crops by crop name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Dynamic Loading indicator */}
        {loading ? (
          <div className="my-16">
            <Loader />
          </div>
        ) : crops.length === 0 ? (
          <EmptyState
            icon="🌱"
            title="No Crops Available"
            description={
              searchQuery
                ? `No crops match "${searchQuery}".`
                : "No crops monitored in system database yet. Click below to add a crop."
            }
            actionText="+ Register Crop"
            onAction={() => setIsModalOpen(true)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {crops.map((crop) => (
              <div
                key={crop.id}
                className="border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xs p-6 bg-white dark:bg-gray-800 hover:shadow-md transition relative group"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2.5 mb-3 flex-wrap">
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                        {crop.crop_name}
                      </h2>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold ${getStatusBadge(crop.status)}`}>
                        {crop.status}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-sm text-gray-600 dark:text-gray-300">
                      <p>
                        <span className="font-semibold text-gray-400">ID:</span> #{crop.id}
                      </p>
                      <p>
                        <span className="font-semibold text-gray-400">Type:</span> {crop.crop_type}
                      </p>
                      <p>
                        <span className="font-semibold text-gray-400">Season:</span> {crop.season}
                      </p>
                      <p>
                        <span className="font-semibold text-gray-400">Planting Date:</span> {crop.planting_date}
                      </p>
                      <p>
                        <span className="font-semibold text-gray-400">Expected Harvest:</span> {crop.expected_harvest_date}
                      </p>
                      <p>
                        <span className="font-semibold text-gray-400">Area:</span> {crop.area_in_acres} Acres
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEditClick(crop)}
                      className="text-blue-500 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/30 transition cursor-pointer"
                      title="Edit Crop"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => promptDeleteCrop(crop.id)}
                      className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition cursor-pointer"
                      title="Delete Crop"
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
      </main>

      <Footer />

      {/* Registration Modal Form */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register New Crop">
        <form onSubmit={handleRegisterSubmit} className="space-y-4 mt-2">
          <Input
            label="Crop Name *"
            placeholder="e.g. Wheat"
            value={newCrop.crop_name}
            onChange={(e) => handleInputChange("crop_name", e.target.value)}
            error={formErrors.crop_name}
          />
          <Input
            label="Crop Type *"
            placeholder="e.g. Cereal"
            value={newCrop.crop_type}
            onChange={(e) => handleInputChange("crop_type", e.target.value)}
            error={formErrors.crop_type}
          />

          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium text-inherit">Season *</label>
            <select
              value={newCrop.season}
              onChange={(e) => handleInputChange("season", e.target.value)}
              className="border p-2 rounded bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-600"
            >
              <option value="Rabi">Rabi (Winter)</option>
              <option value="Kharif">Kharif (Monsoon)</option>
              <option value="Zaid">Zaid (Summer)</option>
            </select>
            {formErrors.season && <p className="text-red-500 text-xs">{formErrors.season}</p>}
          </div>

          <Input
            label="Planting Date *"
            type="date"
            value={newCrop.planting_date}
            onChange={(e) => handleInputChange("planting_date", e.target.value)}
            error={formErrors.planting_date}
          />
          <Input
            label="Expected Harvest Date *"
            type="date"
            value={newCrop.expected_harvest_date}
            onChange={(e) => handleInputChange("expected_harvest_date", e.target.value)}
            error={formErrors.expected_harvest_date}
          />
          <Input
            label="Area (Acres) *"
            type="number"
            placeholder="e.g. 5.5"
            value={newCrop.area_in_acres}
            onChange={(e) => handleInputChange("area_in_acres", e.target.value)}
            error={formErrors.area_in_acres}
          />

          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium text-inherit">Status *</label>
            <select
              value={newCrop.status}
              onChange={(e) => handleInputChange("status", e.target.value)}
              className="border p-2 rounded bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-600"
            >
              <option value="Planted">Planted</option>
              <option value="Growing">Growing</option>
              <option value="Ready for Harvest">Ready for Harvest</option>
              <option value="Harvested">Harvested</option>
            </select>
            {formErrors.status && <p className="text-red-500 text-xs">{formErrors.status}</p>}
          </div>

          <div className="pt-2">
            <Button variant="primary" type="submit" loading={submitting} className="w-full justify-center">
              Register Crop
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal Form */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Crop Details">
        <form onSubmit={handleEditSubmit} className="space-y-4 mt-2">
          <Input
            label="Crop Name *"
            placeholder="e.g. Wheat"
            value={editingCrop.crop_name}
            onChange={(e) => handleEditInputChange("crop_name", e.target.value)}
            error={editFormErrors.crop_name}
          />
          <Input
            label="Crop Type *"
            placeholder="e.g. Cereal"
            value={editingCrop.crop_type}
            onChange={(e) => handleEditInputChange("crop_type", e.target.value)}
            error={editFormErrors.crop_type}
          />

          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium text-inherit">Season *</label>
            <select
              value={editingCrop.season}
              onChange={(e) => handleEditInputChange("season", e.target.value)}
              className="border p-2 rounded bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-600"
            >
              <option value="Rabi">Rabi (Winter)</option>
              <option value="Kharif">Kharif (Monsoon)</option>
              <option value="Zaid">Zaid (Summer)</option>
            </select>
            {editFormErrors.season && <p className="text-red-500 text-xs">{editFormErrors.season}</p>}
          </div>

          <Input
            label="Planting Date *"
            type="date"
            value={editingCrop.planting_date}
            onChange={(e) => handleEditInputChange("planting_date", e.target.value)}
            error={editFormErrors.planting_date}
          />
          <Input
            label="Expected Harvest Date *"
            type="date"
            value={editingCrop.expected_harvest_date}
            onChange={(e) => handleEditInputChange("expected_harvest_date", e.target.value)}
            error={editFormErrors.expected_harvest_date}
          />
          <Input
            label="Area (Acres) *"
            type="number"
            placeholder="e.g. 5.5"
            value={editingCrop.area_in_acres}
            onChange={(e) => handleEditInputChange("area_in_acres", e.target.value)}
            error={editFormErrors.area_in_acres}
          />

          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium text-inherit">Status *</label>
            <select
              value={editingCrop.status}
              onChange={(e) => handleEditInputChange("status", e.target.value)}
              className="border p-2 rounded bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-600"
            >
              <option value="Planted">Planted</option>
              <option value="Growing">Growing</option>
              <option value="Ready for Harvest">Ready for Harvest</option>
              <option value="Harvested">Harvested</option>
            </select>
            {editFormErrors.status && <p className="text-red-500 text-xs">{editFormErrors.status}</p>}
          </div>

          <div className="pt-2">
            <Button variant="primary" type="submit" loading={submitting} className="w-full justify-center">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={() => setDeleteDialog({ isOpen: false, cropId: null, loading: false })}
        onConfirm={handleConfirmDelete}
        title="Delete Crop?"
        message="Are you sure you want to delete this crop record? All associated cultivation details will be removed."
        loading={deleteDialog.loading}
      />

      {/* Notification Toast */}
      {toast.show && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}

export default Crops;
