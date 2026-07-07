/** @type {import('electron-builder').Configuration} */
module.exports = {
  appId: 'local.yang-kura.audio-library',
  productName: 'Yang Kura',
  directories: {
    output: 'release',
    buildResources: 'assets'
  },
  files: [
    'dist/**/*',
    'dist-electron/**/*',
    'package.json',
    '!node_modules/**/*',
    '!release/**/*',
    '!dist-packaged/**/*',
    '!desktop-validation-bundle/**/*',
    '!tmp/**/*',
    '!cache/**/*',
    '!backups/**/*',
    '!data/**/*',
    '!logs/**/*',
    '!**/*.log',
    '!**/library-index.json',
    '!**/*.local',
    '!**/.env*'
  ],
  extraMetadata: {
    main: 'dist-electron/main.js'
  },
  asar: true,
  win: {
    target: [
      { target: 'portable', arch: ['x64'] },
      { target: 'nsis', arch: ['x64'] }
    ],
    artifactName: '${productName}-${version}-${arch}.${ext}'
  },
  portable: {
    artifactName: '${productName}-${version}-portable-${arch}.${ext}'
  },
  nsis: {
    oneClick: false,
    perMachine: false,
    allowToChangeInstallationDirectory: true,
    deleteAppDataOnUninstall: false,
    artifactName: '${productName}-${version}-setup-${arch}.${ext}'
  }
};
