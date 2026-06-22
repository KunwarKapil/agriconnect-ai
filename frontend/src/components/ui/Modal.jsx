import { useEffect } from "react";

/**
 * Modal Component
 * Props:
 * isOpen
 * onClose
 * title
 * children
 */

function Modal({ isOpen, onClose, title, children }) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white dark:bg-gray-800 dark:text-white p-6 rounded w-96">
        <h2 className="text-xl font-bold mb-4">{title}</h2>

        {children}

        <button
          onClick={onClose}
          className="mt-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default Modal;