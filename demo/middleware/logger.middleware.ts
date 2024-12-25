import { IMiddleware, Middleware } from '@midwayjs/core'
import { Context, NextFunction } from '../../src'

@Middleware()
export class LoggerMiddleware implements IMiddleware<Context, NextFunction> {
    resolve() {
        return async (ctx: Context, next: NextFunction) => {
            try {
                ctx.logger.warn('command started: %s', ctx.command)
                await next()
            } finally{
                ctx.logger.warn('command finished: %s', ctx.command)
            }
        }
    }
}
