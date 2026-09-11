const { spawn } = require('child_process');
const path = require('path');

const rootDir = __dirname;
const backendDir = path.join(rootDir, 'backend');
const frontendDir = path.join(rootDir, 'frontend');

console.log('🚀 Launching Lead Discovery Platform...\n');

// 1. Start Backend Process
console.log('📦 [1/2] Starting Python FastAPI Backend on http://127.0.0.1:8000 ...');
const backendProcess = spawn('node', ['start-backend.js'], {
  cwd: backendDir,
  shell: true,
  stdio: 'inherit'
});

backendProcess.on('error', (err) => {
  console.error('❌ Failed to start backend:', err);
});

// 2. Start Frontend Process
console.log('💻 [2/2] Starting Next.js Frontend on http://localhost:3000 ...');
const frontendProcess = spawn('npm', ['run', 'dev'], {
  cwd: frontendDir,
  shell: true,
  stdio: 'inherit'
});

frontendProcess.on('error', (err) => {
  console.error('❌ Failed to start frontend:', err);
});

function cleanup() {
  console.log('\n🛑 Shutting down processes...');
  if (backendProcess && !backendProcess.killed) {
    backendProcess.kill();
  }
  if (frontendProcess && !frontendProcess.killed) {
    frontendProcess.kill();
  }
  process.exit();
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);
