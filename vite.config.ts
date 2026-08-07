/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: { port: 3000 },
  build: { outDir: "build" },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/setupTests.ts",
    exclude: ["node_modules", "dist", ".agents", ".idea", ".git", ".cache"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      exclude: [
        "**/*Img.tsx", 
        "**/*Chart.tsx", 
        "**/FeelingProud.tsx", 
        "src/types/*", 
        "src/portfolio.ts",
        "src/global.ts",
        "src/assests/**/*"
      ],
      thresholds: {
        lines: 80,
        branches: 80,
      },
    },
  },
});
