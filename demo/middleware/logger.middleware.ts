import { ILogger, IMiddleware, Logger, Middleware } from '@midwayjs/core'
import { Context, NextFunction } from '../../src'

@Middleware()
export class LoggerMiddleware implements IMiddleware<Context, NextFunction> {
    @Logger()
    logger: ILogger

    resolve() {
        return async (req: Context, next: NextFunction) => {
            this.logger.warn('[logger-middleware]command started: %s', req.command)
            await next()
            this.logger.warn('[logger-middleware]command finished: %s', req.command)
        }
    }
}
