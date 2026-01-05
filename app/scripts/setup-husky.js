const { execSync } = require('child_process');
const path = require('path');

try {
  const gitRoot = execSync('git rev-parse --show-toplevel', { encoding: 'utf-8' }).trim();
  const huskyPath = path.join(gitRoot, '.husky');

  execSync(`git config --local core.hooksPath "${huskyPath}"`, { stdio: 'inherit' });

  console.log(`✓ Husky hooks configured: ${huskyPath}`);
} catch (error) {
  console.log('⚠ Husky setup skipped (not a git repository or git not available)');
}
