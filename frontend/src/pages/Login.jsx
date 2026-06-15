import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function Login() {
  return (
    <>
      <Navbar />

      <div className="max-w-4xl mx-auto p-8 min-h-screen">
        <h1 className="text-4xl font-bold mb-4">
          Login
        </h1>

        <p className="text-lg text-gray-700">
          User authentication and account management
          functionality will be implemented in later modules.
        </p>
      </div>

      <Footer />
    </>
  );
}

export default Login;