import { writeFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { generateStats } from './stats.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const publicPath = join(__dirname, '../docs/public/stats.json');

async function main() {
  try {
    const stats = await generateStats();
    await writeFile(publicPath, JSON.stringify(stats, null, 2), 'utf-8');
    console.log('统计数据已生成:', stats);
  } catch (error) {
    console.error('生成统计数据失败:', error);
    process.exit(1);
  }
}

main();

