

import heroUINativePlugin from 'heroui-native/tailwind-plugin';


/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,tsx}', './components/**/*.{js,ts,tsx}', './node_modules/heroui-native/lib/**/*.{js,ts,jsx,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {},
  },
  plugins: [heroUINativePlugin],
};
