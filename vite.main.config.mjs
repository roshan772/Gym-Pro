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
        "axios",
        "dotenv",
        // Externalize our db and device modules completely
        /.*database\/db.*/,
        /.*device\/deviceConfig.*/,
        /.*device\/hikvisionService.*/,
        /.*device\/deviceService.*/,
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
