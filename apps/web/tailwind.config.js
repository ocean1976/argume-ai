/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#6366F1",
        secondary: "#8B5CF6",
        background: "#0F172A",
        slate: {
          50: "#F8FAFC",
          900: "#0F172A",
        },
        accent: "#22D3EE",
      },
    },
  },
  plugins: [],
}
