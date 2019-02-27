module.exports = (commandName, commandOptions, projectOptions) => {
  (commandOptions.platform === 'h5' ? require('./h5') : require('./mp'))(commandName, commandOptions, projectOptions)
}

