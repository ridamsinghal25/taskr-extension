import { defineManifest } from '@crxjs/vite-plugin'

export default defineManifest({
  manifest_version: 3,
  name: 'Taskr',
  version: '1.0.0',
  description: 'A task management tool',
  chrome_url_overrides: {
    "newtab": "index.html"
  },
  permissions: ['storage'],
  host_permissions: ['https://localhost:3000/*'],
  background: {
    service_worker: 'src/background/service-worker.ts',
    type: 'module',
  },
})
