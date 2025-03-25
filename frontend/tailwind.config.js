/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class", // Enable dark mode with class strategy
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#4a90e2",
          50: "#f0f7ff",
          100: "#e0eefe",
          200: "#bae0fd",
          300: "#7cc5fb",
          400: "#36a9f7",
          500: "#0c8ee7",
          600: "#0072c4",
          700: "#015a9e",
          800: "#064b81",
          900: "#0a406c",
          950: "#072a4a",
        },
      },
    },
  },
  plugins: [],
}

