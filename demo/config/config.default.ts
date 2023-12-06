import { MidwayConfig } from '@midwayjs/core'

export default {
    cli: {
        yargs: {
            scriptName: 'my-demo-app',
            usage: '$0 <command> [...options] [...args]',
            version: '0.0.1',
        },
    },
    midwayLogger: {
        default: {
            level: 'info'
        },
    },
} as MidwayConfig
