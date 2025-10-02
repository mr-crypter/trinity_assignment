/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      container: {
        center: true,
        padding: '1rem'
      },
      colors: {
        brand: {
          DEFAULT: '#5b7fff',
          dark: '#3e5ce6'
        }
      },
      boxShadow: {
        card: '0 4px 14px rgba(0,0,0,0.08)'
      }
    }
  },
  plugins: []
}

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  theme: { extend: {} },
  plugins: []
};