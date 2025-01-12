import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path"

// https://vitejs.dev/config/

// export default defineConfig({
//   plugins: [react()],
// })

export default defineConfig({
  base: "/",
  plugins: [react()],
  preview: {
    port: 3000,
    strictPort: true,
  },
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
		},
	},
  server: {
    https:
      process.env.NODE_ENV === "development"
        ? {
            key: fs.readFileSync("/home/certs/server-key.pem"),
            cert: fs.readFileSync("/home/certs/server.pem"),
          }
        : false,
    port: 3000,
    strictPort: true,
    host: true,
    origin: "http://0.0.0.0:3000",
  },
});
