/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{js,jsx,ts,tsx}"],
    theme: {
      extend: {
        colors: {
          blue: {
            50: "#eff6ff",
            100: "#dbeafe",
            200: "#bfdbfe",
            300: "#93c5fd",
            400: "#60a5fa",
            500: "#3b82f6",
            600: "#2563eb",
            700: "#1d4ed8",
            800: "#1e40af",
            900: "#1e3a8a",
          },
          indigo: {
            50: "#eef2ff",
            100: "#e0e7ff",
            200: "#c7d2fe",
            300: "#a5b4fc",
            400: "#818cf8",
            500: "#6366f1",
            600: "#4f46e5",
            700: "#4338ca",
            800: "#3730a3",
            900: "#312e81",
          },
        },
        fontFamily: {
          sans: [
            "Inter",
            "ui-sans-serif",
            "system-ui",
            "-apple-system",
            "BlinkMacSystemFont",
            "Segoe UI",
            "Roboto",
            "Helvetica Neue",
            "Arial",
            "sans-serif",
          ],
        },
        boxShadow: {
          sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
          DEFAULT: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
          md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
          xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
          none: "none",
        },
      },
    },
    plugins: [],
  }
  
  