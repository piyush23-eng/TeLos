import { createRequire } from 'node:module';
import { promises as fs } from 'node:fs';
import { spawnSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';

const require = createRequire(import.meta.url);
const vm = require('node:vm');

export type RunnerResult = {
  status: 'ok' | 'error';
  output: string;
};

function safeSpawn(command: string, args: string[], cwd?: string) {
  return spawnSync(command, args, {
    cwd,
    encoding: 'utf8',
    timeout: 5000,
    maxBuffer: 10 * 1024 * 1024,
  });
}

function runJs(code: string): RunnerResult {
  const output: string[] = [];
  const consoleProxy = {
    log: (...args: unknown[]) => output.push(args.map(String).join(' ')),
    error: (...args: unknown[]) => output.push(args.map(String).join(' ')),
  };
  const sandbox = { console: consoleProxy, setTimeout, clearTimeout, Math, Date, JSON, Array, Object, String, Number, Boolean, RegExp };
  try {
    vm.runInNewContext(code, sandbox, { timeout: 2000 });
    return { status: 'ok', output: output.join('\n') || 'No output.' };
  } catch (error) {
    return { status: 'error', output: error instanceof Error ? error.message : String(error) };
  }
}

function runPython(code: string): RunnerResult {
  const python = process.platform === 'win32' ? 'python' : 'python3';
  const result = safeSpawn(python, ['-c', code]);
  if (result.error) return { status: 'error', output: String(result.error.message) };
  if (result.status !== 0) return { status: 'error', output: (result.stderr || result.stdout || `Python exited with code ${result.status}`).trim() };
  return { status: 'ok', output: (result.stdout || 'No output.').trim() };
}

async function runCpp(code: string): Promise<RunnerResult> {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'telos-cpp-'));
  const sourcePath = path.join(tempDir, 'main.cpp');
  const binaryPath = path.join(tempDir, 'main');
  await fs.writeFile(sourcePath, code, 'utf8');

  const compile = safeSpawn('g++', ['-std=c++17', sourcePath, '-O2', '-o', binaryPath], tempDir);
  if (compile.error || compile.status !== 0) {
    await fs.rm(tempDir, { recursive: true, force: true });
    return { status: 'error', output: (compile.stderr || compile.stdout || String(compile.error?.message || 'C++ compilation failed')).trim() };
  }

  const runResult = safeSpawn(binaryPath, [], tempDir);
  await fs.rm(tempDir, { recursive: true, force: true });
  if (runResult.error) return { status: 'error', output: String(runResult.error.message) };
  if (runResult.status !== 0) return { status: 'error', output: (runResult.stderr || runResult.stdout || `C++ execution exited with code ${runResult.status}`).trim() };
  return { status: 'ok', output: (runResult.stdout || 'No output.').trim() };
}

async function runC(code: string): Promise<RunnerResult> {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'telos-c-'));
  const sourcePath = path.join(tempDir, 'main.c');
  const binaryPath = path.join(tempDir, 'main');
  await fs.writeFile(sourcePath, code, 'utf8');

  const compile = safeSpawn('gcc', ['-std=c17', sourcePath, '-O2', '-o', binaryPath], tempDir);
  if (compile.error || compile.status !== 0) {
    await fs.rm(tempDir, { recursive: true, force: true });
    return { status: 'error', output: (compile.stderr || compile.stdout || String(compile.error?.message || 'C compilation failed')).trim() };
  }

  const runResult = safeSpawn(binaryPath, [], tempDir);
  await fs.rm(tempDir, { recursive: true, force: true });
  if (runResult.error) return { status: 'error', output: String(runResult.error.message) };
  if (runResult.status !== 0) return { status: 'error', output: (runResult.stderr || runResult.stdout || `C exited with code ${runResult.status}`).trim() };
  return { status: 'ok', output: (runResult.stdout || 'No output.').trim() };
}

async function runJava(code: string): Promise<RunnerResult> {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'telos-java-'));
  const sourcePath = path.join(tempDir, 'Main.java');
  await fs.writeFile(sourcePath, code, 'utf8');

  const compile = safeSpawn('javac', [sourcePath], tempDir);
  if (compile.error || compile.status !== 0) {
    await fs.rm(tempDir, { recursive: true, force: true });
    return { status: 'error', output: (compile.stderr || compile.stdout || String(compile.error?.message || 'Java compilation failed')).trim() };
  }

  const runResult = safeSpawn('java', ['-cp', tempDir, 'Main'], tempDir);
  await fs.rm(tempDir, { recursive: true, force: true });
  if (runResult.error) return { status: 'error', output: String(runResult.error.message) };
  if (runResult.status !== 0) return { status: 'error', output: (runResult.stderr || runResult.stdout || `Java execution exited with code ${runResult.status}`).trim() };
  return { status: 'ok', output: (runResult.stdout || 'No output.').trim() };
}

export async function runCodeSnippet(code: string, language: string, _problemId: string): Promise<RunnerResult> {
  if (language === 'c') {
    return runC(code);
  }
  if (language === 'python') {
    return runPython(code);
  }
  if (language === 'cpp') {
    return runCpp(code);
  }
  if (language === 'java') {
    return runJava(code);
  }
  return runJs(code);
}
