const fs = require('fs');
const path = require('path');

const TEMP_PATH = path.join(__dirname, 'temp-store.json');
const MAX_AGE_MS = 1000 * 60 * 60; // 1 час

function cleanTempStore() {
  if (!fs.existsSync(TEMP_PATH)) return;
  const data = JSON.parse(fs.readFileSync(TEMP_PATH, 'utf8'));
  const now = Date.now();
  let changed = false;

  for (const key in data.temp) {
    if (data.temp[key].timestamp && now - data.temp[key].timestamp > MAX_AGE_MS) {
      delete data.temp[key];
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(TEMP_PATH, JSON.stringify(data, null, 2));
  }
}

// Для ручного запуска или через node temp-cleaner.js
if (require.main === module) {
  cleanTempStore();
}

module.exports = cleanTempStore;
