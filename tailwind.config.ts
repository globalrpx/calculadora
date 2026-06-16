import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        rpx: {
          blue: "#123f8c",
          navy: "#0b244f",
          red: "#d7282f",
          sky: "#eaf1ff",
          ink: "#172033",
          mist: "#f5f7fb"
        }
      },
      boxShadow: {
        soft: "0 18px 50px rgba(23, 32, 51, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
