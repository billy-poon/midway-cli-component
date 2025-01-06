import {
    CommonMiddleware,
    IMiddleware as CoreIMiddleware,
    NextFunction as CoreNextFunction,
    IConfigurationOptions,
    IMidwayApplication,
    IMidwayContext,
} from '@midwayjs/core'
import { ArgumentsCamelCase, Argv } from 'yargs'

export interface ICommand {
    exec(..._: any): any
}

export type IMidwayCliNextFunction = CoreNextFunction
export type NextFunction = IMidwayCliNextFunction

export type IMidwayCliContext = IMidwayContext<{
    argv: ArgumentsCamelCase
    body: unknown
    exitCode?: number
    command?: string
}>
export type Context = IMidwayCliContext

export type IMiddleware = CoreIMiddleware<IMidwayCliContext, IMidwayCliNextFunction, void>
export type IMidwayCliMiddleware = CommonMiddleware<IMidwayCliContext, IMidwayCliNextFunction, void>
export type Middleware = IMidwayCliMiddleware

export interface IMidwayCliApplication<T = object> extends IMidwayApplication<IMidwayCliContext, Argv<T>> {
    args: Args,
    interactive: () => Promise<number>
}

export type Application = IMidwayCliApplication


type YargsOptions = Pick<
    { [K in keyof Argv]?: Argv[K] extends ((x: infer P) => Argv) ? P : never },
    'detectLocale' |
    'env' |
    'epilog' |
    'epilogue' |
    // 'exitProcess' |
    'fail' |
    // 'help' |
    'locale' |
    'scriptName' |
    'showHelpOnFail' |
    'strict' |
    'strictCommands' |
    'strictOptions' |
    'usage' |
    'version' |
    'wrap'
>

type Factory<T> = T | (() => T | PromiseLike<T>)
type Args = string | readonly string[]
export interface IMidwayCliConfigurationOptions extends IConfigurationOptions {
    cwd?: string
    args?: Factory<Args>
    yargs?: YargsOptions
    prompt?: Factory<string>
}
