import { MidwayConfig } from '@midwayjs/core'

export default {
    cli: {
        yargs: {
            scriptName: 'cli',
            // usage: '$0 <command> [...options] [...args]',
            // version: '0.0.1',
        },
    },
    midwayLogger: {
        default: {
            level: 'info',
            transports: {
                file: false,
                console: process.argv.includes('-s') ? false : undefined
            }
        },
    },
} as MidwayConfig
