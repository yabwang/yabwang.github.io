#!/usr/bin/env node
/**
 * 提交代码到远程：git add -A && git commit -m <message> && git push origin main
 * 用法：npm run push -- "feat: 描述"
 *       或：node scripts/push.js "feat: 描述"
 * 不传 message 时使用默认：chore: update
 */

import { execSync } from 'child_process';

const message = process.argv[2] || 'chore: update';
const safeMessage = message.replace(/"/g, '\\"');

try {
  execSync('git add -A', { stdio: 'inherit' });
  execSync(`git commit -m "${safeMessage}"`, { stdio: 'inherit' });
  execSync('git push origin main', { stdio: 'inherit' });
} catch (e) {
  process.exit(e.status || 1);
}
