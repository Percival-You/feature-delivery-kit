#!/usr/bin/env node
/**
 * FDP Converge Check — stop hook
 * 检查 RTM pending P0；可选跑 testCommand；未收敛时 followup_message 循环
 */
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import {
  readStdin,
  loadConfig,
  parseRtmPendingP0,
  isSpecLockApproved,
  outputJson,
} from './fdp-hook-lib.mjs';

const input = await readStdin();
const cwd = input.cwd || process.cwd();
const config = loadConfig(cwd);

const empty = () => {
  outputJson({});
  process.exit(0);
};

if (!config.gate?.convergeOnStop) empty();

const status = input.status || 'completed';
if (status !== 'completed') empty();

const feature = config.activeFeature || '';
if (!feature) empty();

const docsRoot = config.docsRoot || '.kiro/docs/tech';
// Spec Lock 未批准前 RTM 全是 pending 属正常；Converge 仅在实现后（G3 通过）才检查
const lock = isSpecLockApproved(docsRoot, feature, cwd);
if (!lock.exists || !lock.approved) empty();

const rtmPath = path.join(cwd, docsRoot, feature, 'spec', 'rtm.md');
if (!fs.existsSync(rtmPath)) empty();

const pending = parseRtmPendingP0(fs.readFileSync(rtmPath, 'utf8'));
const issues = [];

if (pending.length > 0) {
  issues.push(`RTM 仍有 ${pending.length} 条 P0 pending：${pending.join(', ')}`);
}

const testCmd = (config.testCommand || '').trim();
if (testCmd && pending.length === 0) {
  try {
    execSync(testCmd, { cwd, stdio: 'pipe', timeout: 110000, shell: true });
  } catch (e) {
    const out = (e.stdout?.toString() || '') + (e.stderr?.toString() || '');
    issues.push(`测试未通过（${testCmd}）：${out.slice(0, 500)}`);
  }
}

if (issues.length === 0) empty();

const loopCount = input.loop_count ?? 0;
const maxLoop = config.gate?.convergeLoopLimit ?? 5;
if (loopCount >= maxLoop) {
  outputJson({
    followup_message: `[FDP Converge] 已达 loop_limit=${maxLoop}，请人工处理：\n${issues.join('\n')}\n\n请阅读 converge-report 或执行 #spec-converge 后手动继续。`,
  });
  process.exit(0);
}

outputJson({
  followup_message: `[FDP Converge 未收敛] 请继续完成以下项后更新 spec/rtm.md：\n${issues.map((x, i) => `${i + 1}. ${x}`).join('\n')}\n\n完成后将对应 AC 标为 implemented/verified。`,
});
process.exit(0);
