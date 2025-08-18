const fs = require('fs');
const path = require('path');
const dataPath = path.join(__dirname, 'data.json');

const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
const now = new Date();

data.users = data.users.filter(u => !u.expiresAt || new Date(u.expiresAt) > now);

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
console.log('Expired users cleaned up.');
