import { MidwayConfig } from '@midwayjs/core'

export default {
  cli: {
    yargs: {
      // usage: '$0 <command>',
      // strict: false,
      // strictCommands: false,
      strictOptions: false,
    }
  }
} as MidwayConfig
