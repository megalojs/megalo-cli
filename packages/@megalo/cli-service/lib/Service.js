
module.exports = class Server {
  constructor (context) {
    this.initialized = false
    this.context = context
    // 控制台传入过来的命令和参数
    this.commands = {}
  }

  init (mode = process.env.VUE_CLI_MODE) {
    if (this.initialized) {
      return
    }
    this.initialized = true
    this.mode = mode
  }

  async run (commandName, commandOptions = {}) {
    this.commands[commandName] = commandOptions
    console.log('命令:', this.commands[commandName])
  }
}
