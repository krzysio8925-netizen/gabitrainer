import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// `npm run build` produces one self-contained dist/index.html (scripts, styles and fonts inlined).
export default defineConfig({
  plugins: [react(), viteSingleFile()],
})
