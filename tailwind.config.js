/** @type {import("tailwindcss").Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/modules/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#f0f4ff",
          100: "#e0eaff",
          200: "#c7d9fe",
          300: "#a5bffc",
          400: "#7b9bf8",
          500: "#5570f1",
          600: "#3d52e6",
          700: "#3040cc",
          800: "#2835a5",
          900: "#253183",
          950: "#171e52",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      spacing: {
        "13": "3.25rem",
      },
    },
  },
  plugins: [],
};
