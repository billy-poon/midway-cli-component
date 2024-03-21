import { MidwayConfig } from '@midwayjs/core'

export default {
  cli: {
    yargs: {
      // usage: '$0 <command>',
      // strict: false,
      // strictCommands: false,
      strictOptions: false,
      // make sure `MidwayCLIFramework.destroy()` invoked
      exitProcess: false,
    }
  }
} as MidwayConfig
