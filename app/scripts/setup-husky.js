const { spawnSync } = require('node:child_process');
const path = require('node:path');

try {
  const gitRootResult = spawnSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf-8' });

  if (gitRootResult.status !== 0) {
    throw new Error('Not a git repository');
  }

  const gitRoot = gitRootResult.stdout.trim();
  const huskyPath = path.join(gitRoot, '.husky');

  const configResult = spawnSync('git', ['config', '--local', 'core.hooksPath', huskyPath], {
    stdio: 'inherit',
  });

  if (configResult.status === 0) {
    process.stdout.write(`✓ Husky hooks configured: ${huskyPath}\n`);
  }
} catch {
  process.stdout.write('⚠ Husky setup skipped (not a git repository or git not available)\n');
}
