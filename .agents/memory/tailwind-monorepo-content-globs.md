---
name: Tailwind content globs in monorepo subfolders
description: Relative content paths in a tailwind.config.js that lives outside the process cwd resolve incorrectly — must resolve via the config file's own location.
---

When `tailwind.config.js` lives in a subdirectory (e.g. `client/`) but the dev/build command is run from the repo root (e.g. root `package.json` scripts calling `vite` with `root: 'client'`), relative globs like `['./index.html', './src/**/*.{js,ts,jsx,tsx}']` resolve against `process.cwd()` (the repo root), not the config file's directory. This silently matches zero files, producing the Tailwind warning "The `content` option in your Tailwind CSS configuration is missing or empty" and PostCSS errors like "The `dark:bg-...` class does not exist" for any custom/dark-mode classes.

**Why:** Tailwind resolves glob patterns from cwd unless given absolute paths; it does not automatically anchor to the config file's own directory.

**How to apply:** In `tailwind.config.js`, compute the config's own directory with `path.dirname(fileURLToPath(import.meta.url))` and join it with the content globs, e.g.:
```js
import path from 'path'
import { fileURLToPath } from 'url'
const __dirname = path.dirname(fileURLToPath(import.meta.url))
export default {
  content: [path.join(__dirname, 'index.html'), path.join(__dirname, 'src/**/*.{js,ts,jsx,tsx}')],
}
```
Apply this whenever the Tailwind config does not live at the same level as the process cwd used to run the dev/build command.
