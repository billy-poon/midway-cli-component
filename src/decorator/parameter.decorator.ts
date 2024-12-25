import { createCustomParamDecorator, MidwayDecoratorService } from '@midwayjs/core'
import { Context } from '../interface'

const KEY = 'midway-cli-component/decorator:command-parameter'

export interface ParameterOptions {
    key: string
}

export function createParameterDecorator(options: ParameterOptions): ParameterDecorator {
    return createCustomParamDecorator(KEY, options)
}

export function registerParameterHandler(decoratorService: MidwayDecoratorService) {
    decoratorService.registerParameterHandler(KEY, (options) => {
        const { metadata, originArgs } = options

        const { argv } = originArgs[0] as Context ?? {}
        const { key } = metadata as ParameterOptions ?? {}
        if (argv != null && key != null) {
            return argv[key]
        }
    })
}
