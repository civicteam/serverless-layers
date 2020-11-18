const path = require('path');
const chalk = require('chalk');

class NodeJSRuntime {
  constructor(parent, runtime, runtimeDir) {
    this.parent = parent;
    this.plugin = parent.plugin;

    this.default = {
      runtime,
      runtimeDir,
      libraryFolder: 'node_modules',
      packageManager:  'npm',
      dependenciesPath: 'package.json',
      compatibleRuntimes: [runtimeDir],
      copyBeforeInstall: [
        '.npmrc',
        'yarn.lock',
        'package-lock.json'
      ],
      packageExclude: [
        'node_modules/**',
      ]
    };

    this.commands = {
      npm: 'npm install --production --only=prod',
      yarn: 'yarn --production'
    };
  }

  init() {
    const { dependenciesPath } = this.plugin.settings;

    const localpackageJson = path.join(
      process.cwd(),
      dependenciesPath
    );

    try {
      this.localPackage = require(localpackageJson);
    } catch (e) {
      this.plugin.log(`Error: Can not find ${localpackageJson}!`);
      process.exit(1);
    }
  }

  async isCompatibleVersion(runtime) {
    const osVersion = await this.parent.run('node --version');
    const [runtimeVersion] = runtime.match(/([0-9]+)\./);
    return {
      version: osVersion,
      isCompatible: osVersion.startsWith(`v${runtimeVersion}`)
    };
  }

  isDiff(depsA, depsB) {
    if (!depsA) {
      return true;
    }

    const depsKeyA = Object.keys(depsA);
    const depsKeyB = Object.keys(depsB);
    const isSizeEqual = depsKeyA.length === depsKeyB.length;

    if (!isSizeEqual) return true;

    let hasDifference = false;
    Object.keys(depsA).forEach(dependence => {
      if (depsA[dependence] !== depsB[dependence]) {
        hasDifference = true;
      }
    });

    return hasDifference;
  }

  getCompiledLayerPackageJson() {
    const { dependenciesPath } = this.plugin.settings;

    const layerPackageJsonPath = path.join(
      this.plugin.dependencies.getLayerPackageDir(),
      dependenciesPath
    );

    try {
      return require(layerPackageJsonPath);
    } catch (e) {
      this.plugin.log(`Error: Can not find ${layerPackageJsonPath}!`);
      process.exit(1);
    }
  }

  async hasDependencesChanged() {
    const remotePackage = await this.plugin.bucketService.downloadDependencesFile();

    let isDifferent = true;
    if (!remotePackage) {
      this.plugin.log('Remote package.json file not found!');
      return isDifferent;
    }

    const parsedRemotePackage = JSON.parse(remotePackage);
    const { dependencies, checksum } = parsedRemotePackage;
    this.plugin.log('Comparing package.json dependencies...');
    isDifferent = await this.isDiff(dependencies, this.localPackage.dependencies);
    if (isDifferent) {
      this.plugin.log(chalk.inverse.yellow(' Dependency list mismatch! '));
      return isDifferent;
    }

    if (this.plugin.settings.useChecksum) {
      this.plugin.log('Comparing package.json checksum...');
      const local = this.getCompiledLayerPackageJson();
      this.plugin.log(`Remote checksum: ${checksum}`);
      this.plugin.log(`Local checksum: ${local.checksum}`);
      isDifferent = checksum !== local.checksum;
      if (isDifferent) {
        this.plugin.log(chalk.inverse.yellow(' Checksum mismatch! '));
        return isDifferent;
      }
      this.plugin.log(chalk.inverse.green(' Checksums are identical! '));
    }

    return isDifferent;
  }
}

module.exports = NodeJSRuntime;
