import { Options } from 'yargs'
import { CommandCtor, CommandPropertyDecorator, Demand } from './types'
import { ICommand } from '../interface'
import { getPropertyType } from './utils'
import { listPropertyDataFromClass, savePropertyDataToClass } from '@midwayjs/core'

export type NamedOptions = {
    key?: string
} & Options
export type NamedOptionsRegistered = Demand<NamedOptions, 'key'>

export const NAMED_OPTION_KEY = Symbol.for('NAMED_OPTION_KEY')

export function Option(): CommandPropertyDecorator
export function Option(defaultVal: string | number | boolean): CommandPropertyDecorator
export function Option(options: NamedOptions): CommandPropertyDecorator
export function Option(options?: string | number | boolean | NamedOptions): CommandPropertyDecorator {
    const opts: NamedOptions = options == null
        ? {}
        : (typeof options === 'object'
            ? { ...options }
            : { default: options }
        )

    return <T extends ICommand>(target: T, propertyKey: string) => {
        const { key, ...rest } = opts
        if (rest.type == null) {
            rest.type = getPropertyType(target, propertyKey)
        }
        const registered: NamedOptionsRegistered = {
            key: key ?? propertyKey,
            ...rest
        }

        savePropertyDataToClass(NAMED_OPTION_KEY, registered, target, propertyKey)
    }
}

export function getNamedOptions(commandClz: CommandCtor): NamedOptionsRegistered[] {
    const result: NamedOptionsRegistered[]
        = listPropertyDataFromClass(NAMED_OPTION_KEY, commandClz)

    const parent = Object.getPrototypeOf(commandClz)
    return parent != null
        ? getNamedOptions(parent).concat(result)
        : result
}
