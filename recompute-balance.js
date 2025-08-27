// recompute-balance.js
// Reads data.json, recomputes account.balance = sum(in) - sum(out), and writes data.json back.
const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'data.json');

function load() {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function save(data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function recompute() {
  const data = load();
  const expenses = Array.isArray(data.expenses) ? data.expenses : [];
  let sumIn = 0, sumOut = 0;
  for (const e of expenses) {
    const amt = Number(e.amount) || 0;
    const dir = (e.direction || 'in').toLowerCase();
    if (dir === 'in') sumIn += amt;
    else sumOut += amt;
  }
  const newBalance = sumIn - sumOut;
  console.log('Current file balance:', data.account && data.account.balance);
  console.log('Computed sumIn:', sumIn, 'sumOut:', sumOut, 'newBalance:', newBalance);
  if (!data.account) data.account = {};
  data.account.balance = newBalance;
  save(data);
  console.log('Wrote new balance to', file);
}

if (require.main === module) {
  recompute();
}

module.exports = { recompute };
