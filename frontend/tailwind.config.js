/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        void: 'var(--void)',
        surface: 'var(--surface)',
        plum: 'var(--plum)',
        brand: 'var(--brand)',
        violet: {
          DEFAULT: 'var(--violet)',
          glow: 'var(--violet-glow)',
          pressed: 'var(--violet-pressed)',
        },
        lilac: 'var(--lilac)',
        text: {
          DEFAULT: 'var(--text)',
          muted: 'var(--text-muted)',
        },
        border: {
          DEFAULT: 'var(--border)',
          bright: 'var(--border-bright)',
        },
        success: 'var(--success)',
        warning: 'var(--warning)',
        danger: 'var(--danger)',
      },
      fontFamily: {
        sans: ['Figtree', 'sans-serif'],
        heading: ['"Bricolage Grotesque"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        panel: '12px',
        control: '8px',
      },
      maxWidth: {
        container: '1320px',
      },
      screens: {
        'xs': '360px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1440px',
      },
    },
  },
  plugins: [],
}
