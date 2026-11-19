# 🚨 IMPORTANT: How to Run INSITE Locally

## ❌ Don't Use Live Server

**Live Server does NOT work** with this project because:
- Live Server only serves static HTML/CSS/JS files
- This project uses **PHP** for the secure API key endpoint
- PHP files need a PHP server to execute

## ✅ Use PHP Development Server Instead

### Quick Start:

```bash
cd /Users/ilyessmoudden/Documents/Insite/Map
./start-dev.sh
```

OR manually:

```bash
cd /Users/ilyessmoudden/Documents/Insite/Map
php -S localhost:8000
```

```Windows
   

cd C:\Users\Ilyess\iCloudDrive\Documents\Insite
```

Then open in your browser:
- **Main App:** http://localhost:8000/insite_main.html
- **Map View:** http://localhost:8000/index.html
- **Diagnostics:** http://localhost:8000/diagnostic-api.html

---

## Why This is Necessary

### The Problem:
Your project has a **secure API key system** that uses PHP:

```
Frontend (HTML/JS)
     ↓
  api-config.js
     ↓
  access_api_keys.php  ← This is PHP! Needs PHP server
     ↓
  local-config.php (or database)
     ↓
  Returns API key to frontend
```

### Live Server Issue:
- Live Server: `http://127.0.0.1:5500/insite_main.html`
- Tries to access: `http://127.0.0.1:5500/access_api_keys.php`
- **Result:** `Cannot GET /access_api_keys.php` ❌
- **Why:** Live Server can't execute PHP

### PHP Server Solution:
- PHP Server: `http://localhost:8000/insite_main.html`
- Accesses: `http://localhost:8000/access_api_keys.php`
- **Result:** PHP executes and returns JSON ✅

---

## Setup Checklist

Before running the server:

1. ✅ **API Key Configured**
   - File: `local-config.php` 
   - Contains your Google Maps API key
   
2. ✅ **PHP Installed**
   - Check: `php --version`
   - Should show PHP 7.4 or higher
   
3. ✅ **In Correct Directory**
   ```bash
   cd /Users/ilyessmoudden/Documents/Insite/Map
   ```

---

## Running the Project

### Option 1: Use the Script (Recommended)
```bash
./start-dev.sh
```

### Option 2: Manual PHP Server
```bash
php -S localhost:8000
```

### Option 3: Use a Different Port
```bash
php -S localhost:3000
```

Then update `api-config.js` line 16 to match your port.

---

## Troubleshooting

### "Cannot GET /access_api_keys.php"
- ❌ You're using Live Server
- ✅ Use PHP server instead

### "Failed to load map"
- Check console for specific error
- Verify `local-config.php` exists and has valid API key
- Open http://localhost:8000/diagnostic-api.html to test

### "PHP command not found"
- Install PHP: `brew install php` (macOS)
- Or use XAMPP/MAMP

### Port already in use
```bash
# Use a different port
php -S localhost:3000
```

---

## VS Code Setup (Optional)

If you want to use VS Code's "Open with Live Server" button, you need to:

1. **Install PHP Server Extension:**
   - Extension ID: `brapifra.phpserver`
   - Right-click HTML file → "PHP Server: Serve project"

2. **Or create a tasks.json:**
```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Start PHP Server",
      "type": "shell",
      "command": "php -S localhost:8000",
      "problemMatcher": [],
      "presentation": {
        "reveal": "always",
        "panel": "new"
      }
    }
  ]
}
```

Then run: `Terminal > Run Task > Start PHP Server`

---

## For Production Deployment

When you deploy to a real web server (with PHP support), the `api-config.js` will automatically:
- Detect production environment
- Use your production domain URL
- Connect to the production database
- Everything just works! ✨

---

## Quick Reference

| Environment | Server | URL | API Endpoint |
|------------|--------|-----|--------------|
| **Local Dev** | `php -S localhost:8000` | http://localhost:8000 | /access_api_keys.php |
| **Production** | Apache/Nginx + PHP | https://mapsinsite.com | https://mapsinsite.com/Map/access_api_keys.php |

---

## Summary

✅ **DO:** Use `php -S localhost:8000` or `./start-dev.sh`  
❌ **DON'T:** Use Live Server (it can't run PHP)

**The project works perfectly, you just need the right server!**

---

**Last Updated:** December 24, 2025
