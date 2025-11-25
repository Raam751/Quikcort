import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const ThemeToggle: React.FC = () => {
    const { theme, toggleTheme } = useAuth();

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-secondary-500 hover:text-neutral-900 dark:text-secondary-400 dark:hover:text-white hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
            {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
            ) : (
                <Moon className="h-5 w-5" />
            )}
        </button>
    );
};
