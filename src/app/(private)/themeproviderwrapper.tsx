// components/ThemeProviderWrapper.jsx
'use client';

import { ThemeProvider, useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export default function ThemeProviderWrapper({ children }) {

  const { theme } = useTheme();
  // 1. State to track when the component has mounted on the client
  const [mounted, setMounted] = useState(false);

  // 2. useEffect only runs on the client, so we know we've hydrated when it runs
  useEffect(() => {
    setMounted(true);
  }, []);

  // 3. Prevent the SSR mismatch by not rendering the theme provider until mounted
  if (!mounted) {
    // Optionally, you can return a placeholder that matches your default theme's styles
    // This is better than returning `null` to avoid a layout shift.
    return <div className="min-h-screen">{children}</div>;
  }
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem={true}
      disableTransitionOnChange={false}
    >
      {children}
    </ThemeProvider>
  );
}