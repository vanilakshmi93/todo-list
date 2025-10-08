import React from 'react';
import { useTheme } from '../contexts/ThemeContext.tsx';
import { LogOut, Moon, Sun } from 'lucide-react';
import { useNavigate } from 'react-router-dom';


const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem("accessToken")
    navigate("/")
  }

  return (
    <div className="fixed top-4 right-4 flex items-center gap-2 z-10">
      <button
        onClick={toggleTheme}
        className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 transition-colors duration-200"
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
      </button>
      <button
        onClick={handleLogout}
        className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white transition-colors duration-200"
        aria-label="Logout"
      >
        <LogOut size={20} />
      </button>
    </div>
  );
};

export default ThemeToggle;