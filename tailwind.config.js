/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#007BFF',
        'primary-hover': '#0056b3',
        success: '#28A745',
        'success-hover': '#1e7e34',
        error: '#DC3545',
        'error-hover': '#c82333',
      },
      fontFamily: {
        sans: ['Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
}