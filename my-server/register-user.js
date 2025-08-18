const http = require('http');

const [,, email, password] = process.argv;

if (!email || !password) {
  console.log('Usage: node register-user.js <email> <password>');
  process.exit(1);
}

const data = JSON.stringify({ email, password });

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = http.request(options, res => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', body);
  });
});

req.on('error', error => {
  console.error('Error:', error);
});

req.write(data);
req.end();


// node register-user.js user2@example.com mypassword
