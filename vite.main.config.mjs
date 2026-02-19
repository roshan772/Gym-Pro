import { defineConfig } from "vite";
import path from "path";

export default defineConfig({
  build: {
    rollupOptions: {
      external: [
        "electron",
        "better-sqlite3",
        "bcryptjs",
        "date-fns",
        // Externalize our db module completely
        /.*database\/db.*/,
      ],
      output: {
        format: "cjs",
      },
    },
  },
  resolve: {
    alias: {
      "@database": path.resolve(__dirname, "src/database"),
    },
  },
});
