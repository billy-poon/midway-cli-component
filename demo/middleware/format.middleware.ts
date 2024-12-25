import { Middleware } from '@midwayjs/core'
import { Application, Context, IMiddleware, NextFunction } from '../../src'

@Middleware()
export class FormatMiddleware implements IMiddleware {
    resolve(app: Application) {
        app.option('format', {
            choices: ['json', 'table'],
            description: 'output in JSON/Table format?',
        })

        return async (ctx: Context, next: NextFunction) => {
            const result = (await next()) ?? ctx.body
            if (result != null) {
                const { format } = ctx.argv
                if (format != null ) {
                    ctx.body = null
                    if (format === 'json') {
                        return `<JSON> ${JSON.stringify(result, null, 2)}`
                    } else if (format === 'table') {
                        return console.table(result)
                    }
                }
            }

            return result
        }
    }
}
