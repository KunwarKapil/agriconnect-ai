/**
 * Toast Component
 * Props:
 * message: string
 * type: "success" | "error" | "info"
 */

function Toast({ message, type = "success" }) {
  const styles = {
    success: "bg-green-600 dark:bg-green-700 text-white border-green-700",
    error: "bg-red-600 dark:bg-red-700 text-white border-red-700",
    info: "bg-blue-600 dark:bg-blue-700 text-white border-blue-700",
  };

  const icons = {
    success: "✓",
    error: "✕",
    info: "ℹ",
  };

  return (
    <div className={`fixed top-5 right-5 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl z-50 text-sm font-medium border animate-in slide-in-from-top-2 duration-200 ${styles[type] || styles.success}`}>
      <span className="font-bold text-base leading-none">{icons[type] || "✓"}</span>
      <span>{message}</span>
    </div>
  );
}

export default Toast;