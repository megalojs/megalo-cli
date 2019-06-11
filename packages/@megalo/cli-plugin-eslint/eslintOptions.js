const baseExtensions = ['.js', '.jsx', '.vue']
exports.extensions = api => api.hasPlugin('typescript')
  ? baseExtensions.concat('.ts', '.tsx')
  : baseExtensions
