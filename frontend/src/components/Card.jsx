function Card({ title, description, onClick, accent = "green" }) {
  const accentStyles = {
    green: "border-l-4 border-l-green-600 hover:border-green-600 dark:border-l-green-500",
    orange: "border-l-4 border-l-amber-500 hover:border-amber-500 dark:border-l-amber-400",
    blue: "border-l-4 border-l-blue-600 hover:border-blue-600 dark:border-l-blue-400",
    purple: "border-l-4 border-l-purple-600 hover:border-purple-600 dark:border-l-purple-400",
  };

  const selectedAccent = accentStyles[accent] || accentStyles.green;

  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-md hover:shadow-xl rounded-xl p-6 transition-all duration-300 transform hover:scale-[1.015] ${selectedAccent} ${
        onClick ? "cursor-pointer" : ""
      }`}
    >
      <h2 className="text-xl font-bold mb-2">
        {title}
      </h2>

      <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
        {description}
      </p>
    </div>
  );
}

export default Card;