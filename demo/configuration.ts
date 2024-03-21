import { Configuration, ILogger, Logger } from '@midwayjs/core'
import * as cli from 'midway-cli-component'
import { join } from 'path'

@Configuration({
    imports: [cli],
    importConfigs: [
        join(__dirname, '/config/config.default.ts')
    ],
})
export class DemoConfiguration
{
    @Logger()
    logger: ILogger

    async onReady() {
        this.logger.info('demo application ready')
    }

    async onStop() {
        this.logger.info('demo application stopping')
    }
}
