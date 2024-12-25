// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../../index.d.ts" />

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
