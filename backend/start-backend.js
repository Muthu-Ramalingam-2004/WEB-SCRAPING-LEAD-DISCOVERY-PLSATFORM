const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const backendDir = __dirname;
const isWin = process.platform === 'win32';

let pythonExec = isWin ? 'python' : 'python3';

const winVenvPython = path.join(backendDir, '.venv', 'Scripts', 'python.exe');
const unixVenvPython = path.join(backendDir, '.venv', 'bin', 'python');

if (isWin && fs.existsSync(winVenvPython)) {
  pythonExec = winVenvPython;
} else if (!isWin && fs.existsSync(unixVenvPython)) {
  pythonExec = unixVenvPython;
}

console.log(`🐍 Starting Python FastAPI Backend using (${pythonExec})...`);
console.log(`🌐 Server will run at: http://127.0.0.1:8000`);
console.log(`🩺 Health check URL: http://127.0.0.1:8000/api/health\n`);

const uvicornArgs = ['-m', 'uvicorn', 'app.main:app', '--reload', '--host', '127.0.0.1', '--port', '8000'];

const pyProcess = spawn(`"${pythonExec}"`, uvicornArgs, {
  cwd: backendDir,
  shell: true,
  stdio: 'inherit'
});

pyProcess.on('error', (err) => {
  console.error('❌ Error launching backend process:', err);
});

pyProcess.on('exit', (code) => {
  if (code !== 0 && code !== null) {
    console.error(`⚠️ Backend process exited with code ${code}`);
  }
});
