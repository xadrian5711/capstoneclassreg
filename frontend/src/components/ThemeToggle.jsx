import { useTheme } from "./ThemeProvider";
import { FiSun, FiMoon, FiMonitor } from "react-icons/fi";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex gap-2 p-1 border rounded-lg dark:border-gray-700 w-fit bg-gray-50 dark:bg-gray-800">
      <button
        onClick={() => setTheme("light")}
        className={`p-2 rounded-md transition-colors ${
          theme === "light"
            ? "bg-white dark:bg-gray-600 shadow-sm text-yellow-500"
            : "hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500"
        }`}
        title="Light Mode"
      >
        <FiSun className="w-4 h-4" />
      </button>
      <button
        onClick={() => setTheme("dark")}
        className={`p-2 rounded-md transition-colors ${
          theme === "dark"
            ? "bg-white dark:bg-gray-600 shadow-sm text-blue-400"
            : "hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500"
        }`}
        title="Dark Mode"
      >
        <FiMoon className="w-4 h-4" />
      </button>
      <button
        onClick={() => setTheme("system")}
        className={`p-2 rounded-md transition-colors ${
          theme === "system"
            ? "bg-white dark:bg-gray-600 shadow-sm text-gray-900 dark:text-gray-100"
            : "hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500"
        }`}
        title="System Theme"
      >
        <FiMonitor className="w-4 h-4" />
      </button>
    </div>
  );
}
