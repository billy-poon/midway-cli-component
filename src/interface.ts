import {
    IConfigurationOptions,
    IMidwayApplication,
    IMidwayContext
} from '@midwayjs/core'
import yargs from 'yargs'
import type { CLIContext } from './context'

type Argv = typeof yargs

export interface ICommand {
    run(): void | Promise<void>
}

export type Application = IMidwayApplication<Context, {
    plainArgv: string[]
} & Argv>

export type Context = IMidwayContext<CLIContext & {
    app: Application
}>

export type NextFunction = () => Promise<void>

type yargsConfiguration = Pick<
    { [K in keyof Argv]?: Argv[K] extends ((x: infer P) => Argv) ? P : never },
    'detectLocale' |
    'env' |
    'exitProcess' |
    'fail' |
    'help' |
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

export type IMidwayCLIOptions = {
    argv?: string[] | (() => string[])
    yargs?: yargsConfiguration
} & IConfigurationOptions
