/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        main: '#FFD939',
        neutral800: '#0E0E0E',
        neutral100:'#B8B8B8',
        neutral200:'#969696',
        success500:'#4CAF50',
        error500: '#F44336',
        mainBlack: '#1A1A1A',
      },
      fontFamily: {
        sora: ['Sora-Regular'],
        'sora-semibold': ['Sora-SemiBold'],
        'sora-bold': ['Sora-Bold'],
      },
          },
  },
  plugins: [],
}