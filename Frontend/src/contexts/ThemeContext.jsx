import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();  //create an empty context container

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;  //if the user has not selected any theme yet, then the user's sytem's theme will be implemented
  });

  //perform the side effect after the theme changes
  useEffect(() => {
    const root = document.documentElement;  //<html>
    if (isDark) {
      root.classList.add('dark');     //<html class="dark">
      localStorage.setItem('theme', 'dark');
    } else {                             //<html>
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);  //this hook runs when the app mounts and when the isDark changes or theme changes

  const toggleTheme = () => setIsDark((prev) => !prev);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
