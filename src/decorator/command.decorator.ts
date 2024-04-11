import { CommonMiddleware, Provide, saveClassMetadata, saveModule } from '@midwayjs/core'
import { Context, ICommand, NextFunction } from '../interface'
import { CommandCtor, CommandDecorator, Demand } from './types'
import { toCommandKey } from './utils'

export const COMMAND_KEY = Symbol.for('COMMAND_KEY')

export type CommandOptions = {
    command?: string | readonly string[],
    description?: string | false,
    middlewares?: CommonMiddleware<Context, NextFunction, void>[],
    deprecated?: boolean | string,
}
export type CommandOptionsRegistered = Demand<CommandOptions, 'command'>

export function Command(): CommandDecorator
export function Command(command: string): CommandDecorator
export function Command(options: CommandOptions): CommandDecorator
export function Command(options?: string | CommandOptions, description?: string | false) {
    const opts: CommandOptions = typeof options === 'string'
        ? { command: options, description }
        : { ...options }
    return <T extends ICommand>(target: CommandCtor<T>) => {
        const { command, ...rest } = opts
        const registered: CommandOptionsRegistered = {
            command: command ?? toCommandKey(target.name),
            ...rest
        }

        saveModule(COMMAND_KEY, target)
        saveClassMetadata(COMMAND_KEY, registered, target)
        Provide()(target)
    }
}
