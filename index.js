import noubu from 'dwt-noubu';
import tsto from 'vne-tsto';

function resolveKcdScripts() {
    if (pkg.name === 'kcd-scripts' ||
    // this happens on install of husky within kcd-scripts locally
    appDirectory.includes(path.join(__dirname, '..'))) {
      return require.resolve('./').replace(process.cwd(), '.');
    }
    return resolveBin('kcd-scripts');
  }
  
  // eslint-disable-next-line complexity
  function resolveBin(modName, {
    executable = modName,
    cwd = process.cwd()
  } = {}) {
    let pathFromWhich;
    try {
      pathFromWhich = fs.realpathSync(which.sync(executable));
      if (pathFromWhich && pathFromWhich.includes('.CMD')) return pathFromWhich;
    } catch (_error) {
      // ignore _error
    }
    try {
      if (modName === 'rollup') {
        // Rollup uses subpath exports without exporting package.json which is problematic
        // Convert to absolute path first
        const modPkgPathDist = require.resolve('rollup/dist/rollup.js');
        const modPkgDirDist = path.dirname(modPkgPathDist);
        modName = path.join(modPkgDirDist, '..');
      }
      const modPkgPath = require.resolve(`${modName}/package.json`);
      const modPkgDir = path.dirname(modPkgPath);
      const {
        bin
      } = require(modPkgPath);
      const binPath = typeof bin === 'string' ? bin : bin[executable];
      const fullPathToBin = path.join(modPkgDir, binPath);
      if (fullPathToBin === pathFromWhich) {
        return executable;
      }
      return fullPathToBin.replace(cwd, '.');
    } catch (error) {
      if (pathFromWhich) {
        return executable;
      }
      throw error;
    }
  }