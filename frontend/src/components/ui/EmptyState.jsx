import Button from "./Button";

/**
 * EmptyState Component
 * Displays friendly illustrations and icons when list/data is empty.
 */
function EmptyState({
  icon = "🌾",
  title = "No Data Available",
  description = "There are currently no records to display. Click below to add a new record.",
  actionText,
  onAction,
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 py-14 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl bg-white/50 dark:bg-gray-800/30">
      <div className="w-16 h-16 bg-green-50 dark:bg-green-950/40 rounded-full flex items-center justify-center text-3xl mb-4 border border-green-100 dark:border-green-900/40 shadow-xs animate-bounce-subtle">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
        {title}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mb-6 leading-relaxed">
        {description}
      </p>
      {actionText && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
}

export default EmptyState;
