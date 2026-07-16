#!/usr/bin/env node
/**
 * FDP Spec Lock Gate — preToolUse Write
 * 标准/复杂功能在 acceptance-checklist approved 前阻断业务代码写入
 */
import {
  readStdin,
  loadConfig,
  getWritePath,
  matchesAnyGlob,
  isSpecLockApproved,
  outputJson,
  normalizePath,
} from './fdp-hook-lib.mjs';

const input = await readStdin();
const cwd = input.cwd || process.cwd();
const config = loadConfig(cwd);

const allow = () => outputJson({ permission: 'allow' });
const deny = (msg) => outputJson({
  permission: 'deny',
  user_message: msg,
  agent_message: `FDP Spec Lock 门禁：${msg}。请先完成 spec-lock（#spec-lock）并取得用户确认 approved: true，或设置 fdp.config.json activeFeature 为空以关闭本 feature 门禁。`,
});

if (!config.gate?.specLockOnWrite) {
  allow();
  process.exit(0);
}

const toolName = input.tool_name || '';
if (toolName !== 'Write') {
  allow();
  process.exit(0);
}

const writePath = normalizePath(getWritePath(input.tool_input));
if (!writePath) {
  allow();
  process.exit(0);
}

const exempt = config.exemptWritePaths || [];
if (matchesAnyGlob(writePath, exempt)) {
  allow();
  process.exit(0);
}

const codeGlobs = config.codePathGlobs || [];
const isCodeWrite = matchesAnyGlob(writePath, codeGlobs);
if (!isCodeWrite) {
  allow();
  process.exit(0);
}

const feature = config.activeFeature || '';
if (!feature) {
  if (config.gate?.allowWriteWithoutActiveFeature !== false) {
    allow();
    process.exit(0);
  }
  deny('未设置 activeFeature，且配置禁止在无 feature 时写入代码路径');
  process.exit(0);
}

const lock = isSpecLockApproved(config.docsRoot || '.kiro/docs/tech', feature, cwd);
if (!lock.exists) {
  deny(`feature「${feature}」缺少 spec/acceptance-checklist.md，请先执行 #spec-lock`);
  process.exit(0);
}

if (lock.complexity === 'simple') {
  allow();
  process.exit(0);
}

if (!lock.approved) {
  deny(`feature「${feature}」Spec Lock 未批准（acceptance-checklist approved 须为 true）`);
  process.exit(0);
}

allow();
process.exit(0);
