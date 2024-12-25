import { BaseFramework, Framework, ILogger, MidwayLifeCycleService, getCurrentMainFramework } from '@midwayjs/core'
import { createInterface } from 'node:readline'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { CommandDefinition, getCommandDefinition, listCommandClass } from './decorator/command.decorator'
import { listSubCommand } from './decorator/sub-command.decorator'
import { Application, Context, IMidwayCliApplication, IMidwayCliConfigurationOptions, Middleware, NextFunction } from './interface'
import { Class } from './types'
import { noop } from './util/function'
import { identity } from './util/inflect'
import { wait } from './util/process'

const LOG_NS = '[midway-cli-component]'
function createNsLogger(proto: ILogger) {
    const levels = ['debug', 'info', 'warn', 'error']
    return new Proxy(proto, {
        get: (target, p, receiver) => {
            const result = Reflect.get(target, p, receiver)
            if (levels.includes(p as string)) {
                return (msg: any, ...args: any) => {
                    if (typeof msg === 'string') {
                        msg = `${LOG_NS} ${msg}`
                    }
                    return result.call(proto, msg, ...args)
                }
            }

            return result
        }
    })
}

const REQUEST_CONTEXT = Symbol('midway-cli-component/framework:context')
const REQUEST_COMMAND = Symbol('midway-cli-component/framework:command')
type ParsedArguments = {
    [REQUEST_CONTEXT]?: Context
    [REQUEST_COMMAND]?: string | number
}

/**
 * @see https://github.com/midwayjs/midway/blob/main/packages/web-express/src/framework.ts
 */
@Framework()
export class MidwayCliFramework extends BaseFramework<
    Application,
    Context,
    IMidwayCliConfigurationOptions,
    NextFunction
> {
    declare app: IMidwayCliApplication<ParsedArguments>

    clear() {
        console.clear?.()
    }

    stdout(...args: any) {
        console.log(...args)
    }

    stderr(...args: any) {
        console.error(...args)
    }

    configure() {
        return this.configService.getConfiguration('cli')
    }

    async applicationInitialize() {
        this.logger = createNsLogger(this.logger)

        const {
            cwd,
            args = defaultArgs,
            yargs: yargsOptions,
            prompt = defaultPrompt,
        } = this.configurationOptions

        const theArgs = typeof args === 'function'
            ? await args()
            : args

        const app = yargs(theArgs, cwd) as yargs.Argv<ParsedArguments>
        // yargs builtin `help|version` command hit
        app.exit = (code, err) => {
            if (!this.#interactive) {
                this.destroy(code, err)
            }
        }

        app.middleware((argv) => {
            const ctx = this.app.createAnonymousContext({
                argv,
                body: null,
                exitCode: undefined
            })
            ctx.logger = createNsLogger(ctx.logger)
            argv[REQUEST_CONTEXT] = ctx

            const [command] = argv._
            argv[REQUEST_COMMAND] = command
        })

        if (yargsOptions != null) {
            Object.entries(yargsOptions)
                .forEach(([k, v]) => {
                    const method = app[k]
                    if (typeof method === 'function') {
                        method.call(app, v)
                    }
                })
        }

        this.app = app as Application
        this.defineApplicationProperties({
            args: theArgs,
            prompt: async () => typeof prompt === 'function'
                ? await prompt() : prompt,
            interactive: () => this.interactive(),
            useMiddleware: (x: Middleware) => this.useMiddleware(x),
        })
        this.useMiddleware(async (ctx, next) => {
            const result = (await next()) ?? ctx.body
            if (result != null) {
                this.stdout(result)
            }
        })

        this.logger.info('initialized')
    }

    #startCb = noop
    async run(): Promise<void> {
        const classList = listCommandClass()
        classList.forEach(x => {
            this.registerCommandClass(x)
        })

        if (getCurrentMainFramework() === this) {
            // don't exit process before parsed
            this.#startCb = wait()
        }
    }

    async start() {
        try {
            this.logger.info('started')
            const argv = await this.app.parseAsync()

            // if yargs builtin command `help|version` hit
            if (this.#destroy) return;

            const { command, exitCode } = argv[REQUEST_CONTEXT] ?? {}
            if (command != null) {
                this.destroy(exitCode ?? 0)
            } else {
                const requestCommand = argv[REQUEST_COMMAND]
                if (requestCommand != null) {
                    this.#unknownCommand(requestCommand)
                } else {
                    this.interactive()
                        .finally(() => this.destroy(0))
                }
            }
        } catch(err) {
            this.destroy(-1, err)
        } finally {
            this.#startCb()
        }
    }

    #interactive = false
    async interactive() {
        if (this.#interactive) return;
        this.#interactive = true

        // https://nodejs.org/en/learn/command-line/accept-input-from-the-command-line-in-nodejs
        const dev = createInterface({
            input: process.stdin,
            output: process.stdout,
        })

        const app = this.app

        let exitCode: number | undefined
        const run = () => new Promise<void>((resolve, reject) => {
            app.prompt()
                .then((prompt) => {
                    dev.question(prompt, async (args) => {
                        try {
                            const argv = await app.parseAsync(args)
                            const { command, exitCode: code } = argv[REQUEST_CONTEXT] ?? {}
                            if (code != null) {
                                exitCode = code
                            }

                            if (command == null) {
                                const requestCommand = argv[REQUEST_COMMAND] as string
                                if (requestCommand != null) {
                                    if (['exit', 'quit', 'byte'].includes(requestCommand)) {
                                        return resolve()
                                    } else if (['clear', 'cls'].includes(requestCommand)) {
                                        this.clear()
                                    } else {
                                        this.#unknownCommand(requestCommand)
                                    }
                                }
                            }
                        } catch (err) {
                            this.stderr(err?.message ?? err)
                        }

                        await run()
                        resolve()
                    })
                })
                .catch(err => reject(err))
            // const prompt = await app.prompt()
            // dev.question(prompt, async (args) => {
            //     try {
            //         const argv = await app.parseAsync(args)
            //         const { command, exitCode: code } = argv[REQUEST_CONTEXT] ?? {}
            //         if (code != null) {
            //             exitCode = code
            //         }

            //         if (command == null) {
            //             const requestCommand = argv[REQUEST_COMMAND] as string
            //             if (requestCommand != null) {
            //                 if (['exit', 'quit', 'byte'].includes(requestCommand)) {
            //                     return resolve()
            //                 } else if (['clear', 'cls'].includes(requestCommand)) {
            //                     this.clear()
            //                 } else {
            //                     this.#unknownCommand(requestCommand)
            //                 }
            //             }
            //         }
            //     } catch(err) {
            //         this.stderr(err?.message ?? err)
            //     }

            //     await run()
            //     resolve()
            // })
        })

        await run().finally(() => dev.close())
        return exitCode ?? 0
    }

    #unknownCommand(command: unknown) {
        throw new Error('Unknown command: ' + command)
    }

    #destroy = false
    async destroy(exitCode: number, err?: any) {
        if (this.#destroy) return;

        this.#destroy = true
        process.exitCode = exitCode

        if (err != null) {
            this.stderr(err.message ?? err)
        }

        const cleanup = wait()
        try {
            const lifeCycle = await this.applicationContext
                .getAsync(MidwayLifeCycleService)
            await lifeCycle.stop()
        // } catch {
        } finally {
            this.logger.info('destroyed')
            cleanup()
        }
    }

    async beforeStop(): Promise<void> {
        this.logger.info('stopping')
    }

    registerCommandClass(theClass: Class) {
        const definition = getCommandDefinition(theClass)

        const parent = this.registerCommand(definition)
        const parentName = parent.split(' ', 2)[0]

        const children = listSubCommand(theClass)
        children.forEach(y => this.registerCommand(y, parentName))
    }

    registerCommand(definition: CommandDefinition, parentName?: string) {
        const {
            name,
            aliases,
            command,
            description,
            deprecated,
            commandClass,
            method = 'exec',
            options,
            positionals,
            middlewares,
        } = definition

        let theCommand = command
        if (theCommand == null) {
            let theName = name != null
                ? name : parentName == null
                    ? identity(commandClass.name, 'Command')
                    : identity(String(method), 'Command')

            if (parentName != null) {
                theName = `${parentName}/${theName}`
            }

            const thePositionals = positionals
                .map(({ key, demandOption }) => demandOption ? `<${key}>` : `[${key}]`)

            theCommand = [theName, ...thePositionals].join(' ')
            if (aliases != null) {
                theCommand = [theCommand, ...aliases]
            }
        }

        this.logger.info('register command: %s', theCommand)
        const result = typeof theCommand === 'string' ? theCommand : theCommand[0]
        this.app.command(
            theCommand,
            (description ?? false) as string,
            (yargs) => {
                this.logger.info('matched command: %s', result)
                options.forEach(x => yargs.option(x.key, x))
                positionals.forEach(x => yargs.positional(x.key, x))
            },
            async (argv) => {
                const { [REQUEST_CONTEXT]: ctx, ...rest } = argv
                if (ctx == null) return;

                ctx.logger.info('parsed argv: %o', rest)

                ctx.exitCode = 0
                ctx.command = result
                const commandMiddleware = middlewares != null
                    ? await this.middlewareService.compose(middlewares, ctx.getApp())
                    : undefined

                const rootMiddleware = await this.applyMiddleware(commandMiddleware)
                await rootMiddleware(ctx, async () => {
                    const command = await ctx.requestContext.getAsync(commandClass)

                    ;[...options, ...positionals].forEach(x => {
                        if (x.propertyKey != null) {
                            const val = argv[x.key]
                            if (val != null) {
                                (command as any)[x.propertyKey] = val
                            }
                        }
                    })

                    const args = argv._.slice(1)
                    const theMethod = command[method]
                    if (typeof theMethod === 'function') {
                        return await theMethod.call(command, ctx, ...args)
                    }

                    throw new Error(`Method not found: ${commandClass}::${String(method)}`)
                })
            },
            undefined,
            deprecated
        )

        return result
    }
}

function defaultArgs() {
    return hideBin(process.argv)
}

function defaultPrompt() {
    return '\n> '
}
