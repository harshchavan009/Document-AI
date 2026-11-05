import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("dm_theme");
    if (saved === "light" || saved === "dark" || saved === "system") {
      return saved;
    }
    // Default to light as specified in the master design brief
    return "light";
  });

  const [resolvedTheme, setResolvedTheme] = useState(() => {
    if (theme === "system") {
      return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    return theme;
  });

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const updateResolved = () => {
      let active = theme;
      if (theme === "system") {
        active = media.matches ? "dark" : "light";
      }
      setResolvedTheme(active);

      const root = document.documentElement;
      root.setAttribute("data-theme", active);
      if (active === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
      localStorage.setItem("dm_theme", theme);
    };

    updateResolved();

    const listener = () => {
      if (theme === "system") {
        updateResolved();
      }
    };

    if (media.addEventListener) {
      media.addEventListener("change", listener);
      return () => media.removeEventListener("change", listener);
    } else {
      media.addListener(listener);
      return () => media.removeListener(listener);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (resolvedTheme === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
