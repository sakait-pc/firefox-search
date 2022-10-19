import type { UserConfig, ConfigEnv } from "vite";
import react from "@vitejs/plugin-react";
import { join } from "path";

const srcRoot = join(__dirname, "src");
// https://vitejs.dev/config/
export default ({ command }: ConfigEnv): UserConfig => {
  if (command === "serve") {
    return {
      root: srcRoot,
      base: "/",
      plugins: [react()],
    };
  } else {
    // command === "build"
    return {
      root: srcRoot,
      base: "./",
      plugins: [react()],
      build: {
        outDir: "../out",
        emptyOutDir: true,
      },
    };
  }
};
