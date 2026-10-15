/** @type {import('tailwindcss').Config} */
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: { extend: { colors: { bg: "#070a10", panel: "#0d1424", line: "#1e2b4a", accent: "#4c8dff", gold: "#d4a74a" } } },
  plugins: [],
};
