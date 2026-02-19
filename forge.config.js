module.exports = {
  packagerConfig: {
    asar: {
      unpack: "**/node_modules/better-sqlite3/**",
    },
  },
  rebuildConfig: {
    extraModules: ["better-sqlite3"],
  },
  makers: [
    { name: "@electron-forge/maker-squirrel", config: {} },
    { name: "@electron-forge/maker-zip", platforms: ["darwin"] },
    { name: "@electron-forge/maker-deb", config: {} },
    { name: "@electron-forge/maker-rpm", config: {} },
  ],
  plugins: [
    {
      name: "@electron-forge/plugin-auto-unpack-natives",
      config: {},
    },
    {
      name: "@electron-forge/plugin-vite",
      config: {
        build: [
          { entry: "src/main.js", config: "vite.main.config.mjs" },
          { entry: "src/preload.js", config: "vite.preload.config.mjs" },
        ],
        renderer: [{ name: "main_window", config: "vite.renderer.config.mjs" }],
      },
    },
  ],
};
