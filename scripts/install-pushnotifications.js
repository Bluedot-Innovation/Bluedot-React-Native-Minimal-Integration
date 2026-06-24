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
const BRANCH = 'dev/push';
const SUBDIR = 'bluedot-react-native-pushnotifications';
const TARGET = path.resolve(__dirname, '..', 'node_modules', SUBDIR);

// Skip if already installed with a valid package.json AND versions.gradle is present
const versionsGradlePath = path.resolve(__dirname, '..', 'node_modules', 'versions.gradle');
if (fs.existsSync(path.join(TARGET, 'package.json')) && fs.existsSync(versionsGradlePath)) {
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

  // Copy versions.gradle from repo root — the plugin's build.gradle references it via '../../versions.gradle'
  // which resolves to node_modules/versions.gradle when installed as an npm package.
  const versionsGradleSrc = path.join(tmpDir, 'versions.gradle');
  const versionsGradleDest = path.resolve(__dirname, '..', 'node_modules', 'versions.gradle');
  if (fs.existsSync(versionsGradleSrc)) {
    fs.copyFileSync(versionsGradleSrc, versionsGradleDest);
    console.log(`✓ versions.gradle copied to node_modules/`);
  } else {
    console.warn(`⚠ versions.gradle not found in repo root, creating empty placeholder`);
    fs.writeFileSync(versionsGradleDest, '// versions.gradle placeholder\n');
  }

  console.log(`✓ ${SUBDIR} installed successfully`);
} catch (err) {
  console.error(`✗ Failed to install ${SUBDIR}:`, err.message);
  process.exit(1);
}
