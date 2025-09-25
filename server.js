#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('Starting Greenix Backend Server...');
console.log('Node.js version:', process.version);

// Change to backend/server directory
const backendDir = path.join(__dirname, 'backend', 'server');

if (!fs.existsSync(backendDir)) {
    console.error('Error: backend/server directory not found');
    process.exit(1);
}

const packageJsonPath = path.join(backendDir, 'package.json');
const indexJsPath = path.join(backendDir, 'index.js');

if (!fs.existsSync(packageJsonPath)) {
    console.error('Error: package.json not found in backend/server directory');
    process.exit(1);
}

if (!fs.existsSync(indexJsPath)) {
    console.error('Error: index.js not found in backend/server directory');
    process.exit(1);
}

console.log('Backend directory:', backendDir);
console.log('Starting server...');

// Change working directory
process.chdir(backendDir);

// Start the server
const server = spawn('node', ['index.js'], {
    stdio: 'inherit',
    cwd: backendDir
});

server.on('close', (code) => {
    console.log(`Server process exited with code ${code}`);
    process.exit(code);
});

server.on('error', (err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
});