const fs = require('fs');
const path = require('path');
const dataPath = path.join(__dirname, 'data.json');
const { cleanup } = require('./register-user');

const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
const now = new Date();

data.users = data.users.filter(u => !u.expiresAt || new Date(u.expiresAt) > now);

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
console.log('Expired users cleaned up.');

if (require.main === module) {
  // запуск из CLI
  console.log('Cleaning up old tokens...');
  cleanup();
  console.log('Done.');
} else {
  // экспорт для server.js
  module.exports = { cleanup };
}
