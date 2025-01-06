import { listPropertyDataFromClass, savePropertyDataToClass } from '@midwayjs/core'
import { Class } from '../types'
import { identity } from '../util/inflect'
import { inferType } from '../util/yargs'
import { createParameterDecorator } from './parameter.decorator'

interface ArgumentOptions {
    type?: string
}

export type DefinitionOf<T extends ArgumentOptions> = T & {
    key: string
    propertyKey?: PropertyKey
    parameterIndex?: number
}

export function createArgumentDecorator<T extends ArgumentOptions>(name?: string) {
    type Options = T & {
        key?: string
        parameterIndex?: number
    }

    type Meta = {
        key: PropertyKey
        options: Options
    }

    name = name ?? 'decorator'
    const KEY = `midway-cli-component/decorator:argument:${name}`
    const PARAMETER_KEY = `midway-cli-component/decorator:argument:${name}:parameter`

    function save(options?: T): PropertyDecorator
    function save(key: string, options?: T): PropertyDecorator & ParameterDecorator
    function save(x?: string | T, y?: T): PropertyDecorator | ParameterDecorator {
        const options = (
            typeof x === 'string' ? { ...y, key: x } : { ...x }
        ) as Options

        return (target, propertyKey, parameterIndex) => {
            if (propertyKey == null) {
                throw new Error('Can only decorate a class::method().')
            }

            const meta: Meta = {
                key: propertyKey,
                options: { ...options, parameterIndex }
            }
            if (parameterIndex == null) {
                savePropertyDataToClass(KEY, meta, target, propertyKey)
            } else if (options.key != null) {
                const key = options.key
                savePropertyDataToClass(PARAMETER_KEY, meta, target, propertyKey)
                createParameterDecorator({ key })(target, propertyKey, parameterIndex)
            }
        }
    }

    type Definition = DefinitionOf<T>

    function list(theClass: Class, theMethod?: PropertyKey) {
        const result = (listPropertyDataFromClass(KEY, theClass) as Meta[])
            .map(({ key, options }): Definition => ({
                ...options,
                key: options.key ?? identity(String(key)),
                type: options.type ?? inferType(theClass, key),
                propertyKey: key,
            }))

        if (theMethod != null) {
            const items = (listPropertyDataFromClass(PARAMETER_KEY, theClass) as Meta[])
                .filter(({ key }) => key === theMethod)
                .map(({ key, options }): Definition => ({
                    ...(options as Definition),
                    type: options.type ?? inferType(theClass, key, options.parameterIndex)
                }))
            result.push(...items)
        }

        return result
    }

    return { save, list }
}
