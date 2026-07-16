#!/usr/bin/env node
/**
 * FDP Hook 公共库 — Spec Lock / Converge 共用
 */
import fs from 'fs';
import path from 'path';

export function readStdin() {
  return new Promise((resolve) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => { data += chunk; });
    process.stdin.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        resolve({});
      }
    });
  });
}

export function loadConfig(cwd) {
  const configPath = path.join(cwd, '.cursor', 'fdp.config.json');
  const examplePath = path.join(cwd, '.cursor', 'fdp.config.example.json');
  const kitExample = path.join(cwd, 'feature-delivery-kit', 'cursor', 'fdp.config.example.json');
  for (const p of [configPath, examplePath, kitExample]) {
    if (fs.existsSync(p)) {
      return JSON.parse(fs.readFileSync(p, 'utf8'));
    }
  }
  return {
    docsRoot: '.kiro/docs/tech',
    codePathGlobs: ['**/*'],
    activeFeature: '',
    gate: { specLockOnWrite: true, allowWriteWithoutActiveFeature: true },
    exemptWritePaths: ['**/spec/**', '**/.cursor/**'],
  };
}

export function normalizePath(p) {
  return p.replace(/\\/g, '/');
}

export function globToRegExp(glob) {
  const escaped = glob
    .replace(/\\/g, '/')
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*\*/g, '<<<GLOBSTAR>>>')
    .replace(/\*/g, '[^/]*')
    .replace(/<<<GLOBSTAR>>>/g, '.*');
  return new RegExp(`^${escaped}$`, 'i');
}

export function matchesAnyGlob(filePath, globs) {
  const norm = normalizePath(filePath);
  return globs.some((g) => globToRegExp(g).test(norm));
}

export function getWritePath(toolInput) {
  if (!toolInput || typeof toolInput !== 'object') return '';
  return toolInput.path || toolInput.file_path || toolInput.filePath || '';
}

export function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};
  const result = {};
  for (const line of match[1].split('\n')) {
    const m = line.match(/^(\w+):\s*(.+)$/);
    if (m) {
      let v = m[2].trim();
      if (v === 'true') v = true;
      if (v === 'false') v = false;
      result[m[1]] = v;
    }
  }
  return result;
}

export function isSpecLockApproved(docsRoot, feature, cwd) {
  const checklistPath = path.join(cwd, docsRoot, feature, 'spec', 'acceptance-checklist.md');
  if (!fs.existsSync(checklistPath)) return { exists: false, approved: false, complexity: 'standard' };
  const fm = parseFrontmatter(fs.readFileSync(checklistPath, 'utf8'));
  return {
    exists: true,
    approved: fm.approved === true,
    complexity: fm.complexity || 'standard',
  };
}

export function parseRtmPendingP0(rtmContent) {
  const pending = [];
  const lines = rtmContent.split('\n');
  for (const line of lines) {
    if (!line.trim().startsWith('|')) continue;
    if (/AC-ID/i.test(line) || /^[\s|:-]+$/.test(line.replace(/\|/g, ''))) continue;
    const cols = line.split('|').map((c) => c.trim()).filter(Boolean);
    if (cols.length < 2) continue;
    const acId = cols[0];
    if (!/^AC-/i.test(acId)) continue;
    const statusCol = cols.find((c) => /^(pending|todo|未开始|进行中)$/i.test(c))
      || cols[cols.length - 1];
    const priorityCol = cols.find((c) => /^P0$/i.test(c)) || cols[1];
    const isP0 = /P0/i.test(priorityCol) || /\[P0\]/i.test(line);
    const isPending = /pending|todo|未开始|进行中/i.test(statusCol);
    if (isP0 && isPending) pending.push(acId);
  }
  return [...new Set(pending)];
}

export function outputJson(obj) {
  process.stdout.write(JSON.stringify(obj));
}
