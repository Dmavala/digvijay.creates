/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#121316",
        foreground: "#f4f4f5",
        "win-gray": "#c0c0c0",
        "win-blue": "#000080",
        "post-it-yellow": "#fef08a",
        "post-it-blue": "#bae6fd",
        "tape": "rgba(255, 255, 255, 0.45)",
      },
      fontFamily: {
        anton: ['Anton', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
        handwriting: ['Caveat', 'cursive'],
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
        pixel: ['Silkscreen', 'monospace'],
        grotesk: ['"Space Grotesk"', 'sans-serif'],
      },
      boxShadow: {
        'pin': '2px 8px 12px rgba(0, 0, 0, 0.45)',
        'post-it': '0 10px 25px -5px rgba(0, 0, 0, 0.35), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
      },
    },
  },
  plugins: [],
}
