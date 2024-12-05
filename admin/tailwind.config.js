/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#5F6FFF",
          dark: "#4A5AE0",  // Màu tối hơn cho hover
          light: "#7A8AFF", // Màu sáng hơn nếu cần
        },
        // Thêm các màu khác nếu cần
        gray: {
          100: "#F3F4F6",
          // Thêm các sắc độ xám khác nếu cần
        },
      },
    },
  },
  plugins: [],
};
