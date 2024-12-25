import { App, Configuration, IMidwayApplication } from '@midwayjs/core'
import { join } from 'path'
import * as cli from '../src'
import { FormatMiddleware } from './middleware/format.middleware'
import { LoggerMiddleware } from './middleware/logger.middleware'

@Configuration({
    imports: [cli],
    importConfigs: [
        join(__dirname, '/config/config.default.ts')
    ],
})
export class DemoConfiguration {
    @App()
    app: IMidwayApplication

    async onReady() {
        this.app.useMiddleware([
            LoggerMiddleware,
            FormatMiddleware,
        ])
    }
}
