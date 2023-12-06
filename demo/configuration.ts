import { Configuration } from '@midwayjs/core'
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
}
