/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./*.html', './app.js', './room.js', './animations.js'],
  theme: {
    extend: {
      screens: {
        xs: '400px'
      },
      colors: {
        brand: '#FF014C',
        'brand-dark': '#b30035',
        ink: '#030303'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Manrope', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
};
