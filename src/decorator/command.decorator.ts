import { getClassMetadata, listModule, Provide, saveClassMetadata, saveModule } from '@midwayjs/core'
import { Middleware } from '../interface'
import { Class } from '../types'
import { listOption, NamedDefinition } from './option.decorator'
import { listPositional, PositionalDefinition } from './positional.decorator'

const KEY = 'midway-cli-component/decorator:command'

export interface CommandOptions {
    name?: string
    aliases?: readonly string[]
    command?: string | readonly string[]
    description?: string | false
    deprecated?: boolean | string

    middlewares?: Middleware[]
    method?: PropertyKey
}

export function Command(command: string): ClassDecorator
export function Command(options?: CommandOptions): ClassDecorator
export function Command(x?: string | CommandOptions): ClassDecorator {
    const options = typeof x === 'string'
        ? { command: x }
        : x ?? {}

    return (target) => {
        saveModule(KEY, target)
        saveClassMetadata(KEY, options, target)

        Provide()(target)
    }
}

export type CommandDefinition = CommandOptions & {
    method?: PropertyKey
    commandClass: Class,
    options: NamedDefinition[]
    positionals: PositionalDefinition[]
}

export function listCommandClass() {
    return listModule(KEY) as Class[]
}

export function getCommandDefinition(theClass: Class): CommandDefinition {
    const options: CommandOptions | undefined = getClassMetadata(KEY, theClass)
    // if (options == null) {
    //     throw new Error('Not registered: ' + theClass.name)
    // }

    return {
        ...options,
        commandClass: theClass,
        options: listOption(theClass),
        positionals: listPositional(theClass),
    }
}
