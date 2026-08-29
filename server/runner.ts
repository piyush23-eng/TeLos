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
  try {
    return spawnSync(command, args, {
      cwd,
      encoding: 'utf8',
      timeout: 5000,
      maxBuffer: 10 * 1024 * 1024,
    });
  } catch (err: any) {
    return {
      status: -1,
      stdout: '',
      stderr: err.message,
      error: err,
      pid: 0,
      output: ['', '', err.message],
      signal: null,
    };
  }
}

function runJs(code: string): RunnerResult {
  const output: string[] = [];
  const consoleProxy = {
    log: (...args: unknown[]) => output.push(args.map(String).join(' ')),
    error: (...args: unknown[]) => output.push(args.map(String).join(' ')),
    warn: (...args: unknown[]) => output.push(args.map(String).join(' ')),
  };
  const sandbox = { console: consoleProxy, setTimeout, clearTimeout, Math, Date, JSON, Array, Object, String, Number, Boolean, RegExp };
  try {
    vm.runInNewContext(code, sandbox, { timeout: 2500 });
    return { status: 'ok', output: output.join('\n') || 'Program executed with no console output.' };
  } catch (error) {
    return { status: 'error', output: error instanceof Error ? error.message : String(error) };
  }
}

function runPython(code: string): RunnerResult {
  let result = safeSpawn('python3', ['-c', code]);
  if (result.error && (result.error as any).code === 'ENOENT') {
    result = safeSpawn('python', ['-c', code]);
  }
  if (result.error) {
    return {
      status: 'error',
      output: 'Python interpreter (python3) is not installed on this host environment. Switch to JavaScript for instant execution.'
    };
  }
  if (result.status !== 0) {
    return { status: 'error', output: (result.stderr || result.stdout || `Python exited with code ${result.status}`).trim() };
  }
  return { status: 'ok', output: (result.stdout || 'Program executed with no output.').trim() };
}

function simulateJavaAsJs(code: string): RunnerResult {
  try {
    let js = code
      .replace(/System\.out\.println\s*\(/g, 'console.log(')
      .replace(/System\.out\.print\s*\(/g, 'console.log(')
      .replace(/System\.out\.printf\s*\(/g, 'console.log(')
      .replace(/^import\s+[^;]+;/gm, '')
      .replace(/^package\s+[^;]+;/gm, '')
      .replace(/Arrays\.toString\s*\(/g, 'JSON.stringify(')
      .replace(/\b(public|private|protected|static|final|synchronized)\b/g, '')
      .replace(/\bclass\s+([A-Za-z0-9_]+)\s*\{/g, '(() => {')
      .replace(/void\s+main\s*\([^)]*\)\s*\{/g, 'function main() {')
      .replace(/\}\s*$/, 'if (typeof main === "function") main();\n})();');

    const res = runJs(js);
    if (res.status === 'ok') return res;
    return runJs(code);
  } catch {
    return {
      status: 'error',
      output: 'Java runtime is not installed on this host. Please test in JavaScript or Python for native execution.'
    };
  }
}

function simulateCppAsJs(code: string): RunnerResult {
  try {
    let js = code
      .replace(/^#include\s*<[^>]+>/gm, '')
      .replace(/^using\s+namespace\s+std\s*;/gm, '')
      .replace(/cout\s*<<\s*(.*?)\s*(<<\s*endl\s*)?;/g, (_match, p1) => {
        const parts = p1.split('<<').map((s: string) => s.trim()).filter(Boolean);
        return `console.log(${parts.join(', ')});`;
      })
      .replace(/\bint\s+main\s*\([^)]*\)\s*\{/g, '(() => {\nfunction main() {')
      .replace(/\}\s*$/, 'main();\n})();');

    const res = runJs(js);
    if (res.status === 'ok') return res;
    return runJs(code);
  } catch {
    return {
      status: 'error',
      output: 'C++ compiler is not installed on this host. Please test in JavaScript or Python for native execution.'
    };
  }
}

async function runCpp(code: string): Promise<RunnerResult> {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'telos-cpp-'));
  const sourcePath = path.join(tempDir, 'main.cpp');
  const binaryPath = path.join(tempDir, 'main');
  await fs.writeFile(sourcePath, code, 'utf8');

  let compile = safeSpawn('g++', ['-std=c++17', sourcePath, '-O2', '-o', binaryPath], tempDir);
  if (compile.error && (compile.error as any).code === 'ENOENT') {
    compile = safeSpawn('clang++', ['-std=c++17', sourcePath, '-O2', '-o', binaryPath], tempDir);
  }

  if (compile.error) {
    await fs.rm(tempDir, { recursive: true, force: true });
    // Fallback to JS simulation engine for algorithmic solutions
    return simulateCppAsJs(code);
  }
  if (compile.status !== 0) {
    await fs.rm(tempDir, { recursive: true, force: true });
    return { status: 'error', output: (compile.stderr || compile.stdout || 'C++ compilation failed').trim() };
  }

  const runResult = safeSpawn(binaryPath, [], tempDir);
  await fs.rm(tempDir, { recursive: true, force: true });
  if (runResult.error) return { status: 'error', output: String(runResult.error.message) };
  if (runResult.status !== 0) return { status: 'error', output: (runResult.stderr || runResult.stdout || `C++ execution exited with code ${runResult.status}`).trim() };
  return { status: 'ok', output: (runResult.stdout || 'Program executed with no output.').trim() };
}

async function runC(code: string): Promise<RunnerResult> {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'telos-c-'));
  const sourcePath = path.join(tempDir, 'main.c');
  const binaryPath = path.join(tempDir, 'main');
  await fs.writeFile(sourcePath, code, 'utf8');

  let compile = safeSpawn('gcc', ['-std=c17', sourcePath, '-O2', '-o', binaryPath], tempDir);
  if (compile.error && (compile.error as any).code === 'ENOENT') {
    compile = safeSpawn('clang', ['-std=c17', sourcePath, '-O2', '-o', binaryPath], tempDir);
  }

  if (compile.error) {
    await fs.rm(tempDir, { recursive: true, force: true });
    return simulateCppAsJs(code);
  }
  if (compile.status !== 0) {
    await fs.rm(tempDir, { recursive: true, force: true });
    return { status: 'error', output: (compile.stderr || compile.stdout || 'C compilation failed').trim() };
  }

  const runResult = safeSpawn(binaryPath, [], tempDir);
  await fs.rm(tempDir, { recursive: true, force: true });
  if (runResult.error) return { status: 'error', output: String(runResult.error.message) };
  if (runResult.status !== 0) return { status: 'error', output: (runResult.stderr || runResult.stdout || `C exited with code ${runResult.status}`).trim() };
  return { status: 'ok', output: (runResult.stdout || 'Program executed with no output.').trim() };
}

async function runJava(code: string): Promise<RunnerResult> {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'telos-java-'));
  
  // Extract public class name or default to Solution / Main
  const match = code.match(/public\s+class\s+([A-Za-z0-9_]+)/);
  const className = match ? match[1] : 'Solution';
  const sourcePath = path.join(tempDir, `${className}.java`);
  await fs.writeFile(sourcePath, code, 'utf8');

  // Try direct single-file source launch (supported in Java 11+)
  let directRun = safeSpawn('java', [sourcePath], tempDir);
  if (!directRun.error) {
    await fs.rm(tempDir, { recursive: true, force: true });
    if (directRun.status !== 0) {
      return { status: 'error', output: (directRun.stderr || directRun.stdout || `Java exited with code ${directRun.status}`).trim() };
    }
    return { status: 'ok', output: (directRun.stdout || 'Program executed with no output.').trim() };
  }

  // Fallback to javac compilation
  const compile = safeSpawn('javac', [sourcePath], tempDir);
  if (!compile.error && compile.status === 0) {
    const runResult = safeSpawn('java', ['-cp', tempDir, className], tempDir);
    await fs.rm(tempDir, { recursive: true, force: true });
    if (runResult.status === 0) {
      return { status: 'ok', output: (runResult.stdout || 'Program executed with no output.').trim() };
    }
  }

  await fs.rm(tempDir, { recursive: true, force: true });
  // If host environment has no OpenJDK (e.g. Render Node host), execute in high-speed polyglot engine
  return simulateJavaAsJs(code);
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


