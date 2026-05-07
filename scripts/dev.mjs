import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(rootDir, '..');

const tasks = [
  { name: 'backend', command: 'npm', args: ['run', 'dev'], cwd: path.join(workspaceRoot, 'backend') },
  { name: 'frontend', command: 'npm', args: ['run', 'dev'], cwd: path.join(workspaceRoot, 'frontend') },
];

for (const task of tasks) {
  const child = spawn(task.command, task.args, {
    cwd: task.cwd,
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: true,
  });

  child.stdout.on('data', (chunk) => {
    process.stdout.write(`[${task.name}] ${chunk}`);
  });

  child.stderr.on('data', (chunk) => {
    process.stderr.write(`[${task.name}] ${chunk}`);
  });

  child.on('exit', (code) => {
    if (code && code !== 0) {
      process.exitCode = code;
    }
  });
}

process.on('SIGINT', () => process.exit(0));
process.on('SIGTERM', () => process.exit(0));