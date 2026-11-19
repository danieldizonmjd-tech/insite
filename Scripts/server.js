const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = 3000;

// Serve from project root so Stylesheet/, Img/, App/ etc. all resolve correctly
const PROJECT_ROOT = path.join(__dirname, '..');

// Load .env file from project root (no dotenv dependency needed)
function loadEnv() {
  try {
    const content = fs.readFileSync(path.join(PROJECT_ROOT, '.env'), 'utf8');
    content.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const eqIndex = trimmed.indexOf('=');
        if (eqIndex > 0) {
          const key = trimmed.slice(0, eqIndex).trim();
          const val = trimmed.slice(eqIndex + 1).trim();
          if (!process.env[key]) process.env[key] = val;
        }
      }
    });
  } catch (e) {
    // .env not found — rely on environment variables already set in the shell
  }
}
loadEnv();

app.use(express.static(PROJECT_ROOT));

// Replaces the PHP endpoint for local development
app.get('/access_api_keys.php', (req, res) => {
  const keyName = req.query.key;
  const keyMap = {
    'google_maps': process.env.GOOGLE_MAPS_API_KEY,
    'stripe':      process.env.STRIPE_PUBLISHABLE_KEY,
  };
  const apiKey = keyMap[keyName];
  if (!apiKey) {
    return res.status(404).json({ error: `Key '${keyName}' not found — add it to your .env file` });
  }
  res.json({ api_key: apiKey });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(PROJECT_ROOT, 'index.html'));
});

app.get('/USPS_Zip_Codes_enriched.geojson', (req, res) => {
  const filePath = path.join(__dirname, 'USPS_Zip_Codes_enriched.geojson');
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.sendFile(filePath);
});

app.listen(PORT, () => {
  console.log(`\n🚀 Server running at http://localhost:${PORT}`);
  console.log(`📍 Press Ctrl+C to stop\n`);
});
