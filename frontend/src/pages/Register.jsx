import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Button, Input, Toast } from "../components/ui";
import { useAuth } from "../context/AuthContext";

function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "Farmer",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "success" });
    }, 3000);
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full Name is required.";
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = "Full Name must be at least 2 characters.";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else {
      const emailRegex = /^[\w\.-]+@[\w\.-]+\.\w+$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = "Invalid email format.";
      }
    }

    if (!formData.password) {
      newErrors.password = "Password is required.";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirm Password is required.";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await register(formData.fullName, formData.email, formData.password, formData.confirmPassword);
      showToast("Registered successfully! Redirecting to login...", "success");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      showToast(err.message || "Registration failed.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
      <Navbar />

      <main className="flex-grow flex items-center justify-center p-6 md:p-8">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-green-700 dark:text-green-500">
              Create Account
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Register for AgriConnect AI platform
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              placeholder="e.g. Rajesh Kumar"
              value={formData.fullName}
              onChange={(e) => handleInputChange("fullName", e.target.value)}
              error={errors.fullName}
            />

            <Input
              label="Email Address"
              placeholder="e.g. rajesh@example.com"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              error={errors.email}
            />

            <div className="flex flex-col gap-2">
              <label className="block text-inherit">Role</label>
              <select
                value={formData.role}
                onChange={(e) => handleInputChange("role", e.target.value)}
                className="border p-2 rounded bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-600"
              >
                <option value="Farmer">Farmer (Default)</option>
                <option value="Admin">Admin</option>
              </select>
            </div>

            <Input
              label="Password"
              placeholder="Enter your password"
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              error={errors.password}
            />

            <Input
              label="Confirm Password"
              placeholder="Confirm your password"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
              error={errors.confirmPassword}
            />

            <div className="pt-2">
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? "Registering..." : "Register"}
              </Button>
            </div>
          </form>

          <div className="text-center mt-6 text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{" "}
            <Link to="/login" className="text-green-700 dark:text-green-500 hover:underline font-semibold">
              Login Here
            </Link>
          </div>
        </div>
      </main>

      <Footer />
      {toast.show && <Toast message={toast.message} />}
    </div>
  );
}

export default Register;
