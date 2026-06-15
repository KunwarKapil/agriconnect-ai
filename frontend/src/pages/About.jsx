import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function About() {
  return (
    <>
      <Navbar />

      <div className="max-w-4xl mx-auto p-8 min-h-screen">
        <h1 className="text-4xl font-bold mb-4">
          About AgriConnect AI
        </h1>

        <p className="text-lg text-gray-700">
          AgriConnect AI is a Smart Agriculture Management Platform
          designed to help farmer groups and agricultural
          cooperatives manage crop planning, weather monitoring,
          disease detection, and AI-powered advisory services.
        </p>
      </div>

      <Footer />
    </>
  );
}

export default About;