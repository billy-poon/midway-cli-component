import { App, Configuration, ILogger, IMidwayApplication, Logger } from '@midwayjs/core'
import * as cli from 'midway-cli-component'
import { join } from 'path'
import { LoggerMiddleware } from './middleware/logger.middleware'

@Configuration({
    imports: [cli],
    importConfigs: [
        join(__dirname, '/config/config.default.ts')
    ],
})
export class DemoConfiguration
{
    @App()
    app: IMidwayApplication

    @Logger()
    logger: ILogger

    async onReady() {
        this.logger.info('demo application ready')

        this.app.useMiddleware(LoggerMiddleware)
    }

    async onStop() {
        this.logger.info('demo application stopping')
    }
}
