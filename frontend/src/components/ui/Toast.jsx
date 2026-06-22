/**
 * Toast Component
 * Props:
 * message
 */

function Toast({ message }) {
  return (
    <div className="fixed top-4 right-4 bg-green-600 dark:bg-green-700 text-white px-4 py-2 rounded shadow-lg z-50">
      {message}
    </div>
  );
}

export default Toast;