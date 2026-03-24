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
npm install
npm run dev
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


## Useful shortcuts
|Action| Command|
|---|---|
| Open in browser | http://localhost:5173 |
| Force refresh (cache bust) | Ctrl + Shift + R in browser |
| Clear Vite cache | npx vite --force |
| Check installed packages | npm list --depth=0 |
| Update all packages | npm update |

## Troubleshooting

|Problem | Fix|
|---|---|
|Port already in use | npx kill-port 5173 or use npm run dev -- --port 3000 |
|Module not found |npm install to reinstall deps |
|Changes not showing Hard refresh | Ctrl + Shift + R |
|Weird errors after git pull | rm -rf node_modules && npm install |
|Need to reset everything | Delete project, re-run setup |