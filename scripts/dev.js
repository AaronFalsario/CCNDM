import { spawn } from 'node:child_process';

console.log('\x1b[36m%s\x1b[0m', 'Starting CCNDM Full Stack (Frontend + Backend)...');

const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';

const backend = spawn(npmCmd, ['--prefix', 'backend', 'run', 'dev'], {
  stdio: 'inherit',
  shell: true,
});

const frontend = spawn(npmCmd, ['run', 'dev:frontend'], {
  stdio: 'inherit',
  shell: true,
});

function cleanup() {
  try {
    backend.kill();
  } catch (error) {
    console.error('Failed to stop backend process:', error);
  }
  try {
    frontend.kill();
  } catch (error) {
    console.error('Failed to stop frontend process:', error);
  }
  process.exit();
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);
