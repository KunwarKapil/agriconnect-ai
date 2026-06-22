/**
 * Input Component
 * Props:
 * label
 * placeholder
 * type
 * value
 * onChange
 * error
 */

function Input({
  label,
  placeholder,
  type = "text",
  value,
  onChange,
  error,
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="block mb-2 text-inherit">
  {label}
</label>

      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="border p-2 rounded bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-600"
      />

      {error && (
        <p className="text-red-500 dark:text-red-400 text-sm">
          {error}
        </p>
      )}
    </div>
  );
}

export default Input;