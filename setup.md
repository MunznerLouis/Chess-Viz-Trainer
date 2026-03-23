# Vite + React — Cheat Sheet

## Prerequisites
1. Download **Nodes.js LTS** from [https://nodejs.org](https://nodejs.org) (big green button)
2. Install it (npm comes bundled with it)
3. Restart your computer (optional)
4. Verify : 
```bash
node --version
npm --version
```

## Setup (one-time)
```bash
# Create project
npm create vite@latest chess-trainer -- --template react
cd chess-trainer
npm install
# Copy your .jsx into src/App.jsx
# Empty out src/App.css and src/index.css
```
---

## Daily commands
| Action | Command |
| --- | --- |
| Start dev server |`npm run dev` |
| Stop dev server |`Ctrl + C in terminal` |
| Restart dev server |`Ctrl + C then npm run dev`|
| Build for production |`npm run build` |
| Preview production build |`npm run preview` |

---

## Install packages
```bash
# Add a dependency
npm install <package-name>
# Add a dev dependency
npm install -D <package-name>
# Remove a package
npm uninstall <package-name>
# Reinstall everything (if node_modules is broken)
rm -rf node_modules
npm install
```

## Useful shortcuts
|Action| Command|
|---|---|
| Open in browser | http://localhost:5173 |
| Force refresh (cache bust) | Ctrl + Shift + R in browser |
| Clear Vite cache | npx vite --force |
| Check installed packages | npm list --depth=0 |
| Update all packages | npm update |

## Project structure

```
chess-trainer/
├── src/
│ ├── App.jsx ← your main component goes here
│ ├── App.css ← can be empty (inline styles)
│ ├── index.css ← can be empty
│ └── main.jsx ← entry point (don't touch)
├── index.html
├── package.json
└── vite.config.js
```

## Troubleshooting

|Problem | Fix|
|---|---|
|Port already in use | npx kill-port 5173 or use npm run dev -- --port 3000 |
|Module not found |npm install to reinstall deps |
|Changes not showing Hard refresh | Ctrl + Shift + R |
|Weird errors after git pull | rm -rf node_modules && npm install |
|Need to reset everything | Delete project, re-run setup |