const { execSync } = require('child_process');
const path = require('path');

// Path to the kill-server.ps1 script
const killScriptPath = path.join(__dirname, '..', '..', 'kill-server.ps1');

try {
  // Run the kill-server.ps1 script
  console.log('Killing any processes using port 5000...');
  execSync(`powershell -File "${killScriptPath}"`, { stdio: 'inherit' });
  
  // Wait a moment for processes to fully terminate
  console.log('Waiting for processes to terminate...');
  setTimeout(() => {
    // Start nodemon
    console.log('Starting server...');
    require('child_process').spawn('nodemon', ['server.js'], {
      stdio: 'inherit',
      shell: true
    });
  }, 1000);
} catch (error) {
  console.error('Error starting server:', error.message);
} 