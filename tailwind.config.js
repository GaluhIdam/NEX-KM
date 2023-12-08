/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/**/*.{html,ts}",
    "./node_modules/tw-elements/dist/js/**/*.js",
    "./node_modules/shepherd.js/dist/css/shepherd.css",
  ],
  theme: {
    extend: {
      screens: {
        hp: "320px",
      },
      colors: {
        "regal-blue": "#00A4E5",
        "grey-soft": "#A8A8A8",
        "purple-dark": "#27104E",
        "new-primary": "#0C82B9",
        "dark-soft": "#222222",
        "soft-green": "#7DBE31",
        orange: "#F57F17",
        "redeem-bar": "#005685",
        "button-success": "#70A001",
        "button-red": "#d32f2f",
        "green-button": "#70A001",
        waiting: "#FBCB54",
        jumbroton: "#FAFAFA",
      },
      backgroundImage: {
        library: "url('src/assets/image/library/background/bg-library.jpg')",
        talk_stream:
          "url('src/assets/image/talk/background/basketball-headline.jpg')",
      },
      animation: {
        marquee: "marquee 5s linear infinite",
        re_marquee: "re_marquee 5s linear infinite",
        marquee2: "marquee 15s linear infinite",
        re_marquee2: "re_marquee 15s linear infinite",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-100%)" },
        },
        re_marquee: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0%)" },
        },
      },
      // fontFamily: {
      //   jakarta: ["Plus Jakarta Sans", "sans-serif"],
      // },
    },
  },
  plugins: [
    require("tw-elements/dist/plugin.cjs"),
  ],
};
