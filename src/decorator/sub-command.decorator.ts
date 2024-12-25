import { listPropertyDataFromClass, savePropertyDataToClass } from '@midwayjs/core'
import { Class } from '../types'
import { CommandDefinition, CommandOptions } from './command.decorator'
import { listOption } from './option.decorator'
import { listPositional } from './positional.decorator'

const KEY = Symbol('midway-cli-component/decorator:sub-command')

type Meta = {
    key: PropertyKey,
    options: CommandOptions,
}

export function SubCommand(command: string): MethodDecorator
export function SubCommand(options?: CommandOptions): MethodDecorator
export function SubCommand(x?: string | CommandOptions): MethodDecorator {
    const options = typeof x === 'string'
        ? { command: x }
        : x ?? {}

    return (target, propertyKey) => {
        const meta: Meta = { key: propertyKey, options }
        savePropertyDataToClass(KEY, meta, target, propertyKey)
    }
}

export function listSubCommand(theClass: Class) {
    return (listPropertyDataFromClass(KEY, theClass) as Meta[])
        .map(({ key, options }): CommandDefinition => ({
            ...options,
            method: key,
            commandClass: theClass,
            options: listOption(theClass, key),
            positionals: listPositional(theClass, key),
        }))

}
