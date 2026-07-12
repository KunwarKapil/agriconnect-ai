import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import About from "./pages/About";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ComponentsDemo from "./pages/ComponentsDemo";
import Farmers from "./pages/Farmers";
import Crops from "./pages/Crops";
import Weather from "./pages/Weather";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/components-demo" element={<ComponentsDemo />} />

          {/* Protected Application Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/farmers" 
            element={
              <ProtectedRoute>
                <Farmers />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/crops" 
            element={
              <ProtectedRoute>
                <Crops />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/weather" 
            element={
              <ProtectedRoute>
                <Weather />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;