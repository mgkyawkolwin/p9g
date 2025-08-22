// components/ThemeToggle.js
'use client';

import { useTheme } from 'next-themes';
import { SunIcon, MoonIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="p-2 rounded-full bg-gray-200 dark:bg-gray-700">
        <div className="h-6 w-6"></div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 rounded-full p-1">
      <button
        onClick={() => setTheme('light')}
        className={`p-2 rounded-full transition-colors ${theme === 'light' ? 'bg-white text-yellow-600' : 'text-gray-600 dark:text-gray-300'}`}
        aria-label="Light mode"
      >
        <SunIcon className="h-4 w-4" />
      </button>
      
      <button
        onClick={() => setTheme('dark')}
        className={`p-2 rounded-full transition-colors ${theme === 'dark' ? 'bg-gray-800 text-blue-300' : 'text-gray-600 dark:text-gray-300'}`}
        aria-label="Dark mode"
      >
        <MoonIcon className="h-4 w-4" />
      </button>
      
      <button
        onClick={() => setTheme('system')}
        className={`p-2 rounded-full transition-colors ${theme === 'system' ? 'bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200' : 'text-gray-600 dark:text-gray-300'}`}
        aria-label="System preference"
      >
        <ComputerDesktopIcon className="h-4 w-4" />
      </button>
    </div>
  );
}