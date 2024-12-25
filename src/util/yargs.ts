import { getMethodParamTypes, getPropertyType } from '@midwayjs/core'
import type { PositionalOptionsType } from 'yargs'
import { Class } from '../types'

export function inferType(theClass: Class, propertyKey: PropertyKey, parameterIndex?: number ): PositionalOptionsType | undefined {
    const type = parameterIndex != null
        ? (getMethodParamTypes(theClass, propertyKey as string) ?? [])[parameterIndex]
        : getPropertyType(theClass, propertyKey as string)

    if (type === String) {
        return 'string'
    } else if (type === Number) {
        return 'number'
    } else if (type === Boolean) {
        return 'boolean'
    }
}
