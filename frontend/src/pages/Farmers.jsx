import { useEffect, useState, useCallback } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Loader, Toast, Button, Input, Modal, ConfirmDialog, EmptyState } from "../components/ui";

function Farmers() {
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Toast state
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  
  // Search query state
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modal & form states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newFarmer, setNewFarmer] = useState({
    name: "",
    location: "",
    contact: "",
    farm_size_acres: "",
  });
  const [formErrors, setFormErrors] = useState({});

  // Edit modal & form states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingFarmer, setEditingFarmer] = useState({
    id: "",
    name: "",
    location: "",
    contact: "",
    farm_size_acres: "",
  });
  const [editFormErrors, setEditFormErrors] = useState({});

  // Delete Confirm Dialog state
  const [deleteDialog, setDeleteDialog] = useState({ isOpen: false, farmerId: null, loading: false });

  // Helper to show auto-hiding toast messages
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3500);
  };

  // Fetch farmers with useCallback
  const fetchFarmers = useCallback(async (query = "") => {
    setLoading(true);
    try {
      const url = query.trim()
        ? `http://127.0.0.1:8000/api/farmers/search?name=${encodeURIComponent(query)}`
        : `http://127.0.0.1:8000/api/farmers/`;

      const token = localStorage.getItem("access_token");
      const response = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch farmers data from server");
      }
      const data = await response.json();
      setFarmers(data);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search effect
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchFarmers(searchQuery);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, fetchFarmers]);

  const handleInputChange = (field, value) => {
    setNewFarmer((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!newFarmer.name.trim()) errors.name = "Name is required.";
    else if (newFarmer.name.trim().length < 2) errors.name = "Name must be at least 2 characters.";

    if (!newFarmer.location.trim()) errors.location = "Location is required.";

    if (!newFarmer.contact.trim()) errors.contact = "Contact number is required.";
    else if (newFarmer.contact.trim().length < 10) errors.contact = "Contact must be at least 10 digits.";

    const size = parseFloat(newFarmer.farm_size_acres);
    if (!newFarmer.farm_size_acres) errors.farm_size_acres = "Farm size is required.";
    else if (isNaN(size) || size <= 0) errors.farm_size_acres = "Farm size must be > 0.";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Register Farmer (POST)
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch("http://127.0.0.1:8000/api/farmers/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
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
      setNewFarmer({ name: "", location: "", contact: "", farm_size_acres: "" });
      setFormErrors({});
      fetchFarmers(searchQuery);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (farmer) => {
    setEditingFarmer({
      id: farmer.id,
      name: farmer.name,
      location: farmer.location,
      contact: farmer.contact,
      farm_size_acres: farmer.farm_size_acres.toString(),
    });
    setEditFormErrors({});
    setIsEditModalOpen(true);
  };

  const handleEditInputChange = (field, value) => {
    setEditingFarmer((prev) => ({ ...prev, [field]: value }));
    if (editFormErrors[field]) {
      setEditFormErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateEditForm = () => {
    const errors = {};
    if (!editingFarmer.name.trim()) errors.name = "Name is required.";
    else if (editingFarmer.name.trim().length < 2) errors.name = "Name must be at least 2 characters.";

    if (!editingFarmer.location.trim()) errors.location = "Location is required.";

    if (!editingFarmer.contact.trim()) errors.contact = "Contact number is required.";
    else if (editingFarmer.contact.trim().length < 10) errors.contact = "Contact must be at least 10 digits.";

    const size = parseFloat(editingFarmer.farm_size_acres);
    if (!editingFarmer.farm_size_acres) errors.farm_size_acres = "Farm size is required.";
    else if (isNaN(size) || size <= 0) errors.farm_size_acres = "Farm size must be > 0.";

    setEditFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Edit Farmer (PUT)
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!validateEditForm()) return;

    setSubmitting(true);
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`http://127.0.0.1:8000/api/farmers/${editingFarmer.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editingFarmer.name,
          location: editingFarmer.location,
          contact: editingFarmer.contact,
          farm_size_acres: parseFloat(editingFarmer.farm_size_acres),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to update farmer");
      }

      showToast("Farmer details updated successfully!", "success");
      setIsEditModalOpen(false);
      fetchFarmers(searchQuery);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const promptDeleteFarmer = (id) => {
    setDeleteDialog({ isOpen: true, farmerId: id, loading: false });
  };

  // Confirm Delete Farmer (DELETE)
  const handleConfirmDelete = async () => {
    if (!deleteDialog.farmerId) return;

    setDeleteDialog((prev) => ({ ...prev, loading: true }));
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`http://127.0.0.1:8000/api/farmers/${deleteDialog.farmerId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete farmer record");
      }

      showToast("Farmer record deleted successfully!", "success");
      setDeleteDialog({ isOpen: false, farmerId: null, loading: false });
      fetchFarmers(searchQuery);
    } catch (err) {
      showToast(err.message, "error");
      setDeleteDialog((prev) => ({ ...prev, loading: false }));
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
      <Navbar />

      <main className="flex-grow max-w-6xl w-full mx-auto p-4 sm:p-6 md:p-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-green-700 dark:text-green-500">
              Farmer Directory
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm sm:text-base">
              Manage platform farmers, region contacts, and cultivation acreages.
            </p>
          </div>
          <div>
            <Button variant="primary" onClick={() => setIsModalOpen(true)}>
              + Register Farmer
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

        {/* Loading state */}
        {loading ? (
          <div className="my-16">
            <Loader />
          </div>
        ) : farmers.length === 0 ? (
          <EmptyState
            icon="🧑‍🌾"
            title="No Farmers Registered"
            description={
              searchQuery
                ? `No registered farmers match "${searchQuery}".`
                : "No farmers registered in the system yet. Click below to add a new farmer."
            }
            actionText="+ Register Farmer"
            onAction={() => setIsModalOpen(true)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {farmers.map((farmer) => (
              <div
                key={farmer.id}
                className="border border-gray-200 dark:border-gray-800 rounded-2xl shadow-xs p-6 bg-white dark:bg-gray-800 hover:shadow-md transition relative group"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                      {farmer.name}
                    </h2>
                    <div className="space-y-1.5 text-sm text-gray-600 dark:text-gray-300">
                      <p>
                        <span className="font-semibold text-gray-400">ID:</span> #{farmer.id}
                      </p>
                      <p>
                        <span className="font-semibold text-gray-400">Location:</span> {farmer.location}
                      </p>
                      <p>
                        <span className="font-semibold text-gray-400">Contact:</span> {farmer.contact}
                      </p>
                      <p>
                        <span className="font-semibold text-gray-400">Farm Size:</span> {farmer.farm_size_acres} Acres
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEditClick(farmer)}
                      className="text-blue-500 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/30 transition cursor-pointer"
                      title="Edit Farmer"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => promptDeleteFarmer(farmer.id)}
                      className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition cursor-pointer"
                      title="Delete Farmer"
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
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register New Farmer">
        <form onSubmit={handleRegisterSubmit} className="space-y-4 mt-2">
          <Input
            label="Name *"
            placeholder="e.g. Rajesh Kumar"
            value={newFarmer.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            error={formErrors.name}
          />
          <Input
            label="Location *"
            placeholder="e.g. Dehradun"
            value={newFarmer.location}
            onChange={(e) => handleInputChange("location", e.target.value)}
            error={formErrors.location}
          />
          <Input
            label="Contact Number *"
            placeholder="e.g. 9876543210"
            value={newFarmer.contact}
            onChange={(e) => handleInputChange("contact", e.target.value)}
            error={formErrors.contact}
          />
          <Input
            label="Farm Size (Acres) *"
            type="number"
            placeholder="e.g. 4.5"
            value={newFarmer.farm_size_acres}
            onChange={(e) => handleInputChange("farm_size_acres", e.target.value)}
            error={formErrors.farm_size_acres}
          />

          <div className="pt-2">
            <Button variant="primary" type="submit" loading={submitting} className="w-full justify-center">
              Register Farmer
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Farmer Modal Form */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Farmer Details">
        <form onSubmit={handleEditSubmit} className="space-y-4 mt-2">
          <Input
            label="Name *"
            placeholder="e.g. Rajesh Kumar"
            value={editingFarmer.name}
            onChange={(e) => handleEditInputChange("name", e.target.value)}
            error={editFormErrors.name}
          />
          <Input
            label="Location *"
            placeholder="e.g. Dehradun"
            value={editingFarmer.location}
            onChange={(e) => handleEditInputChange("location", e.target.value)}
            error={editFormErrors.location}
          />
          <Input
            label="Contact Number *"
            placeholder="e.g. 9876543210"
            value={editingFarmer.contact}
            onChange={(e) => handleEditInputChange("contact", e.target.value)}
            error={editFormErrors.contact}
          />
          <Input
            label="Farm Size (Acres) *"
            type="number"
            placeholder="e.g. 4.5"
            value={editingFarmer.farm_size_acres}
            onChange={(e) => handleEditInputChange("farm_size_acres", e.target.value)}
            error={editFormErrors.farm_size_acres}
          />

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
        onClose={() => setDeleteDialog({ isOpen: false, farmerId: null, loading: false })}
        onConfirm={handleConfirmDelete}
        title="Delete Farmer?"
        message="Are you sure you want to delete this farmer record? All associated data will be removed."
        loading={deleteDialog.loading}
      />

      {/* Notification Toast */}
      {toast.show && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}

export default Farmers;
