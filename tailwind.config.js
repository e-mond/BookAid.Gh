/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#007BFF',
        success: '#28A745',
        error: '#DC3545',
        card: '#FFFFFF',
        text: '#333333',
      },
      fontFamily: {
        'roboto': ['Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}