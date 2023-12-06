import { Configuration } from '@midwayjs/core'
import { join } from 'path'

@Configuration({
  namespace: 'cli',
  importConfigs: [
    join(__dirname, 'config/config.default')
  ]
})
export class CLIConfiguration {
}
