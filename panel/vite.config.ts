import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// `npm run build` produces one self-contained dist/index.html (scripts, styles and fonts inlined).
// `base: './'` lets the panel live in any folder (on the site it is /panel/).
export default defineConfig({
  base: './',
  plugins: [react(), viteSingleFile()],
})
