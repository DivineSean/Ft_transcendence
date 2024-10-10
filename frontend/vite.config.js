import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'

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
	server: {
		// https: {
		// 	key: fs.readFileSync('/home/certs/server-key.pem'),
		// 	cert: fs.readFileSync('/home/certs/server.pem'),
		// },
		port: 3000,
		strictPort: true,
		host: true,
		origin: "http://0.0.0.0:3000",
	},
})
