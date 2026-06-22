/**
 * Button Component
 * Props:
 * variant: primary | secondary | outline
 * size: sm | md | lg
 * disabled: boolean
 * onClick: function
 */

function Button({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  onClick,
}) {
  const variants = {
    primary: "bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white",
    secondary: "bg-gray-600 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-800 text-white",
    outline: "border border-green-600 dark:border-green-500 text-green-600 dark:text-green-400 hover:bg-gray-100 dark:hover:bg-gray-800",
  };

  const sizes = {
    sm: "px-3 py-1 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded transition ${variants[variant]} ${sizes[size]} disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  );
}

export default Button;