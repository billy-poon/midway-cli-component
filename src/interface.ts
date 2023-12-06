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

type yargsConfiguration = Pick<
    { [K in keyof Argv]?: Argv[K] extends ((x: infer P) => Argv) ? P : never },
    'env' | 'locale' | 'scriptName' |
    'strict' | 'strictCommands' | 'strictOptions' |
    'usage' | 'version' | 'wrap'
>

export type IMidwayCLIOptions = {
    argv?: string[] | (() => string[])
    yargs?: yargsConfiguration
} & IConfigurationOptions

declare module '@midwayjs/core/dist/interface' {
    interface MidwayConfig {
        cli?: IMidwayCLIOptions
    }
}
