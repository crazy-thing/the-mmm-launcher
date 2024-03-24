const { override, addWebpackExternals, disableChunk } = require('customize-cra');

module.exports = override(
  addWebpackExternals({ electron: "require('electron')" }),
  disableChunk()
);