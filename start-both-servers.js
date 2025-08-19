/*
 * DUAL SERVER STARTER - HOW TO RUN
 * =================================
 * 
 * STEP-BY-STEP COMMANDS:
 * 
 * 1. Open Command Prompt or Terminal
 * 
 * 2. Navigate to the project directory:
 *    cd c:\Users\alexs\Desktop\TestFolder\my-server
 * 
 * 3. Run the server starter script:
 *    node start-both-servers.js
 * 
 * ALTERNATIVE COMMANDS:
 * - Using npm: npm start (if you have a start script in package.json)
 * - Using nodemon: nodemon start-both-servers.js (for auto-restart during development)
 * 
 * WHAT YOU'LL SEE:
 * - "Backend server starting on port 3000..."
 * - After 5 seconds: "Frontend server starting on port 3001..."
 * 
 * ACCESS YOUR SERVERS:
 * - LOCAL ACCESS:
 *   Frontend: http://localhost:3001
 *   Backend API: http://localhost:3000
 * 
 * - NETWORK ACCESS (from phone/other devices):
 *   Frontend: http://192.168.100.45:3001
 *   Backend API: http://192.168.100.45:3000
 *   (Replace 192.168.100.45 with your computer's actual IP address)
 * 
 * TO FIND YOUR IP ADDRESS:
 * - Windows: ipconfig (look for IPv4 Address)
 * - Mac/Linux: ifconfig or ip addr
 * 
 * FIREWALL NOTICE:
 * - Windows may ask to allow Node.js through firewall - click "Allow"
 * - Make sure your phone is on the same WiFi network
 * 
 * TO STOP:
 * Press Ctrl+C in the terminal
 * 
 * REQUIREMENTS:
 * - Node.js must be installed
 * - Files needed: server.js, public/ folder with your frontend files
 */

<<<<<<< HEAD
// The file is empty. If you want to start both backend and frontend servers, use the following code:

import { spawn } from 'child_process';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

// Polyfill __dirname for ES module
const __dirname = dirname(fileURLToPath(import.meta.url));

// Start backend server on port 3000 (bind to all network interfaces)
const backend = spawn('node', [join(__dirname, 'server.js')], {
  stdio: 'inherit',
  env: { ...process.env, PORT: 3000, HOST: '0.0.0.0' }
});

console.log('Backend server starting on port 3000 (accessible from network)...');

setTimeout(() => {
  // Start static server on port 3001 (bind to all network interfaces)
  const publicPath = join(__dirname, 'public');
  const frontend = spawn('npx', ['serve', publicPath, '-l', '3001', '--single', '-s'], {
    stdio: 'inherit',
    shell: true
  });
  console.log('Frontend server starting on port 3001 (accessible from network)...');
  console.log('Access from phone: http://192.168.100.45:3001');
}, 5000);
=======
const { spawn } = require('child_process');
const { join } = require('path');

const BACKEND_PORT = process.env.PORT || 3000;
const FRONTEND_PORT = process.env.FRONTEND_PORT || 3001;

try {
  const backend = spawn(process.execPath, [join(__dirname, 'server.js')], {
    stdio: 'inherit',
    env: { ...process.env, PORT: BACKEND_PORT, HOST: '0.0.0.0' }
  });
  console.log(`Backend server starting on port ${BACKEND_PORT}...`);

  backend.on('exit', (code) => {
    console.log('Backend exited with', code);
  });

  // Start frontend static server after short delay
  setTimeout(() => {
    const publicPath = join(__dirname, 'public');
    const frontend = spawn('npx', ['serve', publicPath, '-l', String(FRONTEND_PORT)], {
      stdio: 'inherit',
      shell: true
    });
    console.log(`Frontend static server starting on port ${FRONTEND_PORT}...`);
    frontend.on('exit', (code) => {
      console.log('Frontend exited with', code);
    });
  }, 1000);
} catch (err) {
  console.error('Failed to start servers:', err);
}
>>>>>>> 5f1913e5ab8256d146bb1ead7784611a303847f4

// Tips:
// - Servers now bind to 0.0.0.0 to allow network access
// - Make sure your phone is on the same WiFi network as your computer
// - Windows Firewall may prompt - allow Node.js through the firewall
// - Use your computer's actual IP address instead of 192.168.100.45
// - If you see errors, check the terminal output for missing files or port conflicts.
<<<<<<< HEAD
=======
// - Use your computer's actual IP address instead of 192.168.100.45
// - If you see errors, check the terminal output for missing files or port conflicts.
>>>>>>> 5f1913e5ab8256d146bb1ead7784611a303847f4
