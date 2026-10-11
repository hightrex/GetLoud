/**
 * Shared utilities for all GetLoud automation scripts.
 * Import from any script with: import { ... } from './_utils.js';
 */

import fs from 'fs';
import readline from 'readline';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';

export const PROJECT_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..'
);

// ─── CLI flag helpers ──────────────────────────────────────────────────────────

/**
 * Get the value of a named CLI flag, e.g. --name "Ishan"
 * Returns defaultVal if the flag is absent or its value starts with '--'.
 */
export function getFlag(args, flag, defaultVal = null) {
  const idx = args.indexOf(flag);
  return idx !== -1 && args[idx + 1] && !args[idx + 1].startsWith('--')
    ? args[idx + 1]
    : defaultVal;
}

export function hasFlag(args, flag) {
  return args.includes(flag);
}

// ─── Interactive readline prompt ───────────────────────────────────────────────

export function ask(question, defaultValue = '') {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => {
    const prompt = defaultValue !== '' ? `${question} [${defaultValue}]: ` : `${question}: `;
    rl.question(prompt, answer => {
      rl.close();
      resolve(answer.trim() !== '' ? answer.trim() : defaultValue);
    });
  });
}

// ─── Safe JS string serializer ────────────────────────────────────────────────

/** Wraps a value in JSON.stringify so it is safe to embed in a .js file. */
export function jsStr(value) {
  return JSON.stringify(String(value ?? ''));
}

// ─── Build runner ──────────────────────────────────────────────────────────────

export function runBuild() {
  console.log('\n🔨 Running build verification...');
  try {
    execSync('npm run build', { cwd: PROJECT_ROOT, stdio: 'inherit' });
    return true;
  } catch {
    console.error('\n❌  Build failed — check the error above.');
    return false;
  }
}

// ─── Git helpers ───────────────────────────────────────────────────────────────

export function gitAddAll() {
  try {
    execSync('git add -A', { cwd: PROJECT_ROOT, stdio: 'pipe' });
  } catch (e) {
    console.warn('⚠️  git add failed:', e.message);
  }
}

export function gitCommit(message) {
  try {
    execSync(`git commit -m ${JSON.stringify(message)}`, {
      cwd: PROJECT_ROOT,
      stdio: 'inherit',
    });
    return true;
  } catch (e) {
    // Nothing to commit, or git not configured — not fatal
    console.warn('⚠️  git commit skipped (nothing new or git not configured).');
    return false;
  }
}

export function gitCommitAndLog(message) {
  console.log('\n📦 Committing to git...');
  gitAddAll();
  const committed = gitCommit(message);
  if (committed) {
    console.log('✅ Git commit created.');
  }
}

// ─── File helpers ──────────────────────────────────────────────────────────────

/** Read a JS data file as raw text. */
export function readDataFile(relPath) {
  return fs.readFileSync(path.join(PROJECT_ROOT, relPath), 'utf8');
}

/** Write a JS data file. */
export function writeDataFile(relPath, content) {
  fs.writeFileSync(path.join(PROJECT_ROOT, relPath), content, 'utf8');
}
