import { BaseFramework, Framework, MidwayLifeCycleService, getClassMetadata, getCurrentMainFramework, listModule } from '@midwayjs/core'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { CLIContext } from './context'
import { COMMAND_KEY, CommandOptionsRegistered } from './decorator/command.decorator'
import { getNamedOptions } from './decorator/option.decorator'
import { getPositionalOptions } from './decorator/positional.decorator'
import { CommandCtor } from './decorator/types'
import { Application, Context, IMidwayCLIOptions, NextFunction } from './interface'

const logNs = '[midway:cli]'

@Framework()
export class MidwayCLIFramework extends BaseFramework<
    Application,
    Context,
    IMidwayCLIOptions,
    NextFunction
> {
    configure() {
        return this.configService.getConfiguration('cli')
    }

    async applicationInitialize() {
        const {
            argv = resolveArgv,
            yargs: yargsOptions,
        } = this.configurationOptions

        const resolvedArgv = typeof argv === 'function'
            ? argv()
            : argv

        const app = yargs(resolvedArgv)
        if (yargsOptions != null) {
            Object.entries(yargsOptions)
                .forEach(([k, v]) => {
                    if (v != null) {
                        app[k](v)
                    }
                })
        }

        this.app = app as Application
        this.defineApplicationProperties({
            plainArgv: resolvedArgv
        })

        this.logger.info('%s initialized', logNs)
    }

    async run(): Promise<void> {
        const main = getCurrentMainFramework()
        if (main !== this) {
            throw new Error('The CLI framework should be run as the main framework.')
        }

        const modules = listModule(COMMAND_KEY) as CommandCtor[]
        for (const x of modules) {
            this.addCommand(x)
        }

        // Don't await this promise
        // to make LifeCycle message
        // `onServerReady` emitted before `onStop`
        Promise.resolve()
            .then(() => this.app.argv)
            .finally(() => this.destroy())

        this.logger.info('%s started', logNs)
    }

    async destroy() {
        const lifeCycle = await this.applicationContext
            .getAsync(MidwayLifeCycleService)
        await lifeCycle.stop()
    }

    async beforeStop(): Promise<void> {
        this.logger.info('%s stopping', logNs)
    }

    addCommand(commandClass: CommandCtor) {
        const {
            command,
            description = '',
            middlewares,
            deprecated,
        } = getClassMetadata<CommandOptionsRegistered>(COMMAND_KEY, commandClass)

        const commandName = typeof command === 'string'
            ? command
            : command[0] ?? '*'

        this.logger.info('%s adding command: %s', logNs, commandName)

        const named = getNamedOptions(commandClass)
        const positional = getPositionalOptions(commandClass)

        this.app.command(
            command,
            description as string,
            (yargs) => {
                this.logger.info('%s parsing command: %s', logNs, commandName)

                named.forEach(x => {
                    const { key, ...rest } = x
                    yargs.option(key, rest)
                })

                positional.forEach(x => {
                    const { key, ...rest } = x
                    yargs.positional(key, rest)
                })
            },
            async (argv) => {
                this.logger.info('%s executing command: %s', logNs, commandName)

                try {
                    const ctx = this.app.createAnonymousContext(
                        new CLIContext(command, argv)
                    )
                    ctx.app = this.app

                    const commandMiddleware = middlewares != null
                        ? await this.middlewareService.compose(middlewares, ctx.app)
                        : undefined

                    const rootMiddleware = await this.applyMiddleware(commandMiddleware)
                    await rootMiddleware(ctx, async() => {
                        const cmd = await ctx.requestContext.getAsync(commandClass)

                        ;[...named, ...positional].forEach(x => {
                            const { key } = x
                            const val = argv[key]
                            if (val != null) {
                                cmd[key] = val
                            }
                        })

                        await cmd.run()
                    })
                } finally {
                    this.logger.info('%s executed command: %s', logNs, commandName)
                }
            },
            undefined,
            deprecated
        )
    }
}

function resolveArgv() {
    return hideBin(process.argv)
}
