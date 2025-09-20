/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#007BFF',
          50: '#E6F3FF',
          100: '#CCE7FF',
          200: '#99CFFF',
          300: '#66B7FF',
          400: '#339FFF',
          500: '#007BFF',
          600: '#0066CC',
          700: '#004C99',
          800: '#003366',
          900: '#001933'
        },
        success: {
          DEFAULT: '#28A745',
          50: '#E8F5E8',
          100: '#D1EBD1',
          200: '#A3D7A3',
          300: '#75C375',
          400: '#47AF47',
          500: '#28A745',
          600: '#20863A',
          700: '#18652E',
          800: '#104422',
          900: '#082316'
        },
        error: {
          DEFAULT: '#DC3545',
          50: '#FDE8E8',
          100: '#FBD1D1',
          200: '#F7A3A3',
          300: '#F37575',
          400: '#EF4747',
          500: '#DC3545',
          600: '#B02A37',
          700: '#842029',
          800: '#58151B',
          900: '#2C0B0D'
        },
        background: '#F9FAFB',
        card: '#FFFFFF'
      },
      fontFamily: {
        'roboto': ['Roboto', 'sans-serif']
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-gentle': 'bounceGentle 0.6s ease-in-out'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        bounceGentle: {
          '0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0)' },
          '40%': { transform: 'translateY(-5px)' },
          '60%': { transform: 'translateY(-3px)' }
        }
      }
    },
  },
  plugins: [],
}