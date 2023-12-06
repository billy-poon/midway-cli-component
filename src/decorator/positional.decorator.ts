import { PositionalOptions as Options } from 'yargs'
import { CommandCtor, CommandPropertyDecorator, Demand } from './types'
import { ICommand } from '../interface'
import { getPropertyType } from './utils'
import { listPropertyDataFromClass, savePropertyDataToClass } from '@midwayjs/core'

export type PositionalOptions = {
    key?: string
} & Options
export type PositionalOptionsRegistered = Demand<PositionalOptions, 'key'>

export const POSITIONAL_OPTION_KEY = Symbol.for('POSITIONAL_OPTION_KEY')

export function Positional(): CommandPropertyDecorator
export function Positional(defaultVal: string | number | boolean): CommandPropertyDecorator
export function Positional(options: PositionalOptions): CommandPropertyDecorator
export function Positional(options?: string | number | boolean | PositionalOptions): CommandPropertyDecorator {
    const opts: PositionalOptions = options == null
        ? {}
        : (typeof options === 'object'
            ? { ...options }
            : { default: options }
        )

    return <T extends ICommand>(target: T, propertyKey: string) => {
        const { key, ...rest } = opts
        if (rest.type == null) {
            const type = getPropertyType(target, propertyKey)
            if (type !== 'array') {
                rest.type = type
            }
        }
        const registered: PositionalOptionsRegistered = {
            key: key ?? propertyKey,
            ...rest
        }

        savePropertyDataToClass(POSITIONAL_OPTION_KEY, registered, target, propertyKey)
    }
}

export function getPositionalOptions(commandClz: CommandCtor): PositionalOptionsRegistered[] {
    return listPropertyDataFromClass(POSITIONAL_OPTION_KEY, commandClz)
}
