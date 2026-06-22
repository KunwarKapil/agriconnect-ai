import { useTheme } from "../../context/ThemeContext";

function ThemeToggle() {
  const { darkMode, setDarkMode } = useTheme();

  return (
    <button
      onClick={() => setDarkMode(!darkMode)}
      className="px-4 py-2 rounded bg-blue-600 text-white"
    >
      {darkMode ? "Light Mode" : "Dark Mode"}
    </button>
  );
}

export default ThemeToggle;
