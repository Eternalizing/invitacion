/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#fbf8eb',
          100: '#f7f0ce',
          200: '#efdf9a',
          300: '#e5ca61',
          400: '#dcb132',
          500: '#c59522',
          600: '#a37119',
          700: '#825217',
          800: '#6c411a',
          900: '#5c3619',
        },
      },
      fontFamily: {
        nemer: ['"Nemer Titulares"', '"Cinzel"', 'serif'],
        montserrat: ['"Montserrat"', 'sans-serif'],
        serif: ['"Playfair Display"', '"Cinzel"', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
