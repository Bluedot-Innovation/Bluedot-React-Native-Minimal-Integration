#!/usr/bin/env node
/**
 * Installs bluedot-react-native-pushnotifications from a subdirectory
 * of the Bluedot-React-Native-Plugin repository using git sparse-checkout.
 *
 * This is needed because npm does not natively support installing a
 * subdirectory of a GitHub repository as an npm package.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const REPO = 'git@github.com:Bluedot-Innovation/Bluedot-React-Native-Plugin.git';
const BRANCH = 'ak/push-fix';
const SUBDIR = 'bluedot-react-native-pushnotifications';
const TARGET = path.resolve(__dirname, '..', 'node_modules', SUBDIR);

// Skip if already installed with a valid package.json
if (fs.existsSync(path.join(TARGET, 'package.json'))) {
  console.log(`✓ ${SUBDIR} already installed, skipping`);
  process.exit(0);
}

const tmpDir = path.join(os.tmpdir(), `bluedot-plugin-${Date.now()}`);

function cleanup() {
  try { fs.rmSync(tmpDir, { recursive: true, force: true }); } catch (_) {}
}

process.on('exit', cleanup);
process.on('SIGINT', () => { cleanup(); process.exit(1); });

try {
  console.log(`Installing ${SUBDIR} via git sparse-checkout...`);

  execSync(
    `git clone --no-checkout --depth 1 --branch "${BRANCH}" "${REPO}" "${tmpDir}"`,
    { stdio: 'inherit' }
  );
  execSync(`git -C "${tmpDir}" sparse-checkout init --cone`, { stdio: 'inherit' });
  execSync(`git -C "${tmpDir}" sparse-checkout set "${SUBDIR}"`, { stdio: 'inherit' });
  execSync(`git -C "${tmpDir}" checkout`, { stdio: 'inherit' });

  fs.rmSync(TARGET, { recursive: true, force: true });
  fs.cpSync(path.join(tmpDir, SUBDIR), TARGET, { recursive: true });

  console.log(`✓ ${SUBDIR} installed successfully`);
} catch (err) {
  console.error(`✗ Failed to install ${SUBDIR}:`, err.message);
  process.exit(1);
}
