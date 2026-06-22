const fs = require('fs');
const os = require('os');
const path = require('path');
const {execFileSync, spawnSync} = require('child_process');

const packageName = 'bluedot-react-native-pushnotifications';
const repoRoot = path.resolve(__dirname, '..');
const pluginRepo = process.env.BLUEDOT_PLUGIN_REPO || path.resolve(repoRoot, '..', 'Bluedot-React-Native-Plugin');
const pluginBranch = process.env.BLUEDOT_PLUGIN_BRANCH || 'dev/push';
const packagePath = packageName;
const nodeModulesPackage = path.join(repoRoot, 'node_modules', packageName);
const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'bluedot-pushnotifications-'));

function runGitArchive() {
  return execFileSync('git', ['-C', pluginRepo, 'archive', pluginBranch, packagePath]);
}

function extractArchive(archive) {
  const result = spawnSync('tar', ['-xf', '-', '-C', tempRoot], {
    input: archive,
    stdio: ['pipe', 'inherit', 'inherit'],
  });

  if (result.status !== 0) {
    throw new Error(`Failed to extract ${packagePath} from ${pluginRepo}`);
  }
}

function installPackage() {
  const extractedPackage = path.join(tempRoot, packagePath);

  fs.rmSync(nodeModulesPackage, {force: true, recursive: true});
  fs.mkdirSync(path.dirname(nodeModulesPackage), {recursive: true});
  fs.cpSync(extractedPackage, nodeModulesPackage, {recursive: true});
}

try {
  extractArchive(runGitArchive());
  installPackage();
  console.log(`Installed ${packageName} from ${pluginRepo}#${pluginBranch}`);
} finally {
  fs.rmSync(tempRoot, {force: true, recursive: true});
}
