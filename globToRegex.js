module.exports = function globToRegex (glob) {
  var specialChars = '\\^$*+?.()|{}[]'
  var regexChars = ['^']
  for (var i = 0; i < glob.length; ++i) {
    var c = glob.charAt(i)
    switch (c) {
      case '?':
        regexChars.push('.')
        break
      case '*':
        regexChars.push('.*')
        break
      default:
        if (specialChars.indexOf(c) >= 0) {
          regexChars.push('\\')
        }
        regexChars.push(c)
    }
  }
  regexChars.push('$')
  return new RegExp(regexChars.join(''))
}
