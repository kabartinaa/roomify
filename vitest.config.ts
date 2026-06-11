import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.test.{ts,tsx}"],
  },
  resolve: {
    alias: [
      { find: "~", replacement: "/app" },
      // home.tsx uses a lowercase import path; alias it to the real file on
      // case-sensitive Linux filesystems so tests can resolve it correctly.
      {
        find: /.*\/components\/upload$/i,
        replacement: "/home/jailuser/git/components/Upload.tsx",
      },
    ],
  },
});
