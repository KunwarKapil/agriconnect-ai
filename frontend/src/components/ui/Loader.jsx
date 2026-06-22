/**
 * Loader Component
 */

function Loader() {
  return (
    <div className="flex justify-center items-center">
      <div className="w-10 h-10 border-4 border-gray-300 dark:border-gray-600 border-t-green-600 dark:border-t-green-500 rounded-full animate-spin"></div>
    </div>
  );
}

export default Loader;