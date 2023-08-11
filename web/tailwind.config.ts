import type { Config } from "tailwindcss"
import defaultTheme from "tailwindcss/defaultTheme"

export default {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Manrope", ...defaultTheme.fontFamily.sans],
      },
      colors: {
        blue: {
          "50": "#e9f5ff",
          "100": "#d8ebff",
          "200": "#b8d9ff",
          "300": "#8ebeff",
          "400": "#6195ff",
          "500": "#3d6dff",
          "600": "#1b3fff",
          "700": "#0e2ff0",
          "800": "#112dc2",
          "900": "#183097",
          "950": "#0e1958",
        },
      },
    },
  },
  plugins: [require("@headlessui/tailwindcss")],
} satisfies Config
